# Issues Translate Chinese Action

> Issues markdown contains multiple languages and code, and we can only guess which one it is, but that's pretty inaccurate, so we will only check if it contains Chinese.

The action for translating Chinese issues content to English.

[中文文档](README_CN.md)

## Usage

> Use the default bot account @Issues-translate-bot

#### Create a workflow from this action

> Create file issue-translator.yml in .github/workflows/

```
name: 'issue-translator'
on:
  issue_comment:
    types: [created]
  issues:
    types: [opened]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: a631807682/issues-translate-chinese-action@v1.01
        with:
          IS_MODIFY_TITLE: false
          # not require, default false, . Decide whether to modify the issue title
          # if true, the robot account @Issues-translate-bot must have modification permissions, invite @Issues-translate-bot to your project or use your custom bot.
          CUSTOM_BOT_NOTE: Bot detected the issue body's language is not English, translate it automatically. 👯👭🏻🧑‍🤝‍🧑👫🧑🏿‍🤝‍🧑🏻👩🏾‍🤝‍👨🏿👬🏿
          # not require. Customize the translation robot prefix message.
```

## Advanced Custom

> Use your own bot by add BOT_GITHUB_TOKEN

1. Create a new github account as your bot

2. Use the account to generate a new token as BOT_GITHUB_TOKEN

3. Add the Secrets BOT_GITHUB_TOKEN = \${token} in your project

4. Create a workflow from this action(Create file issue-translator.yml in .github/workflows/)

```
name: 'issue-translator'
on:
  issue_comment:
    types: [created]
  issues:
    types: [opened]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: a631807682/issues-translate-chinese-action@v1.01
        with:
          BOT_GITHUB_TOKEN: ${{ secrets.BOT_GITHUB_TOKEN }}
          # Required, input your bot github token
          BOT_LOGIN_NAME: Issues-translate-bot
          # Not required, suggest not input, action will get name from BOT_GITHUB_TOKEN
          # If input, BOT name must match github token
```

## Other

1. invite @Issues-translate-bot to your project  
   Project -> Settings -> Manage access -> Invite a collaborator  
   Post an issue in [issues-translate-action](https://github.com/a631807682/issues-translate-chinese-action) to let me konw, the @Issues-translate-bot will join soon.

## DEMO

![action-sample](dist/action-sample.png)

**Have Fun!**
