const request = require('request-promise');
const pullRequestsUrl = 'https://api.bitbucket.org/2.0/repositories/{team}/{project}/pullrequests';

class PullRequests {
    constructor(client, team, project) {
        this.client = client;
        this.team = team;
        this.project = project;

        this.pullRequestsUrl = pullRequestsUrl.replace('{team}', this.team).replace('{project}', this.project);
    }

    get team() {
        return this._team;
    }

    set team(team) {
        if (!team) {
            throw new Error('Team id is missing');
        }

        this._team = team;
    }

    get project() {
        return this._project;
    }

    set project(project) {
        if (!project) {
            throw new Error('Project id is missing');
        }

        this._project = project;
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
                bearer: this.client.accessToken
            }
        };

        return request(body)
            .then(data => {
                try {
                    let pullRequests = JSON.parse(data); // Parses pull requests from API response
                    let serializedPullRequests = serializePullRequestsData(pullRequests.values); // Creates an object on which keys are target branch and values are arrays of merged PRs in this target branch
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
    let emailContent = {};

    for (let item in pullRequests) {
        let pullRequest = pullRequests[item];
        let destinationBranch = pullRequest.destination.branch.name;

        emailContent[destinationBranch] = emailContent[destinationBranch] || [];
        emailContent[destinationBranch].push(pullRequest.title);
    }

    return emailContent;
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