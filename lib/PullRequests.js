const request = require('request-promise');
const pullRequestsUrl = 'https://api.bitbucket.org/2.0/repositories/{username}/{repoSlug}/pullrequests';

class PullRequests {
    constructor(bitbucket, username, repoSlug, options) {
        this.bitbucket = bitbucket;
        this.username = username;
        this.repoSlug = repoSlug;
        this.pullRequestsUrl = pullRequestsUrl.replace('{username}', this.username).replace('{repoSlug}', this.repoSlug);
        this.options = options;
        this.retries = 0;
    }

    get username() {
        return this._username;
    }

    set username(username) {
        if (!username) {
            throw new Error('Username is missing');
        }

        this._username = username;
    }

    get repoSlug() {
        return this._repoSlug;
    }

    set repoSlug(repoSlug) {
        if (!repoSlug) {
            throw new Error('Repo slug is missing');
        }

        this._repoSlug = repoSlug;
    }

    get options() {
        return this._options;
    }

    set options(options) {
        options = options || {};
        options.regExp = options.regExp || /[a-zA-Z]+-[0-9]+/;
        options.addJiraLinks = options.addJiraLinks || false;
        options.jira = options.jira || undefined;

        this._options = options;
    }

    /*
     * Gets all pull requests
     *
     * @param {Object} parameters - Query parameters for GET request
     * @param {Object} pullRequestsList - Previously stored pull requests. Used in recursion when there is next page
     * @returns {Object|function} - serializedPullRequests if there is no next page return pull requests | this.getPullRequests if there is next page
     */
    getPullRequests(parameters, pullRequestsList) {
        let pullRequestsObj = pullRequestsList || {}; // Checks if there are pull requests from previous recursion. If there are takes them if not - creates new empty object
        let body = {
            method: 'GET',
            uri: this.pullRequestsUrl,
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            qs: parameters,
            auth: {
                bearer: this.bitbucket.accessToken
            }
        };

        return request(body)
            .then(data => {
                try {
                    let pullRequests = JSON.parse(data); // Parses pull requests from API response
                    let serializedPullRequests = serializePullRequestsData.call(this, pullRequests.values, pullRequestsObj);

                    // If there is next page make a recursion
                    if (pullRequests.next) {
                        parameters.page = parameters.page || 1;
                        parameters.page++;

                        return this.getPullRequests(parameters, serializedPullRequests);
                    }

                    return serializedPullRequests;
                } catch (e) {
                    // Set retries to one as it will bubble up to promise catch statement below.
                    // There it will retry once again which is not necessary as the problem is with parsing not with access token
                    this.retries = 1;
                    throw new Error('Can not parse pull requests. Stack trace: ' + e);
                }
            })
            .catch(err => {
                if (this.retries !== 0) {
                    this.retries = 0;
                    throw new Error('Maximum number of refresh token retries exceeded. Stack trace: ' + err);
                }

                this.retries++;

                // requires a return because it is a promise
                return this.bitbucket.refreshTokens()
                    .then(() => {
                        return this.getPullRequests(parameters, pullRequestsObj);
                    })
                    .catch(err => {
                        throw new Error('PullRequests: Can not refresh access token. Stack trace: ' + err);
                    });
            });
    }
}

function serializePullRequestsData(pullRequests, targetPullRequests) {
    let result = Object.assign({}, targetPullRequests); // Cloning target object so we don't change it by reference

    for (let item in pullRequests) {
        let pullRequest = pullRequests[item];
        let destinationBranch = pullRequest.destination.branch.name;

        result[destinationBranch] = result[destinationBranch] || [];

        let prTitle = pullRequest.title;
        let ticketId = prTitle.match(this.options.regExp);
        if (ticketId) {
            ticketId = ticketId[0];
        }

        let jiraUrl;

        if (this.options.jira && this.options.addJiraLinks && ticketId) {
            jiraUrl = this.options.jira.generateBrowseUrl(ticketId);
        }

        let prUrl = pullRequest.links.html.href;
        let authorDisplayName = pullRequest.author.display_name;
        let authorAccount = pullRequest.author.links.html.href;

        result[destinationBranch].push({
            title: pullRequest.title,
            id: ticketId,
            jiraUrl: jiraUrl || '#',
            prUrl: prUrl,
            author: {
                displayName: authorDisplayName,
                account: authorAccount
            }
        });
    }

    return result;
}

module.exports = PullRequests;