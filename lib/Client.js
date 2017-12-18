const request = require('request-promise');
const PullRequests = require('./PullRequests');

const oAuthUrl = 'https://bitbucket.org/site/oauth2/access_token';

class Client {
    constructor(clientId, clientSecret) {
        this.id = clientId;
        this.secret = clientSecret;
        this.tokens;
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

    get tokens() {
        return this._tokens;
    }

    set tokens(tokens) {
        let credentials;
        try {
            credentials = JSON.parse(tokens);

            this._tokens = credentials;
        } catch (e) {
            throw new Error('Cannot parse tokens. Stack trace: ' + e);
        }
    }

    // TODO: Passs tokens from a file and use refresh token. Make a check to see if file is empty or not. If empty obtain tokens(feature)
    // Obtains new pair of tokens - access and refresh
    obtainTokens() {
        let body = buildRequestBody.call(this, {
            formBody: {
                'grant_type': 'client_credentials'
            }
        });

        return request(body)
            .then(data => {
                this.tokens = data;
            })
            .catch(err => {
                throw new Error('Can not fetch client tokens. Stack trace:' + err);
            });
    }

    // Refreshes tokens by existing refresh
    refreshTokens() {
        let refreshToken = this.tokens['refresh_token'];

        let body = buildRequestBody.call(this, {
            formBody: {
                'grant_type': 'refresh_token',
                'refresh_token': refreshToken
            }
        });

        return request(body)
            .then(data => {
                this.tokens = data;
            })
            .catch(err => {
                throw new Error('Can not refresh access token by given refresh: ' + this.tokens['refresh_token'] + '. Stack trace:' + err);
            });
    }

    // Append features to client object.
    // Intention behind this idea is to make different calls with single instance of client.
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