let expect = require('chai').expect,
    sinon = require('sinon'),
    sinonStubPromise = require('sinon-stub-promise'),
    proxyquire = require('proxyquire');

sinonStubPromise(sinon);

describe('PullRequests', function() {
    let PullRequests,
        bitbucket,
        username,
        repoSlug;

    beforeEach(function() {
        bitbucket = 'bitbucketClient';
        username = 'username';
        repoSlug = 'repoSlug';
    });

    describe('constructor', function() {
        beforeEach(function  () {
            PullRequests = require('../lib/PullRequests');
        });

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

    describe('getPullRequests', function() {
        let promise;

        beforeEach(function  () {
            promise = sinon.stub().returnsPromise();     

            PullRequests = proxyquire('../lib/PullRequests', {
                'request-promise': promise
            });
        });

        it('should throw an error if response is rejected', function(done) {
            // arrange
            promise.rejects('foobar');

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = pullRequests.getPullRequests({
                q: 'state="MERGED"'
            });

            // assert
            expect(pullRequestsData.rejectValue.toString()).to.equal('Error: Can not fetch pull requests. Stack trace: foobar');
            done();
        });

        it('should throw an error if response is not valid JSON', function(done) {
            // arrange
            promise.resolves('not valid JSON');

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = pullRequests.getPullRequests({
                q: 'state="MERGED"'
            });

            // assert
            expect(pullRequestsData.rejectValue.toString()).to.equal('Error: Can not fetch pull requests. Stack trace: Error: Can not fetch pull requests. Stack trace: SyntaxError: Unexpected token o in JSON at position 1');
            done();
        });

        it('should return serialized pull requests', function(done) {
            // arrange
            let expected = {"develop":[{"title":"FOO-666-Foobar-PR","id":"FOO-666","jiraUrl":"#","prUrl":"bitbucket.org/pr/link","author":{"displayName":"Jane Doe","account":"janedoe.com"}}]};

            let response = {
                values: [{
                    title: 'FOO-666-Foobar-PR',
                    destination: {
                        branch: {
                            name: 'develop'
                        }
                    },
                    links: {
                        html: {
                            href: 'bitbucket.org/pr/link'
                        }
                    },
                    author: {
                        display_name: 'Jane Doe',
                        links: {
                            html: {
                                href: 'janedoe.com'
                            }
                        }
                    }
                }]
            };

            promise.resolves(JSON.stringify(response));

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = pullRequests.getPullRequests({
                q: 'state="MERGED"'
            });

            // assert
            expect(pullRequestsData.resolveValue).to.eql(expected);
            done();
        });

        it('should return serialized pull requests and skip PR id if pattern not match', function(done) {
            // arrange
            let expected = {"develop":[{"title":"Foobar-PR-No-Id","id":null,"jiraUrl":"#","prUrl":"bitbucket.org/pr/link","author":{"displayName":"Jane Doe","account":"janedoe.com"}}]};

            let response = {
                values: [{
                    title: 'Foobar-PR-No-Id',
                    destination: {
                        branch: {
                            name: 'develop'
                        }
                    },
                    links: {
                        html: {
                            href: 'bitbucket.org/pr/link'
                        }
                    },
                    author: {
                        display_name: 'Jane Doe',
                        links: {
                            html: {
                                href: 'janedoe.com'
                            }
                        }
                    }
                }]
            };

            promise.resolves(JSON.stringify(response));

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = pullRequests.getPullRequests({
                q: 'state="MERGED"'
            });

            // assert
            expect(pullRequestsData.resolveValue).to.eql(expected);
            done();
        });

        it('should concatinate pull requests if more than one have same target branch', function(done) {
            // arrange
            let expected = {"develop":[{"title":"FOO-666-Foobar-PR","id":"FOO-666","jiraUrl":"#","prUrl":"bitbucket.org/pr/link","author":{"displayName":"Jane Doe","account":"janedoe.com"}},{"title":"FOO-666-Foobar-PR-2","id":"FOO-666","jiraUrl":"#","prUrl":"bitbucket.org/pr/link2","author":{"displayName":"Jane Doe","account":"janedoe.com"}}]};
            let firstPagePrs = {"develop":[{"title":"FOO-666-Foobar-PR","id":"FOO-666","jiraUrl":"#","prUrl":"bitbucket.org/pr/link","author":{"displayName":"Jane Doe","account":"janedoe.com"}}]};
            let response = {
                values: [{
                    title: 'FOO-666-Foobar-PR-2',
                    destination: {
                        branch: {
                            name: 'develop'
                        }
                    },
                    links: {
                        html: {
                            href: 'bitbucket.org/pr/link2'
                        }
                    },
                    author: {
                        display_name: 'Jane Doe',
                        links: {
                            html: {
                                href: 'janedoe.com'
                            }
                        }
                    }
                }]
            };

            promise.resolves(JSON.stringify(response));

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = pullRequests.getPullRequests({
                q: 'state="MERGED"'
            }, firstPagePrs);

            // assert
            expect(pullRequestsData.resolveValue).to.eql(expected);
            done();
        });

        it('should return append jira URLs if option is passed', function(done) {
            // arrange
            let jira = {
                generateBrowseUrl: sinon.stub()
            };
            jira.generateBrowseUrl.returns('jira.com/browse/FOO-666');
            let expected = {"develop":[{"title":"FOO-666-Foobar-PR","id":"FOO-666","jiraUrl":"jira.com/browse/FOO-666","prUrl":"bitbucket.org/pr/link","author":{"displayName":"Jane Doe","account":"janedoe.com"}}]};

            let response = {
                values: [{
                    title: 'FOO-666-Foobar-PR',
                    destination: {
                        branch: {
                            name: 'develop'
                        }
                    },
                    links: {
                        html: {
                            href: 'bitbucket.org/pr/link'
                        }
                    },
                    author: {
                        display_name: 'Jane Doe',
                        links: {
                            html: {
                                href: 'janedoe.com'
                            }
                        }
                    }
                }]
            };

            promise.resolves(JSON.stringify(response));

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug, {
                jira: jira,
                addJiraLinks: true
            });
            let pullRequestsData = pullRequests.getPullRequests({
                q: 'state="MERGED"'
            });

            // assert
            expect(pullRequestsData.resolveValue).to.eql(expected);
            done();
        });
    });
});