var bitbucketNotifications = (function() {
    'use strict';

    const config = require('config');
    
    const bitbucketConfig = config.get('bitbucket');
    const gmailConfig = config.get('gmail');
    const jiraConfig = config.get('jira');

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