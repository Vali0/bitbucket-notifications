# bitbucket-notifications
[![NPM](https://nodei.co/npm/bitbucket-notifications.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/bitbucket-notifications/)
[![Build Status](https://travis-ci.org/Vali0/bitbucket-notifications.svg?branch=master)](https://travis-ci.org/Vali0/bitbucket-notifications)
[![dependencies Status](https://david-dm.org/Vali0/bitbucket-notifications/status.svg)](https://david-dm.org/Vali0/bitbucket-notifications)
[![Known Vulnerabilities](https://snyk.io/test/npm/bitbucket-notifications/badge.svg)](https://snyk.io/test/npm/bitbucket-notifications)
[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/bitbucket-notifications)

# Description
Have you wondered what tickets went in your release? Do you spend time to prepare a list of all tickets and share it with your client, development or QA team? Well this app may save you that time! By using modern features from ES6, popular services and OAuth2 authentication to keep your credentials secure we've made a tool which can get information from your bitbucket account and send the data via Gmail

## Example usage
If you have automated build process running on environment with node you can run this module to fetch all pull requests from bitbucket for given user and repository and send them via gmail

# How to install?
Simply run `npm install bitbucket-notifications --save`

# Setup
In order to setup this module you have to do following steps
* Create a configuration file in your project root - config/default.json. It must have following format
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
        "domain": "domain"
    }
}
```
* In your project create a starting javascript file and config folder so you have the structure from examples
* Replace clientId, secret, access token and refresh token. Bitbucket allow you to obtain tokens without client confirmation. To do this you can use client.obtainTokens(). Despite Google services where you must consent rights. So you have to manualy obtain your refresh token by calling Google OAuth2
* in your index.js type `var bbnotify = require('bitbucket-notifications');`. This will return an object with bitbucket and gmail client
* You are ready to go!

### For complete example please check examples folder in GitHub

# Dependencies
* `config` - used for OAuth2 configuration. Client ids, client secrets, access and refresh tokens
* `nodemailer` - used to send emails with Gmail
* `request` - OAuth2 and API requests
* `request-promise` - OAuth2 and API requests
* `moment` - used in example to fetch pull requests 24h hours behind in ISO-8601 format
* `handlebars` - used in example to generate email template for given context

# Roadmap
* Implement jira authentication
* Add functions description in README
* Setup unit tests
* Fill up releases(set fix version to a ticket) automatically

# Known issues
* All TODO across the code
* PullRequests.getPullRequests do not refer to client.refreshTokens()
* Tokens do not update automatically in config json
* Nodemailer access token refresh for gmail