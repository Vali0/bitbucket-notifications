var bitbucketNotifications = (function() {
    'use strict';

    const config = require('config');
    const bitbucketConfig = config.get('bitbucket');
    const gmailConfig = config.get('gmail');
    const Client = require('./lib/Client');
    const Gmail = require('./lib/Gmail');

    // No need to check for access token as it expires
    if (!(bitbucketConfig.clientId && bitbucketConfig.clientSecret && bitbucketConfig.refreshToken)) {
        throw new Error('Missing OAuth2 configuration for bitbucket in config.json');
    }

    // No need to check for access token as it expires
    if (!(gmailConfig.user && gmailConfig.clientId && gmailConfig.clientSecret && gmailConfig.refreshToken)) {
        throw new Error('Missing OAuth2 configuration for gmail configuration.gmail.clientSecret');
    }

    var client = new Client(bitbucketConfig.clientId, bitbucketConfig.clientSecret, bitbucketConfig.accessToken, bitbucketConfig.refreshToken);
    var gmail = new Gmail(gmailConfig.user, gmailConfig.clientId, gmailConfig.clientSecret, gmailConfig.accessToken, gmailConfig.refreshToken);

    return {
        bitbucketClient: client,
        gmail: gmail
    };
}());

module.exports = bitbucketNotifications;