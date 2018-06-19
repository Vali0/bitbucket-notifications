let chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    sinon = require('sinon'),
    sinonStubPromise = require('sinon-stub-promise'),
    proxyquire = require('proxyquire'),
    expect = chai.expect;

sinonStubPromise(sinon);
chai.use(chaiAsPromised);

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
        beforeEach(function() {
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
                },
                retries: 0
            });
        });
    });

    describe('getPullRequests', function() {
        let promise;

        beforeEach(function() {
            promise = sinon.stub().returnsPromise();
            bitbucket = {
                refreshTokens: sinon.stub().returnsPromise()
            };

            PullRequests = proxyquire('../lib/PullRequests', {
                'request-promise': promise
            });
        });

        it('should throw an error if options are missing', function() {
            // arrange

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = function() {
                return pullRequests.getPullRequests();
            };

            // assert
            expect(pullRequestsData).to.throw('Missing search parameters');
        });

        it('should throw an error if options are passed but empty', function() {
            // arrange

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = function() {
                return pullRequests.getPullRequests({});
            };

            // assert
            expect(pullRequestsData).to.throw('Missing search parameters');
        });

        it('should use user search query instead of building new one', function() {
            // arrange

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = pullRequests.getPullRequests({
                q: 'state="MERGED"',
                state: 'OPEN'
            });

            // assert
            expect(promise.getCall(0).args[0].qs).to.eql({
                q: 'state="MERGED"',
                page: 1
            });
        });

        it('should build new search query if q is missing', function() {
            // arrange

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = pullRequests.getPullRequests({
                state: 'OPEN'
            });

            // assert
            expect(promise.getCall(0).args[0].qs).to.eql({
                q: 'state="OPEN"',
                page: 1
            });
        });

        it('should build new search query with updated on parameter', function() {
            // arrange

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = pullRequests.getPullRequests({
                updatedOn: '6-06-6006'
            });

            // assert
            expect(promise.getCall(0).args[0].qs).to.eql({
                q: 'updated_on >= 6-06-6006',
                page: 1
            });
        });

        it('should build new search query if destination branch name parameter', function() {
            // arrange

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = pullRequests.getPullRequests({
                destination: {
                    branch: {
                        name: 'foobar'
                    }
                }
            });

            // assert
            expect(promise.getCall(0).args[0].qs).to.eql({
                q: 'destination.branch.name="foobar"',
                page: 1
            });
        });

        it('should append updatedOn parameter to state', function() {
            // arrange

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = pullRequests.getPullRequests({
                state: 'MERGED',
                updatedOn: '6-06-6006'
            });

            // assert
            expect(promise.getCall(0).args[0].qs).to.eql({
                q: 'state="MERGED" AND updated_on >= 6-06-6006',
                page: 1
            });
        });

        it('should append branch name parameter to state and updatedOn', function() {
            // arrange

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = pullRequests.getPullRequests({
                state: 'MERGED',
                updatedOn: '6-06-6006',
                destination: {
                    branch: {
                        name: 'foobar'
                    }
                }
            });

            // assert
            expect(promise.getCall(0).args[0].qs).to.eql({
                q: 'state="MERGED" AND updated_on >= 6-06-6006 AND destination.branch.name="foobar"',
                page: 1
            });
        });

        it('should throw an error if response is rejected and can not refresh tokens', function() {
            // arrange
            promise.rejects('bad request');
            bitbucket.refreshTokens.rejects('bad tokens');

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = pullRequests.getPullRequests({
                q: 'state="MERGED"'
            });

            // assert
            expect(pullRequestsData.rejectValue.toString()).to.equal('Error: PullRequests: Can not refresh access token. Stack trace: bad tokens');
        });

        it('should throw an error if response is rejected but can refresh tokens', function() {
            // arrange
            promise.rejects('bad request');
            bitbucket.refreshTokens.resolves('New tokens');

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = pullRequests.getPullRequests({
                q: 'state="MERGED"'
            });

            // assert
            expect(pullRequestsData.rejectValue.toString()).to.equal('Error: PullRequests: Can not refresh access token. Stack trace: Error: Maximum number of refresh token retries exceeded. Stack trace: bad request');
        });

        it('should throw an error if response is not valid JSON', function() {
            // arrange
            promise.resolves('not valid JSON');

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = pullRequests.getPullRequests({
                q: 'state="MERGED"'
            });

            // assert
            expect(pullRequestsData.rejectValue.toString()).to.equal('Error: Maximum number of refresh token retries exceeded. Stack trace: Error: Can not parse pull requests. Stack trace: SyntaxError: Unexpected token o in JSON at position 1');
        });

        it('should return serialized pull requests', function() {
            // arrange
            let expected = {
                "develop": [{
                    "title": "FOO-666-Foobar-PR",
                    "id": "FOO-666",
                    "jiraUrl": "#",
                    "prUrl": "bitbucket.org/pr/link",
                    "author": {
                        "displayName": "Jane Doe",
                        "account": "janedoe.com"
                    }
                }]
            };

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
            return expect(pullRequestsData).to.eventually.eql(expected);
        });

        it('should return serialized pull requests and skip PR id if pattern not match', function() {
            // arrange
            let expected = {
                "develop": [{
                    "title": "Foobar-PR-No-Id",
                    "id": null,
                    "jiraUrl": "#",
                    "prUrl": "bitbucket.org/pr/link",
                    "author": {
                        "displayName": "Jane Doe",
                        "account": "janedoe.com"
                    }
                }]
            };

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
            return expect(pullRequestsData).to.eventually.eql(expected);
        });

        it('should concatinate pull requests if more than one have same target branch', function() {
            // arrange
            let expected = {
                "develop": [{
                    "title": "FOO-666-Foobar-PR",
                    "id": "FOO-666",
                    "jiraUrl": "#",
                    "prUrl": "bitbucket.org/pr/link",
                    "author": {
                        "displayName": "Jane Doe",
                        "account": "janedoe.com"
                    }
                }, {
                    "title": "FOO-666-Foobar-PR-2",
                    "id": "FOO-666",
                    "jiraUrl": "#",
                    "prUrl": "bitbucket.org/pr/link2",
                    "author": {
                        "displayName": "Jane Doe",
                        "account": "janedoe.com"
                    }
                }]
            };
            let firstPagePrs = {
                "develop": [{
                    "title": "FOO-666-Foobar-PR",
                    "id": "FOO-666",
                    "jiraUrl": "#",
                    "prUrl": "bitbucket.org/pr/link",
                    "author": {
                        "displayName": "Jane Doe",
                        "account": "janedoe.com"
                    }
                }]
            };
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
            return expect(pullRequestsData).to.eventually.eql(expected);
        });

        it('should set jira URLs if option is passed', function() {
            // arrange
            let jira = {
                generateBrowseUrl: sinon.stub()
            };
            jira.generateBrowseUrl.returns('jira.com/browse/FOO-666');
            let expected = {
                "develop": [{
                    "title": "FOO-666-Foobar-PR",
                    "id": "FOO-666",
                    "jiraUrl": "jira.com/browse/FOO-666",
                    "prUrl": "bitbucket.org/pr/link",
                    "author": {
                        "displayName": "Jane Doe",
                        "account": "janedoe.com"
                    }
                }]
            };

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
            return expect(pullRequestsData).to.eventually.eql(expected);
        });

        it('should get pull requests from second page', function() {
            // arrange
            let expected = {
                "develop": [{
                    "title": "FOO-333-Foobar-PR",
                    "id": "FOO-333",
                    "jiraUrl": "#",
                    "prUrl": "bitbucket.org/pr/link",
                    "author": {
                        "displayName": "Jane Doe",
                        "account": "janedoe.com"
                    }
                }, {
                    "title": "FOO-666-Foobar-PR",
                    "id": "FOO-666",
                    "jiraUrl": "#",
                    "prUrl": "bitbucket.org/pr/link",
                    "author": {
                        "displayName": "Jane Doe",
                        "account": "janedoe.com"
                    }
                }]
            };

            let firstResponse = {
                values: [{
                    title: 'FOO-333-Foobar-PR',
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
                }],
                next: 'nextPage'
            };

            let secondResponse = {
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

            promise.onCall(0).resolves(JSON.stringify(firstResponse));
            promise.onCall(1).resolves(JSON.stringify(secondResponse));

            // act
            let pullRequests = new PullRequests(bitbucket, username, repoSlug);
            let pullRequestsData = pullRequests.getPullRequests({
                q: 'state="MERGED"'
            });

            // assert
            return expect(pullRequestsData).to.eventually.eql(expected);
        });
    });
});