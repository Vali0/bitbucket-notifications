// This examples shows the ability to transition issues in jira automatically

const moment = require('moment');
const handlebars = require('handlebars');
const bbnotify = require('bitbucket-notifications');

let client = bbnotify.bitbucket;
let gmail = bbnotify.gmail;
let jira = bbnotify.jira;

let template = `<table cellspacing="0" cellpadding="10" style="border-collapse: collapse;font-family: Arial, Helvetica, sans-serif;border: 1px solid #999;text-align: left;">
                    {{#each this}}
                    <thead>
                        <tr>
                            <th colspan="2" style="font-family: Arial, Helvetica, sans-serif;font-size: 19px;text-align: left;background: #666;border: 1px solid #666;color: #fff;">
                                {{@key}}
                            </th>
                            <th style="font-family: Arial, Helvetica, sans-serif;font-size: 19px;text-align: left;background: #666;border: 1px solid #666;color: #fff;">
                                Author
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {{#each this}}
                        <tr>
                            <td style="font-family: Arial, Helvetica, sans-serif;border: 1px solid #999;text-align: left;" valign="top">
                                <a href="{{this.jiraUrl}}">{{this.id}}</a>
                            </td>
                            <td style="font-family: Arial, Helvetica, sans-serif;border: 1px solid #999;text-align: left;" valign="top">
                                <a href="{{this.prUrl}}">{{this.title}}</a>
                            </td>
                            <td style="font-family: Arial, Helvetica, sans-serif;border: 1px solid #999;text-align: left;" valign="top">
                                <a href="{{this.author.account}}">{{this.author.displayName}}</a>
                            </td>
                        </tr>
                        {{/each}}
                    </tbody>
                    {{/each}}

                </table>`;

let pullRequests = client.pullRequests('username', 'repo-slug', {
    jira: jira,
    addJiraLinks: true,
    regExp: /[a-zA-Z]+-[0-9]+/
});
let state = '"MERGED"';
let updatedOn = moment().subtract(1, 'day').format();
let queryString = `state=${state} AND updated_on>=${updatedOn}`;

pullRequests.getPullRequests({
        q: queryString
    })
    .then(pullRequestsList => {
        if (!Object.keys(pullRequestsList).length) {
            return;
        }

        let options = {
            transition: {
                id: 323 // The transition id from your Jira. You can get all possible transitions by making get request to https://{domain}/rest/api/2/issue/{issueId}/transitions
            }
        };

        for (let pullListKey in pullRequestsList) {
            let pullRequests = pullRequestsList[pullListKey];

            for (let pullRequest of pullRequests) {
                if (pullRequest.id) {
                    jira.transitionIssue(pullRequest.id, options);
                }
            }
        }
    })
    .catch(function(err) {
        throw new Error('Something went wrong. Stack trace: ' + err);
    });