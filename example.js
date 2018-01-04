const moment = require('moment');
const handlebars = require('handlebars');
const bbnotify = require('bitbucket-notifications');

let client = bbnotify.bitbucketClient;
let gmail = bbnotify.gmail;

let template = `<table style="border:1px solid #999" cellspacing="0" cellpadding="0">
                    <thead>
                        <tr>
                            <th style="border-right: 1px solid #999; border-bottom: 1px solid #999; padding: 5px 10px;" align="left">Target branch</th>
                            <th style="border-bottom: 1px solid #999; padding: 5px 10px;" align="left">Branches</th>
                        </tr>
                    </thead>

                    <tbody>
                        {{#each this}}
                        <tr>
                            <td style="border-right: 1px solid #999; padding: 5px 10px;" valign="top">
                                {{@key}}
                            </td>

                            <td style="padding-left: 5px;">
                                {{#each this}}
                                        <p>{{this}}</p>
                                {{/each}}
                            </td>

                        </tr>
                        {{/each}}
                    </tbody>

                </table>`;

client.obtainTokens()
    .then(() => {
        let pullRequests = client.pullRequests('username', 'repo-slug');
        let state = '"MERGED"';
        let updatedOn = moment().subtract(1, 'day').format();
        let queryString = `state=${state} AND updated_on>=${updatedOn}`;

        // return a promise
        return pullRequests.getPullRequests({
            q: queryString
        });
    })
    .then(pullRequestsList => {
        if (Object.keys(pullRequestsList).length) {
            let sender = 'jane.doe@gmail.com';
            let recipientsObject = {
                to: ['john.doe@gmail.com'],
                cc: ['john.doe1@gmail.com', 'john.doe2@gmail.com'],
                bcc: ['john.doe3@gmail.com']
            };
            let subject = 'Merged pull requests in last 24h';

            let handlebarsTemplate = handlebars.compile(template);
            let content = handlebarsTemplate(pullRequestsList);

            gmail.sendEmail(sender, recipientsObject, subject, content);
        }
    })
    .catch(function(err) {
        throw new Error('Something went wrong. Stack trace: ' + err);
    });