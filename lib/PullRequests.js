const request = require('request-promise');
const pullRequestsUrl = 'https://api.bitbucket.org/2.0/repositories/{username}/{repoSlug}/pullrequests';

class PullRequests {
    constructor(bitbucket, username, repoSlug, options) {
        this.bitbucket = bitbucket;
        this.username = username;
        this.repoSlug = repoSlug;
        this.pullRequestsUrl = pullRequestsUrl.replace('{username}', this.username).replace('{repoSlug}', this.repoSlug);
        this.options = options;
    }

    get username() {
        return this._username;
    }

    set username(username) {
        if (!username) {
            throw new Error('Username id is missing');
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
     * @param {Object} previousPullRequestsObj - Previously stored pull requests. Used in recursion when there is next page
     * @returns {Object|function} - pullRequestsObjMerged if there is no next page return pull requests | this.getPullRequests if there is next page
     */
    getPullRequests(parameters, previousPullRequestsObj) {
        let pullRequestsObj = previousPullRequestsObj || {}; // Checks if there are pull requests from previous recursion. If there are takes them if not - creates new empty object
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
                    let serializedPullRequests = serializePullRequestsData.call(this, pullRequests.values);
                    let pullRequestsObjMerged = mergeObjects(pullRequestsObj, serializedPullRequests); // Merges existing pull requests with new ones. Creates a new object. pullRequestsObj remains unmodified

                    // If there is next page make a recursion
                    if (pullRequests.next) {
                        parameters.page = parameters.page || 1;
                        parameters.page++;

                        return this.getPullRequests(parameters, pullRequestsObjMerged);
                    }

                    return pullRequestsObjMerged;
                } catch (e) {
                    throw new Error('Can not fetch pull requests. Stack trace: ' + e);
                }
            })
            .catch(err => {
                throw new Error('Can not fetch pull requests. Stack trace: ' + err);
            });
    }
}

function serializePullRequestsData(pullRequests) {
    let serializedPullRequests = {};

    for (let item in pullRequests) {
        let pullRequest = pullRequests[item];
        let destinationBranch = pullRequest.destination.branch.name;

        serializedPullRequests[destinationBranch] = serializedPullRequests[destinationBranch] || [];

        let prTitle = pullRequest.title;
        let ticketId = prTitle.match(this.options.regExp);
        let jiraUrl;

        if (this.options.jira && this.options.addJiraLinks && ticketId) {
            jiraUrl = this.options.jira.generateBrowseUrl(ticketId);
        }

        let prUrl = pullRequest.links.html.href;
        let authorDisplayName = pullRequest.author.display_name;
        let authorAccount = pullRequest.author.links.html.href;

        serializedPullRequests[destinationBranch].push({
            title: pullRequest.title,
            id: ticketId,
            jiraUrl: jiraUrl || '#',
            prUrl: prUrl || '#',
            author: {
                displayName: authorDisplayName,
                account: authorAccount
            }
        });
    }

    return serializedPullRequests;
}

function mergeObjects(target, source) {
    let result = Object.assign({}, target); // Cloning target object so we don't change it by reference

    for (let sourceKey in source) {
        let sourceObj = source[sourceKey];

        if (result[sourceKey]) {
            result[sourceKey] = result[sourceKey].concat(sourceObj);
        } else {
            result[sourceKey] = sourceObj;
        }
    }

    return result;
}

module.exports = PullRequests;