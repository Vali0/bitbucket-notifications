var bitbucketNotifications = (function() {
    'use strict';

    const path = require('path');
    const configModule = require('./lib/config');

    const currentWorkingDirectory = process.cwd();
    const configurationPath = path.join(currentWorkingDirectory, 'config/default.json');
    let config = configModule.read(configurationPath);

    const bitbucketConfig = config.bitbucket;
    const gmailConfig = config.gmail;
    const jiraConfig = config.jira;

    const Bitbucket = require('./lib/Bitbucket');
    const Gmail = require('./lib/Gmail');
    const Jira = require('./lib/Jira');

    let bitbucket = new Bitbucket(bitbucketConfig);
    let gmail = new Gmail(gmailConfig);
    let jira = new Jira(jiraConfig);

    return {
        bitbucket: bitbucket,
        gmail: gmail,
        jira: jira
    };
}());

module.exports = bitbucketNotifications;