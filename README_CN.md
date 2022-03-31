# Issues Translate Chinese Action

> 问题标记包含多种语言和代码，我们只能猜测是哪一种，但这是非常不准确的，所以这里只检查是否包含中文。

将包含中文 issue 实时翻译成英文 issue 的 action。

## 快速使用

> 使用默认的机器人账户 @Issues-translate-bot

#### 创建一个 github action

> 在仓库的 .github/workflows/ 下创建 issue-translator.yml 如下:

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
          # 非必须，决定是否需要修改issue标题内容
          # 若是true，则机器人账户@Issues-translate-bot必须拥有修改此仓库issue权限。可以通过邀请@Issues-translate-bot加入仓库协作者实现。
          CUSTOM_BOT_NOTE: Bot detected the issue body's language is not English, translate it automatically.
          # 非必须，自定义机器人翻译的前缀开始内容。
```

## 高级自定义

> 通过配置 BOT_GITHUB_TOKEN 使用自定义的机器人账户

1. 创建一个 github 账户作为您的机器人账户

2. 使用此账户生成对应的 token 作为 BOT_GITHUB_TOKEN

3. 将 BOT_GITHUB_TOKEN = ${token} 作为Secrets BOT_GITHUB_TOKEN = ${token} 配置到您的仓库中

4. 创建一个下面的 github action(在仓库的 .github/workflows/ 下创建 issue-translator.yml 如下)

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
          # 非必须，填写您的机器人github账户token
          BOT_LOGIN_NAME: Issues-translate-bot
          # 非必须，建议不填写，机器人名称会根据token获取到，若填写，请一定与token对应的github账户名相同
```

## 其它

1. 如何邀请@Issues-translate-bot 加入仓库协作者  
   Project -> Settings -> Manage access -> Invite a collaborator  
   在[issues-translate-action](https://github.com/a631807682/issues-translate-chinese-action)创建一个 issue 告知，之后@Issues-translate-bot 会加入您的仓库

## DEMO

![action-sample](dist/action-sample.png)

**Have Fun!**
