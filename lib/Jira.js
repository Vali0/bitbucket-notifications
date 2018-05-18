const request = require('request-promise');

const browseUrl = 'https://{domain}.atlassian.net/browse/{ticketId}';
const transitionUrl = 'https://{domain}.atlassian.net/rest/api/2/issue/{issueIdOrKey}/transitions';

class Jira {
    constructor(domain, username, authorisationToken) {
        this.domain = domain;
        this.username = username;
        this.authorisationToken = authorisationToken;

        if (this.domain) {
            this.browseUrl = browseUrl.replace('{domain}', this.domain);
            this.transitionUrl = transitionUrl.replace('{domain}', this.domain);
        }
    }

    get authorisationToken() {
        return this._authorisationToken;
    }

    set authorisationToken(authorisationToken) {
        this._authorisationToken = authorisationToken;
    }

    generateBrowseUrl(ticketId) {
        if (!(ticketId && this.domain)) {
            return null;
        }

        return this.browseUrl.replace('{ticketId}', ticketId);
    }

    transitionIssue(issueId, transitionId) {
        let uri = this.transitionUrl.replace('{issueIdOrKey}', issueId);

        let body = {
            method: 'POST',
            uri: uri,
            body: JSON.stringify({
                transition: {
                    id: transitionId
                }
            }),
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
            .catch(err => {
                throw new Error('Can not transition issue ' + issueId + ' to ' + transitionId + '. Stack trace: ' + err);
            });
    }
}

module.exports = Jira;