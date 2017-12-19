# bitbucket-notifications
[![NPM](https://nodei.co/npm/bitbucket-notifications.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/bitbucket-notifications/)

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
    }
}
```
* Replace clientId, secret, access token and refresh token. Bitbucket allow you to obtain tokens without client confirmation. To do this you can use client.obtainTokens(). Despite Google services where you must consent rights. So you have to manualy obtain your refresh token by calling Google OAuth2
* in your index.js type `var bbnotify = require('bitbucket-notifications');`. This will return an object with bitbucket and gmail client
* You are ready to go!

### For complete example you can check example.js and config/default.json GitHub

# Dependancies
* config - used for OAuth2 configuration
* moment - used in example
* nodemailer - used for Gmail
* request - OAuth2 and API requests
* request-promise

# Known issues
* All TODO across the code
* PullRequests.getPullRequests do not refer to client.refreshTokens()
* Tokens do not update automatically in config json
* Nodemailer access token refresh for gmail