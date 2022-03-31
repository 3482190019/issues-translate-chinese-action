import * as core from '@actions/core'
import * as github from '@actions/github'
import * as webhook from '@octokit/webhooks'
import translate from '@tomsun28/google-translate-api'

const cmn =
  /[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFA6D\uFA70-\uFAD9]|\uD81B[\uDFE2\uDFE3\uDFF0\uDFF1]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF38\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A]/g

async function run(): Promise<void> {
  try {
    if (
      (github.context.eventName !== 'issue_comment' ||
        github.context.payload.action !== 'created') &&
      (github.context.eventName !== 'issues' ||
        github.context.payload.action !== 'opened')
    ) {
      core.info(
        `The status of the action must be created on issue_comment, no applicable - ${github.context.payload.action} on ${github.context.eventName}, return`
      )
      return
    }
    let issueNumber = null
    let originComment = null
    let originTitle = null
    let issueUser = null
    let botNote =
      "Bot detected the issue body's language is not English, translate it automatically. 👯👭🏻🧑‍🤝‍🧑👫🧑🏿‍🤝‍🧑🏻👩🏾‍🤝‍👨🏿👬🏿"
    let isModifyTitle = core.getInput('IS_MODIFY_TITLE')
    let translateOrigin = null
    let needCommitComment = true
    let needCommitTitle = true
    if (github.context.eventName === 'issue_comment') {
      const issueCommentPayload = github.context
        .payload as webhook.EventPayloads.WebhookPayloadIssueComment
      issueNumber = issueCommentPayload.issue.number
      issueUser = issueCommentPayload.comment.user.login
      originComment = issueCommentPayload.comment.body
      if (originComment === null || originComment === 'null') {
        needCommitComment = false
      }
      needCommitTitle = false
    } else {
      const issuePayload = github.context
        .payload as webhook.EventPayloads.WebhookPayloadIssues
      issueNumber = issuePayload.issue.number
      issueUser = issuePayload.issue.user.login
      originComment = issuePayload.issue.body
      if (originComment === null || originComment === 'null') {
        needCommitComment = false
      }
      originTitle = issuePayload.issue.title
      if (originTitle === null || originTitle === 'null') {
        needCommitTitle = false
      }
    }

    // detect issue title comment body is english
    if (originComment !== null && !containsChinese(originComment, 0.2)) {
      needCommitComment = false
      core.info('Detect the issue comment body is english already, ignore.')
    }
    if (originTitle !== null && !containsChinese(originTitle, 0)) {
      needCommitTitle = false
      core.info('Detect the issue title body is english already, ignore.')
    }
    if (!needCommitTitle && !needCommitComment) {
      core.info('Detect the issue do not need translated, return.')
      return
    }
    if (needCommitComment && needCommitTitle) {
      translateOrigin = originComment + '@@====' + originTitle
    } else if (needCommitComment) {
      translateOrigin = originComment
    } else {
      translateOrigin = 'null@@====' + originTitle
    }

    // ignore when bot comment issue himself
    let botToken = core.getInput('BOT_GITHUB_TOKEN')
    let botLoginName = core.getInput('BOT_LOGIN_NAME')
    if (botToken === null || botToken === undefined || botToken === '') {
      // use the default github bot token
      const defaultBotTokenBase64 =
        'Y2I4M2EyNjE0NThlMzIwMjA3MGJhODRlY2I5NTM0ZjBmYTEwM2ZlNg=='
      const defaultBotLoginName = 'Issues-translate-bot'
      botToken = Buffer.from(defaultBotTokenBase64, 'base64').toString()
      botLoginName = defaultBotLoginName
    }

    // support custom bot note message
    let customBotMessage = core.getInput('CUSTOM_BOT_NOTE')
    if (customBotMessage !== null && customBotMessage.trim() !== '') {
      botNote = customBotMessage
    }

    let octokit = null
    if (
      botLoginName === null ||
      botLoginName === undefined ||
      botLoginName === ''
    ) {
      octokit = github.getOctokit(botToken)
      const botInfo = await octokit.request('GET /user')
      botLoginName = botInfo.data.login
    }
    if (botLoginName === issueUser) {
      core.info(
        `The issue comment user is bot ${botLoginName} himself, ignore return.`
      )
      return
    }

    core.info(`translate origin body is: ${translateOrigin}`)

    // translate issue comment body to english
    const translateTmp = await translateIssueOrigin(translateOrigin)

    if (
      translateTmp === null ||
      translateTmp === '' ||
      translateTmp === translateOrigin
    ) {
      core.warning('The translateBody is null or same, ignore return.')
      return
    }

    let translateBody: string[] = translateTmp.split('@@====')
    let translateComment = null
    let translateTitle = null

    core.info(`translate body is: ${translateTmp}`)

    if (translateBody.length == 1) {
      translateComment = translateBody[0].trim()
      if (translateComment === originComment) {
        needCommitComment = false
      }
    } else if (translateBody.length == 2) {
      translateComment = translateBody[0].trim()
      translateTitle = translateBody[1].trim()
      if (translateComment === originComment) {
        needCommitComment = false
      }
      if (translateTitle === originTitle) {
        needCommitTitle = false
      }
    } else {
      core.setFailed(`the translateBody is ${translateTmp}`)
    }

    // create comment by bot
    if (octokit === null) {
      octokit = github.getOctokit(botToken)
    }
    if (
      isModifyTitle === 'false' &&
      needCommitTitle === true &&
      needCommitComment == true
    ) {
      translateComment = ` 
> ${botNote}      
----  
**Title:** ${translateTitle}    

${translateComment}  
      `
    } else if (
      isModifyTitle === 'false' &&
      needCommitTitle === true &&
      needCommitComment == false
    ) {
      translateComment = ` 
> ${botNote}      
----  
**Title:** ${translateTitle}    
      `
    } else if (needCommitComment) {
      translateComment = ` 
> ${botNote}         
----    
${translateComment}  
      `
    } else {
      translateComment = null
    }

    if (isModifyTitle === 'true' && translateTitle != null && needCommitTitle) {
      await modifyTitle(issueNumber, translateTitle, octokit)
    }

    if (translateComment !== null) {
      await createComment(issueNumber, translateComment, octokit)
    }
    core.setOutput('complete time', new Date().toTimeString())
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

/**
 * Get the occurrence ratio of `expression` for `value`.
 *
 * @param {string} value
 *   Value to check.
 * @param {RegExp} expression
 *   Code-point expression.
 * @return {number}
 *   Float between 0 and 1.
 */
function getOccurrence(value: string, expression: RegExp): number {
  const count = value.match(expression)

  return (count ? count.length : 0) / value.length || 0
}

function containsChinese(body: string | null, percent: number): boolean | true {
  if (body === null) {
    return true
  }

  // remove comment
  body = body.replace(/<!--[\s\S]*?-->/g, '')
  const count = getOccurrence(body, cmn)
  return count > percent
}

async function translateIssueOrigin(body: string): Promise<string> {
  let result = ''
  await translate(body, {to: 'en'})
    .then(res => {
      if (res.text !== body) {
        result = res.text
      }
    })
    .catch(err => {
      core.error(err)
      core.setFailed(err.message)
    })
  return result
}

async function createComment(
  issueNumber: number,
  body: string | null,
  octokit: any
): Promise<void> {
  const {owner, repo} = github.context.repo
  const issue_url = github.context.payload.issue?.html_url
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body
  })
  core.info(
    `complete to push translate issue comment: ${body} in ${issue_url} `
  )
}

async function modifyTitle(
  issueNumber: number,
  title: string | null,
  octokit: any
): Promise<void> {
  const {owner, repo} = github.context.repo
  const issue_url = github.context.payload.issue?.html_url
  await octokit.issues.update({
    owner,
    repo,
    issue_number: issueNumber,
    title
  })
  core.info(
    `complete to modify translate issue title: ${title} in ${issue_url} `
  )
}

run()
