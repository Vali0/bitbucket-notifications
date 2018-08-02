let chai = require('chai'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    expect = chai.expect;

describe('Jira', function() {
    let Jira,
        credentials,
        domain,
        username,
        authorisationToken;

    beforeEach(function() {
        credentials = {};
        domain = 'myJira';
        username = 'jane.doe';
        authorisationToken = 'token666';
    });

    describe('constructor', function() {
        beforeEach(function() {
            Jira = require('../lib/Jira');
        });

        it('should not add browse url if domain is missing', function() {
            // arrange

            // act
            let jira = new Jira(credentials);

            // assert
            expect(jira._domain).to.be.undefined;
        });

        it('should not add transition url if domain is missing', function() {
            // arrange

            // act
            let jira = new Jira(credentials);

            // assert
            expect(jira._transitionUrl).to.be.undefined;
        });

        it('should create Jira instance by given domain name', function() {
            // arrange
            credentials.domain = domain;

            // act
            let jira = new Jira(credentials);

            // assert
            expect(jira).to.eql({
                _domain: domain,
                _username: undefined,
                _authorisationToken: undefined,
                _browseUrl: 'https://myJira.atlassian.net/browse/{ticketId}',
                _transitionUrl: 'https://myJira.atlassian.net/rest/api/2/issue/{issueIdOrKey}/transitions'
            });
        });

        it('should create Jira instance by given domain name, username and authorisation token', function() {
            // arrange
            credentials.domain = domain;
            credentials.username = username;
            credentials.authorisationToken = authorisationToken;

            // act
            let jira = new Jira(credentials);

            // assert
            expect(jira).to.eql({
                _domain: domain,
                _username: username,
                _authorisationToken: authorisationToken,
                _browseUrl: 'https://myJira.atlassian.net/browse/{ticketId}',
                _transitionUrl: 'https://myJira.atlassian.net/rest/api/2/issue/{issueIdOrKey}/transitions'
            });
        });
    });

    describe('generateBrowseUrl', function() {
        beforeEach(function() {
            Jira = require('../lib/Jira');
        });

        it('should return null if ticket id is missing', function() {
            // arrange
            credentials.domain = domain;

            // act
            let jira = new Jira(credentials);
            let browseUrl = jira.generateBrowseUrl();

            // assert
            expect(browseUrl).to.be.null;
        });

        it('should return null if domain is missing', function() {
            // arrange

            // act
            let jira = new Jira(credentials);
            let browseUrl = jira.generateBrowseUrl();

            // assert
            expect(browseUrl).to.be.null;
        });

        it('should return browse url if ticket id and domain are passed', function() {
            // arrange
            credentials.domain = domain;
            let expected = 'https://myJira.atlassian.net/browse/FOO-666';

            // act
            let jira = new Jira(credentials);
            let browseUrl = jira.generateBrowseUrl('FOO-666');

            // assert
            expect(browseUrl).to.equal(expected);
        });
    });

    describe('transitionIssue', function() {
        let promise;

        beforeEach(function() {
            promise = sinon.stub();

            Jira = proxyquire('../lib/Jira', {
                'request-promise': promise
            });
        });

        it('should throw an error if username is missing', function() {
            // arrange
            credentials.domain = domain;

            // act
            let jira = new Jira(credentials);
            let result = function() {
                jira.transitionIssue();
            };

            // assert
            expect(result).to.throw('Jira username is missing. Please check your configuration');
        });

        it('should throw an error if authorisation token is missing', function() {
            // arrange
            credentials.domain = domain;
            credentials.username = username;

            // act
            let jira = new Jira(credentials);
            let result = function() {
                jira.transitionIssue();
            };

            // assert
            expect(result).to.throw('Jira authorisation token is missing. Please check your configuration');
        });

        it('should throw an error if issue id is not passed to the function', function() {
            // arrange
            credentials.domain = domain;
            credentials.username = username;
            credentials.authorisationToken = authorisationToken;

            // act
            let jira = new Jira(credentials);
            let result = function() {
                jira.transitionIssue();
            };

            // assert
            expect(result).to.throw('Issue id is missing');
        });

        it('should throw an error if no options are passed', function() {
            // arrange
            credentials.domain = domain;
            credentials.username = username;
            credentials.authorisationToken = authorisationToken;

            let issueId = 'FOO-666';

            // act
            let jira = new Jira(credentials);
            let result = function() {
                jira.transitionIssue(issueId);
            };

            // assert
            expect(result).to.throw('Missing options');
        });

        it('should throw an error if request cannot be fulfilled', function() {
            // arrange
            credentials.domain = domain;
            credentials.username = username;
            credentials.authorisationToken = authorisationToken;

            let issueId = 'FOO-666',
                options = {};

            options.transition = {
                id: 323
            };

            promise.rejects('bad request');

            // act
            let jira = new Jira(credentials);
            let result = jira.transitionIssue(issueId, options);

            // assert
            return result.catch((err) => {
                expect(err.toString()).to.equal('Error: Can not transition issue FOO-666 to 323. Stack trace: bad request');
            });
        });

        it('should return empty response if successful', function() {
            // arrange
            credentials.domain = domain;
            credentials.username = username;
            credentials.authorisationToken = authorisationToken;

            let issueId = 'FOO-666',
                options = {};

            options.transition = {
                id: 323
            };

            promise.resolves();

            // act
            let jira = new Jira(credentials);
            let result = jira.transitionIssue(issueId, options);

            // assert
            expect(result.resolveValue).to.be.undefined;
        });

        it('should call jira with correct body', function() {
            // arrange
            credentials.domain = domain;
            credentials.username = username;
            credentials.authorisationToken = authorisationToken;

            let expected = {
                method: 'POST',
                uri: 'https://myJira.atlassian.net/rest/api/2/issue/FOO-666/transitions',
                body: '{"transition":{"id":323}}',
                headers: {
                    'content-type': 'application/json'
                },
                auth: {
                    user: 'jane.doe',
                    pass: 'token666'
                }
            };
            let issueId = 'FOO-666',
                options = {};

            options.transition = {
                id: 323
            };

            promise.resolves();

            // act
            let jira = new Jira(credentials);
            jira.transitionIssue(issueId, options);

            // assert
            expect(promise.callCount).to.equal(1);
            expect(promise.getCall(0).args[0]).to.eql(expected);
        });
    });
});