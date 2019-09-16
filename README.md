# bitbucket-notifications

[![NPM](https://nodei.co/npm/bitbucket-notifications.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/bitbucket-notifications/)

[![Build Status](https://travis-ci.org/Vali0/bitbucket-notifications.svg?branch=master)](https://travis-ci.org/Vali0/bitbucket-notifications)
[![dependencies Status](https://david-dm.org/Vali0/bitbucket-notifications/status.svg)](https://david-dm.org/Vali0/bitbucket-notifications)
[![devDependencies Status](https://david-dm.org/Vali0/bitbucket-notifications/dev-status.svg)](https://david-dm.org/Vali0/bitbucket-notifications?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/npm/bitbucket-notifications/badge.svg)](https://snyk.io/test/npm/bitbucket-notifications)
[![Coverage Status](https://coveralls.io/repos/github/Vali0/bitbucket-notifications/badge.svg?branch=master)](https://coveralls.io/github/Vali0/bitbucket-notifications?branch=master)
[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/bitbucket-notifications)

# Description
Have you wondered what tickets went in your release? Do you spend time to prepare a list of all tickets and share it with your client, development or QA team? Well this app may save you that time! By using modern features from ES6, popular services and OAuth2 authentication to keep your credentials secure we've made a tool which can get information from your bitbucket account and send the data via Gmail. It can also authenticate with your jira, add links to your tickets and edit them automatically.

## Example usage
If you have automated build process running on environment with node you can run this module to fetch all pull requests from bitbucket for given user and repository and send them via gmail

![alt text](https://raw.githubusercontent.com/Vali0/bitbucket-notifications/master/examples/notification.png)

# How to install?
Simply run `npm install bitbucket-notifications --save`

# Setup
In order to setup this module you have to do following steps
* In your working directory create a starting JavaScript file and config folder so you have the structure from examples
```
.
├── config
│   └── default.json
│   └── emailTemplate.pug // optional
└── index.js
```
* Inside config folder create new file called default.json with following parameters
```
{
    "bitbucket": {
        "clientId": "clientId",
        "clientSecret": "clientSecret",
        "accessToken": "accessToken",
        "refreshToken": "refreshToken"
    },
    "gmail": {
        "user": "user",
        "clientId": "clientId",
        "clientSecret": "clientSecret",
        "accessToken": "accessToken",
        "refreshToken": "refreshToken",
        "options" : { // Optional
            "templatePath": "emailTemplate.pug"
        }
    },
    "jira": {
        "domain": "domain",
        "selfHosted": false,
        "username": "username",
        "authorisationToken": "authorisationToken"
    }
}
```
* Inside default.json replace clientId, secret, access token and refresh token. Bitbucket allow you to obtain tokens without client confirmation. To do this you can use client.obtainTokens(). Despite Google services where you must consent rights. So you have to manualy obtain your refresh token by calling Google OAuth2. For Jira token you must generate API token for your username through Jira interface. gmail.options are optional if you want to add your own template you can place it in config folder with .pug extension and add this name to templatePath property. If you omit gmail.options.templatePath build in tempalte will be used.
* in your index.js write `var bbnotify = require('bitbucket-notifications');`. This will return an object with bitbucket, gmail and jira clients
* You are ready to go!

### For complete example please check examples folder in GitHub

# Docs
## Bitbucket
### obtainTokens()
Sends request to Bitbucket API in order to obtain access and refresh tokens tokens by given client id and client secret. Returns a promise.

In case of success new access and refresh tokens are set to Bitbucket instance.

In case of failure exception is thrown

This method is useful when you have only client id and secret and you do not have refresh token yet. Once obtained I would suggest you to use `refreshTokens` instead

```javascript
client.obtainTokens()
    .then(() => {
        console.log(client.accessToken);
        console.log(client.refreshToken);
    })
    .catch(err => {
        throw new Error('Something went wrong. Stack trace: ' + err);
    });
```

### refreshTokens()
Sends request to Bitbucket API in order to refresh access token for future requests. This function is called by default in case your request fail once when trying to access Bitbucket API. Returns a promise.

In case of success new access token is set to Bitbucket instance

In case of failure exception is thrown

There is no reason to call this method separately as it is called by default from this npm module when you try to access Bitbucket resource and your access token is expired. However you can call it before all yours API calls if you want.

```javascript
console.log(client.accessToken);

client.refreshTokens()
    .then(() => {
        console.log(client.accessToken);
    })
    .catch(err => {
        throw new Error('Something went wrong. Stack trace: ' + err);
    });
```

## PullRequests
### getPullRequests(options, callback)
Sends request to Bitbucket API in order to get all pull requests by given parameters. Returns a promise.
- `options`
    - `q (optional)` - Search query for get request based on [Bitbucket documentation](https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Busername%7D/%7Brepo_slug%7D/pullrequests). If present search will be performed for this query. If missing at least one of the following fields is required and query will be build internally with `AND` operator: state, updatedOn, destinationBranch
    - `state (required if q is missing)` - Pull request state: MERGED, SUPERSEDED, OPEN, DECLINED
    - `updatedOn (optional)` - an unquoted ISO-8601 date time string with the timezone offset, milliseconds and entire time component being optional
    - `destinationBranch (optional)` - destination branch name
    - `page (optional)` - page number if you want to skip pages
- `pullRequestsList` - Previously stored pull requests. Used in recursion when there is next page or if you want to append an already existing list to newly pulled one

Parameters must be an object with values based on Bitbucket API guidelines. In case of request failure because expired access token automatically calls `refreshTokens` from above and tries to refresh tokens. In case of success to refresh access token executes again `getPullRequests` with the same parameters. In case of failure to refresh access token throws an exception.

```javascript
pullRequests.getPullRequests({
        q: queryString
    })
    .then(pullRequestsList => {
            console.log(JSON.stringify(pullRequestsList));
    })
    .catch(err => {
        throw new Error('Something went wrong. Stack trace: ' + err);
    });
```

## Gmail

### compileTemplate(context)
Compiles template by given context. If template is missing from user configuration build in template will be used. Template engine is pug.

- `context` - Template context object. Build in template expects an following object
```Object
{
    data: pullRequestsList
}
```

If no error compiled template will be returned

In case of error exception will be thrown

```javascript
pullRequests.getPullRequests({
        q: queryString
    })
    .then(pullRequestsList => {
        let content = gmail.compileTemplate({
            data: pullRequestsList
        });
    });
```

### sendEmail(sender, recipients, subject, content)
Sends email to given list of recipients

- `sender` - String representation of sender's email
- `recipients` - an object with recipients emails
- `subject` - email subject
- `content` - html content

In case of success sends email

In case of failure exception is thrown

```javascript
let sender = 'jane.doe@gmail.com';
let recipientsObject = {
    to: ['john.doe@gmail.com'],
    cc: ['john.doe1@gmail.com', 'john.doe2@gmail.com'],
    bcc: ['john.doe3@gmail.com']
};
let subject = 'Merged pull requests in last 24h';

let handlebarsTemplate = handlebars.compile(template);
let content = handlebarsTemplate(pullRequestsList);

gmail.sendEmail(sender, recipientsObject, subject, content);
```

## Jira
### transitionIssue(issueId, options)
- `issueId` - Issue id from Jira
- `options` - Options as JavaScript object based on [Jira REST API](https://developer.atlassian.com/cloud/jira/platform/rest/#api-api-2-issue-issueIdOrKey-transitions-post) documentation

In case of success issue is transitioned by the given parameters

In case of failure exception is thrown

```javascript
pullRequests.getPullRequests({
        q: queryString
    })
    .then(pullRequestsList => {
        if (!Object.keys(pullRequestsList).length) {
            return;
        }

        let options = {
            transition: {
                id: 323 // The transition id from your Jira. You can get all possible transitions by making get request to https://{domain}/rest/api/2/issue/{issueId}/transitions
            }
        };

        for (let pullListKey in pullRequestsList) {
            let pullRequests = pullRequestsList[pullListKey];

            for (let pullRequest of pullRequests) {
                if (pullRequest.id) {
                    jira.transitionIssue(pullRequest.id, options);
                }
            }
        }
    })
```

# Dependencies
* `nodemailer` - used to send emails with Gmail
* `request` - OAuth2 and API requests
* `request-promise` - OAuth2 and API requests
* `moment` - used in example to fetch pull requests 24h hours behind in ISO-8601 format
* `pug` - used in example to generate email template for given context

# Roadmap
* Looking for ideas :)

# Known issues
* All TODO across the code
* Pull requests query to be build with different than AND operator
* Ability to pass standard date time or string to getPullRequests and internally convert them to ISO-8601 format
