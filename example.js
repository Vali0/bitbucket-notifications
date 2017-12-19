const moment = require('moment');
const bbnotify = require('bitbucket-notifications');

let client = bbnotify.bitbucketClient;
let gmail = bbnotify.gmail;

client.obtainTokens()
    .then(() => {
        let pullRequests = client.pullRequests('team', 'repository');
        let state = '"MERGED"';
        let updatedOn = moment().subtract(1, 'day').format();
        let queryString = `state=${state} AND updated_on>=${updatedOn}`;

        // return a promise
        return pullRequests.getPullRequests({
            q: queryString
        });
    })
    .then(pullRequestsList => {
        if (pullRequestsList.length) {
            let sender = 'jane.doe@gmail.com';
            let recipientsObject = {
                to: ['john.doe@gmail.com'],
                cc: ['john.doe1@gmail.com', 'john.doe2@gmail.com'],
                bcc: ['john.doe3@gmail.com']
            };
            let subject = 'Merged pull requests in last 24h';
            let content = 'Released tickets titles\n' + pullRequestsList.join('\n');

            gmail.sendEmail(sender, recipientsObject, subject, content);
        }
    })
    .catch(function(err) {
        throw new Error('Something went wrong. Stack trace: ' + err);
    });