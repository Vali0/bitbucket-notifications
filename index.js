function BitbucketNotifications() {
    'use strict';

    const configuration = require('./config');
    const Client = require('./lib/Client');
    const Gmail = require('./lib/Gmail');

    if (!(configuration.bitbucket.clientId && configuration.bitbucket.clientSecret && configuration.bitbucket.accessToken && configuration.bitbucket.refreshToken)) {
        throw new Error('Missing OAuth2 configuration for bitbucket in config.json');
    }

    if (!(configuration.gmail.user && configuration.gmail.clientId && configuration.gmail.clientSecret && configuration.gmail.accessToken && configuration.gmail.refreshToken)) {
        throw new Error('Missing OAuth2 configuration for gmail configuration.gmail.clientSecret');
    }

    var client = new Client(configuration.bitbucket.clientId, configuration.bitbucket.clientSecret, configuration.bitbucket.accessToken, configuration.bitbucket.refreshToken);
    var gmail = new Gmail(configuration.gmail.user, configuration.gmail.clientId, configuration.gmail.clientSecret, configuration.gmail.refreshToken);

    return {
    	bitbucketClient: client,
    	gmail: gmail
    };
}

exports.BitbucketNotifications = BitbucketNotifications;