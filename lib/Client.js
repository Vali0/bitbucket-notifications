const request = require('request-promise');
const PullRequests = require('./PullRequests');

const oAuthUrl = 'https://bitbucket.org/site/oauth2/access_token';

class Client {
    constructor(clientId, clientSecret, accessToken, refreshToken) {
        this.id = clientId;
        this.secret = clientSecret;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    get id() {
        return this._id;
    }

    set id(clientId) {
        if (!clientId) {
            throw new Error('Client id is missing');
        }

        this._id = clientId;
    }

    get secret() {
        return this._secret;
    }

    set secret(clientSecret) {
        if (!clientSecret) {
            throw new Error('Client secret is missing');
        }

        this._secret = clientSecret;
    }

    get accessToken() {
        return this._accessToken;
    }

    set accessToken(accessToken) {
        if (!accessToken) {
            throw new Error('Access token is missing');
        }

        this._accessToken = accessToken;
    }

    get refreshToken() {
        return this._refreshToken;
    }

    set refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new Error('Refresh token is missing');
        }

        this._refreshToken = refreshToken;
    }

    // Obtains new pair of tokens - access and refresh
    obtainTokens() {
        let body = buildRequestBody.call(this, {
            formBody: {
                'grant_type': 'client_credentials'
            }
        });

        return request(body)
            .then(data => {
                try {
                    let tokens = JSON.parse(data);

                    // TODO: Write new tokens in config file
                    this.accessToken = tokens['access_token'];
                    this.refreshToken = tokens['refresh_token'];
                } catch (e) {
                    throw new Error('Cannot parse tokens. Stack trace: ' + e);
                }
            })
            .catch(err => {
                throw new Error('Can not fetch client tokens. Stack trace:' + err);
            });
    }

    // Refreshes tokens by existing refresh
    refreshTokens() {
        let refreshToken = this.refreshToken;

        let body = buildRequestBody.call(this, {
            formBody: {
                'grant_type': 'refresh_token',
                'refresh_token': refreshToken
            }
        });

        return request(body)
            .then(data => {
                try {
                    let tokens = JSON.parse(data);

                    // TODO: Write new tokens in config file
                    this.accessToken = tokens['access_token'];
                } catch (e) {
                    throw new Error('Cannot parse tokens. Stack trace: ' + e);
                }
            })
            .catch(err => {
                throw new Error('Can not refresh access token by given refresh: ' + this.refreshToken + '. Stack trace:' + err);
            });
    }

    // Append features to client object.
    // Intention behind this idea is to make different calls with single instance of the client.
    // e.g. request pull requests from different repositories with single client instance
    pullRequests(team, project) {
        return (new PullRequests(this, team, project));
    }
}

function buildRequestBody(configuration) {
    let options = {
        method: 'POST',
        uri: oAuthUrl,
        form: configuration.formBody,
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        auth: {
            user: this.id,
            pass: this.secret
        }
    };

    return options;
}

module.exports = Client;