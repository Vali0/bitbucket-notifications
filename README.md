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
* Create a configuration file in your working directory under config folder with filename default.json - config/default.json. It must have following format
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
        "refreshToken": "refreshToken"
    },
    "jira": {
        "domain": "domain",
        "username": "username",
        "authorisationToken": "authorisationToken"
    }
}
```
* In your working directory create a starting JavaScript file and config folder so you have the structure from examples
```
.
├── config
│   └── default.json
└── index.js
```
* Replace clientId, secret, access token and refresh token. Bitbucket allow you to obtain tokens without client confirmation. To do this you can use client.obtainTokens(). Despite Google services where you must consent rights. So you have to manualy obtain your refresh token by calling Google OAuth2
* in your index.js type `var bbnotify = require('bitbucket-notifications');`. This will return an object with bitbucket, gmail and jira clients
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
### getPullRequests(params, callback)
Sends request to Bitbucket API in order to get all pull requests by given parameters. Returns a promise.
- `params` - Query string parameters for get request. Based on [Bitbucket documentation](https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Busername%7D/%7Brepo_slug%7D/pullrequests)
- `callback` - Usually used as a callback parameter for recursion if there is more than one page of pull requests

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
### sendEmail(sender, recipients, subject, content)
Sends email to given list of recipients

- `sender` - String representation of sender's email
- `recipients` - an object with recipients emails
- `subject` - email subject
- `content` - html content

In case of success sends email

In case of failure exception is thrown

## Jira
### transitionIssue(issueId, options)
- `issueId` - Issue id from Jira
- `options` - Options as JavaScript object based on [Jira REST API](https://developer.atlassian.com/cloud/jira/platform/rest/#api-api-2-issue-issueIdOrKey-transitions-post) documentation

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

# Dependencies
* `nodemailer` - used to send emails with Gmail
* `request` - OAuth2 and API requests
* `request-promise` - OAuth2 and API requests
* `moment` - used in example to fetch pull requests 24h hours behind in ISO-8601 format
* `handlebars` - used in example to generate email template for given context

# Roadmap
* Ability to pass custom configs

# Known issues
* All TODO across the code
* Tokens do not update automatically in config json