const request = require('request-promise');

const browseUrlPattern = 'https://{domain}.atlassian.net/browse/{ticketId}';
const transitionUrlPattern = 'https://{domain}.atlassian.net/rest/api/2/issue/{issueIdOrKey}/transitions';

class Jira {
    constructor(domain, username, authorisationToken) {
        this.domain = domain;
        this.username = username;
        this.authorisationToken = authorisationToken;

        if (this.domain) {
            this.browseUrl = browseUrlPattern.replace('{domain}', this.domain);
            this.transitionUrl = transitionUrlPattern.replace('{domain}', this.domain);
        }
    }

    get domain() {
        return this._domain;
    }

    set domain(domain) {
        this._domain = domain;
    }

    get username() {
        return this._username;
    }

    set username(username) {
        this._username = username;
    }

    get authorisationToken() {
        return this._authorisationToken;
    }

    set authorisationToken(authorisationToken) {
        this._authorisationToken = authorisationToken;
    }

    get browseUrl() {
        return this._browseUrl;
    }

    set browseUrl(browseUrl) {
        this._browseUrl = browseUrl;
    }

    get transitionUrl() {
        return this._transitionUrl;
    }

    set transitionUrl(transitionUrl) {
        this._transitionUrl = transitionUrl;
    }

    generateBrowseUrl(ticketId) {
        if (!(ticketId && this.domain)) {
            return null;
        }

        return this.browseUrl.replace('{ticketId}', ticketId);
    }

    transitionIssue(issueId, options) {
        if (!this.username) {
            throw new Error('Jira username is missing. Please check your configuration');
        }

        if (!this.authorisationToken) {
            throw new Error('Jira authorisation token is missing. Please check your configuration');
        }

        if (!issueId) {
            throw new Error('Issue id is missing');
        }

        if (!options || !Object.keys(options).length) {
            throw new Error('Missing options');
        }

        let uri = this.transitionUrl.replace('{issueIdOrKey}', issueId);

        let body = {
            method: 'POST',
            uri: uri,
            body: JSON.stringify(options),
            headers: {
                'content-type': 'application/json'
            },
            auth: {
                user: this.username,
                pass: this.authorisationToken
            }
        };

        // Reponse is 204 No content therefore no need of then statement
        return request(body)
            .catch((err) => {
                throw new Error('Can not transition issue ' + issueId + ' to ' + options.transition.id + '. Stack trace: ' + err);
            });
    }
}

module.exports = Jira;