
# Issues Translate Action  

The action for translating non-English issues comment content to English.   


## Usage  

> Use the default bot @Issues-translate-bot  

#### Create a workflow from this action   

````
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
      - uses: tomsun28/issues-translate-action@v2.2
          

````


## Advanced Custom   

> Use your own bot by add BOT_GITHUB_TOKEN   
> 

1. Create a new github account as your bot  

2. Use the account to generate a new token as BOT_GITHUB_TOKEN  

3. Add the Secrets BOT_GITHUB_TOKEN = ${token} in your project  

4. Create a workflow from this action    
````
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
      - uses: tomsun28/issues-translate-action@v2.2
        with:
          BOT_GITHUB_TOKEN: ${{ secrets.BOT_GITHUB_TOKEN }} # required, input your bot github token
          # BOT_LOGIN_NAME: nameValue - not required, suggest not input, action will get name from BOT_GITHUB_TOKEN. If input, BOT name must match github token
          

````

## DEMO  

![action-sample](dist/action-sample.png)  

**Have Fun!**  





