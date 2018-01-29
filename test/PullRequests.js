var expect = require('chai').expect;

describe('PullRequests', function() {
    let PullRequests = require('../lib/PullRequests'),
        bitbucket,
        username,
        repoSlug;

    beforeEach(function() {
        bitbucket = 'bitbucketClient';
        username = 'username';
        repoSlug = 'repoSlug';
    });

    describe('constructor', function() {
        it('should throw an error if username is missing', function() {
            // arrange

            // act
            let pullPequests = function() {
                new PullRequests();
            };

            // assert
            expect(pullPequests).to.throw('Username is missing');
        });

        it('should throw an error if repo slug is missing', function() {
            // arrange

            // act
            let pullPequests = function() {
                new PullRequests(bitbucket, username);
            };

            // assert
            expect(pullPequests).to.throw('Repo slug is missing');
        });

        it('should set default options if none are passed', function() {
            // arrange
            let expected = {
                regExp: /[a-zA-Z]+-[0-9]+/,
                addJiraLinks: false,
                jira: undefined
            };

            // act
            let pullPequests = new PullRequests(bitbucket, username, repoSlug);

            // assert
            expect(pullPequests.options).to.eql(expected);
        });

        it('should set options if all are passed', function() {
            // arrange
            let expected = {
                regExp: /[a-zA-Z]{2-5}-[0-9]{2-5}/,
                addJiraLinks: true,
                jira: 'jiraLink'
            };

            // act
            let pullPequests = new PullRequests(bitbucket, username, repoSlug, expected);

            // assert
            expect(pullPequests.options).to.eql(expected);
        });

        it('should set pull requests url if username and reposlug are passed', function() {
            // arrange

            // act
            let pullPequests = new PullRequests(bitbucket, username, repoSlug);

            // assert
            expect(pullPequests.pullRequestsUrl).to.equal(`https://api.bitbucket.org/2.0/repositories/${username}/${repoSlug}/pullrequests`);
        });

        it('should return pull requests instance if all parameters are passed', function() {
            // arrange
            let options = {
                addJiraLinks: true,
                jira: 'jiraLink'
            };

            // act
            let pullPequests = new PullRequests(bitbucket, username, repoSlug, options);

            // assert
            expect(pullPequests).to.be.ok;
            expect(pullPequests).to.eql({
                bitbucket: 'bitbucketClient',
                _username: 'username',
                _repoSlug: 'repoSlug',
                pullRequestsUrl: 'https://api.bitbucket.org/2.0/repositories/username/repoSlug/pullrequests',
                _options: { 
                regExp: /[a-zA-Z]+-[0-9]+/,
                addJiraLinks: true,
                jira: 'jiraLink' 
                }
            });
        });
    });
});