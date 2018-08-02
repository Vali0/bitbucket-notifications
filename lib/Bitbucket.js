const request = require('request-promise');
const PullRequests = require('./PullRequests');
const configModule = require('./config');
const oAuthUrl = 'https://bitbucket.org/site/oauth2/access_token';

class Bitbucket {
    constructor(credentials) {
        this.id = credentials.clientId;
        this.secret = credentials.clientSecret;
        this.accessToken = credentials.accessToken;
        this.refreshToken = credentials.refreshToken;
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
            .then((data) => {
                try {
                    let tokens = JSON.parse(data);

                    this.accessToken = tokens.access_token;
                    this.refreshToken = tokens.refresh_token;

                    configModule.write([{
                        key: 'bitbucket.accessToken',
                        value: tokens.access_token
                    }, {
                        key: 'bitbucket.refreshToken',
                        value: tokens.refresh_token
                    }]);
                } catch (err) {
                    throw new Error(`Cannot parse tokens. Stack trace: ${err}`);
                }
            })
            .catch((err) => {
                throw new Error(`Can not fetch client tokens. Stack trace: ${err}`);
            });
    }

    // Refreshes tokens by existing refresh
    refreshTokens() {
        let body = buildRequestBody.call(this, {
            formBody: {
                'grant_type': 'refresh_token',
                'refresh_token': this.refreshToken
            }
        });

        return request(body)
            .then((data) => {
                try {
                    let tokens = JSON.parse(data);

                    this.accessToken = tokens.access_token;

                    configModule.write([{
                        key: 'bitbucket.accessToken',
                        value: tokens.access_token
                    }]);
                } catch (err) {
                    throw new Error(`Cannot parse tokens. Stack trace: ${err}`);
                }
            })
            .catch((err) => {
                throw new Error(`Can not refresh access token by given refresh: ${this.refreshToken}. Stack trace: ${err}`);
            });
    }

    /*
     * Append features to client object.
     * Intention behind this idea is to make different calls with single instance of the client.
     * E.g. request pull requests from different repositories with single client instance
     */
    pullRequests(username, repoSlug, options) {
        return new PullRequests(this, username, repoSlug, options);
    }
}

/**
 * Builds request body for bitbucket by given configuration
 *
 * @param {Object} configuration - form body configuration
 * @returns {String} options - Request body
 */
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

module.exports = Bitbucket;