function BitbucketNotifications() {
    'use strict';

    const config = require('config');
    const bitbucketConfig = config.get('bitbucket');
    const gmailConfig = config.get('gmail');
    const Client = require('./lib/Client');
    const Gmail = require('./lib/Gmail');

    if (!(bitbucketConfig.clientId && bitbucketConfig.clientSecret && bitbucketConfig.accessToken && bitbucketConfig.refreshToken)) {
        throw new Error('Missing OAuth2 configuration for bitbucket in config.json');
    }

    if (!(gmailConfig.user && gmailConfig.clientId && gmailConfig.clientSecret && gmailConfig.accessToken && gmailConfig.refreshToken)) {
        throw new Error('Missing OAuth2 configuration for gmail configuration.gmail.clientSecret');
    }

    var client = new Client(bitbucketConfig.clientId, bitbucketConfig.clientSecret, bitbucketConfig.accessToken, bitbucketConfig.refreshToken);
    var gmail = new Gmail(gmailConfig.user, gmailConfig.clientId, gmailConfig.clientSecret, gmailConfig.refreshToken);

    return {
        bitbucketClient: client,
        gmail: gmail
    };
}

// var test = BitbucketNotifications();
// console.log(test);

exports.BitbucketNotifications = BitbucketNotifications;