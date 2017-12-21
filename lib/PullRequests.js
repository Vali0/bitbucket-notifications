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
     * @param {Array} emailContentPrevious - Previously stored emails. Used in recursion when there is next page
     * @returns {Array|function} - emailContent if there is no next page | this.getPullRequests if there is next page
     */
    getPullRequests(parameters, emailContentPrevious) {
        let emailContent = emailContentPrevious || [];
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
                    let pullRequests = JSON.parse(data);
                    let serializedEmailContent = serializePullRequestsData(pullRequests.values);
                    emailContent = emailContent.concat(serializedEmailContent);

                    // If there is next page make a recursion
                    if (pullRequests.next) {
                        parameters.page = parameters.page || 1;
                        parameters.page++;

                        return this.getPullRequests(parameters, emailContent);
                    }

                    return emailContent;
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
    var emailContent = [];

    for (var item in pullRequests) {
        var pullRequest = pullRequests[item];

        emailContent.push(pullRequest.title);
    }

    return emailContent;
}

module.exports = PullRequests;