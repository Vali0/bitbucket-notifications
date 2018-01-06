const browseUrl = 'https://{domain}.atlassian.net/browse/{ticketId}';

class Jira {
    constructor (domain) {
        this.domain = domain;

        if(this.domain) {
            this.browseUrl = browseUrl.replace('{domain}', this.domain);
        }
    }

    generateBrowseUrl(ticketId) {
        if(!(this.domain && this.browseUrl)) {
            return null;
        }

        return this.browseUrl.replace('{ticketId}', ticketId);
    }
}

module.exports = Jira