var bitbucketNotifications = (function() {
    'use strict';

    const fs = require('fs');
    const path = require('path');

    const currentWorkingDirectory = process.cwd();
    const configurationPath = path.join(currentWorkingDirectory, 'config/default.json');
    
    // Personally I don't find reason to put try-catch here as error from fs.readFileSync itself is descriptive
    var configurationJSON = fs.readFileSync(configurationPath, 'utf8');

    var config;
    try {
        config = JSON.parse(configurationJSON);
    } catch (err) {
        throw new Error('Cant not parse configuration. Stack trace: ' + err);
    }

    const bitbucketConfig = config.bitbucket;
    const gmailConfig = config.gmail;
    const jiraConfig = config.jira;

    const Bitbucket = require('./lib/Bitbucket');
    const Gmail = require('./lib/Gmail');
    const Jira = require('./lib/Jira');

    // No need to check for access token as it expires
    if (!(bitbucketConfig.clientId && bitbucketConfig.clientSecret && bitbucketConfig.refreshToken)) {
        throw new Error('Missing OAuth2 configuration for bitbucket in config.json');
    }

    // No need to check for access token as it expires
    if (!(gmailConfig.user && gmailConfig.clientId && gmailConfig.clientSecret && gmailConfig.refreshToken)) {
        throw new Error('Missing OAuth2 configuration for gmail in config .json');
    }

    var bitbucket = new Bitbucket(bitbucketConfig.clientId, bitbucketConfig.clientSecret, bitbucketConfig.accessToken, bitbucketConfig.refreshToken);
    var gmail = new Gmail(gmailConfig.user, gmailConfig.clientId, gmailConfig.clientSecret, gmailConfig.accessToken, gmailConfig.refreshToken);
    var jira = new Jira(jiraConfig.domain);

    return {
        bitbucket: bitbucket,
        gmail: gmail,
        jira: jira
    };
}());

module.exports = bitbucketNotifications;