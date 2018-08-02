let chai = require('chai'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    expect = chai.expect;

describe('Bitbucket', function() {
    let Bitbucket,
        credentials,
        clientId,
        clientSecret,
        accessToken,
        refreshToken;

    beforeEach(function() {
        credentials = {};
        clientId = 'clientId';
        clientSecret = 'clientSecret';
        accessToken = 'accessToken';
        refreshToken = 'refreshToken';
    });

    describe('constructor', function() {
        beforeEach(function() {
            Bitbucket = require('../lib/Bitbucket');
        });

        it('should throw an error if client id is missing', function() {
            // arrange

            // act
            let client = function() {
                new Bitbucket(credentials);
            };

            // assert
            expect(client).to.throw('Client id is missing');
        });

        it('should throw an error if client secret is missing', function() {
            // arrange
            credentials.clientId = clientId;

            // act
            let client = function() {
                new Bitbucket(credentials);
            };

            // assert
            expect(client).to.throw('Client secret is missing');
        });

        it('should throw an error if access token is missing', function() {
            // arrange
            credentials.clientId = clientId;
            credentials.clientSecret = clientSecret;

            // act
            let client = function() {
                new Bitbucket(credentials);
            };

            // assert
            expect(client).to.throw('Access token is missing');
        });

        it('should throw an error if refresh token is missing', function() {
            // arrange
            credentials.clientId = clientId;
            credentials.clientSecret = clientSecret;
            credentials.accessToken = accessToken;

            // act
            let client = function() {
                new Bitbucket(credentials);
            };

            // assert
            expect(client).to.throw('Refresh token is missing');
        });

        it('should return bitbucket instance if all parameters are passed correctly', function() {
            // arrange
            credentials.clientId = clientId;
            credentials.clientSecret = clientSecret;
            credentials.accessToken = accessToken;
            credentials.refreshToken = refreshToken;

            // act
            let client = new Bitbucket(credentials);

            // assert
            expect(client).to.be.ok;
            expect(client.id).to.equal(clientId);
            expect(client.secret).to.equal(clientSecret);
            expect(client.accessToken).to.equal(accessToken);
            expect(client.refreshToken).to.equal(refreshToken);
            expect(client).to.eql({
                _id: 'clientId',
                _secret: 'clientSecret',
                _accessToken: 'accessToken',
                _refreshToken: 'refreshToken'
            });
        });
    });

    describe('obtainTokens', function() {
        let configModule,
            promise;

        beforeEach(function() {
            configModule = {
                write: sinon.stub()
            };

            credentials.clientId = clientId;
            credentials.clientSecret = clientSecret;
            credentials.accessToken = accessToken;
            credentials.refreshToken = refreshToken;

            promise = sinon.stub();

            Bitbucket = proxyquire('../lib/Bitbucket', {
                'request-promise': promise,
                './config': configModule
            });
        });

        it('should throw an error if response is rejected', function() {
            // arrange
            promise.rejects('foobar');

            // act
            let client = new Bitbucket(credentials);
            let result = client.obtainTokens();

            // assert
            return result.catch((err) => {
                expect(err.toString()).to.equal('Error: Can not fetch client tokens. Stack trace: foobar');
            });
        });

        it('should throw an error if response is not valid JSON', function() {
            // arrange
            promise.resolves('not valid JSON');

            // act
            let client = new Bitbucket(credentials);
            let result = client.obtainTokens();

            // assert
            return result.catch((err) => {
                expect(err.toString()).to.equal('Error: Can not fetch client tokens. Stack trace: Error: Cannot parse tokens. Stack trace: SyntaxError: Unexpected token o in JSON at position 1');
            });
        });

        it('should set access and refresh tokens if request is successful', function() {
            // arrange
            let response = {
                access_token: 'newAccessToken',
                refresh_token: 'newRefreshToken'
            };
            promise.resolves(JSON.stringify(response));

            // act
            let client = new Bitbucket(credentials);
            let result = client.obtainTokens();

            // assert
            return result.then(() => {
                expect(client.accessToken).to.equal(response.access_token);
                expect(client.refreshToken).to.equal(response.refresh_token);
            });
        });

        it('should call configuration module with access and refresh token pairs', function() {
            // arrange
            let response = {
                    access_token: 'newAccessToken',
                    refresh_token: 'newRefreshToken'
                },
                expected = [{
                    key: 'bitbucket.accessToken',
                    value: 'newAccessToken'
                }, {
                    key: 'bitbucket.refreshToken',
                    value: 'newRefreshToken'
                }];
            promise.resolves(JSON.stringify(response));

            // act
            let client = new Bitbucket(credentials);
            let result = client.obtainTokens();

            // assert
            return result.then(() => {
                expect(configModule.write.callCount).to.equal(1);
                expect(configModule.write.args[0][0]).to.eql(expected);
            });
        });
    });

    describe('refreshTokens', function() {
        let configModule,
            promise;

        beforeEach(function() {
            configModule = {
                write: sinon.stub()
            };

            credentials.clientId = clientId;
            credentials.clientSecret = clientSecret;
            credentials.accessToken = accessToken;
            credentials.refreshToken = refreshToken;

            promise = sinon.stub();

            Bitbucket = proxyquire('../lib/Bitbucket', {
                'request-promise': promise,
                './config': configModule
            });
        });

        it('should throw an error if response is rejected', function() {
            // arrange
            promise.rejects('foobar');

            // act
            let client = new Bitbucket(credentials);
            let result = client.refreshTokens();

            // assert
            return result.catch((err) => {
                expect(err.toString()).to.equal('Error: Can not refresh access token by given refresh: refreshToken. Stack trace: foobar');
            });
        });

        it('should throw an error if response is not valid JSON', function() {
            // arrange
            promise.resolves('not valid JSON');

            // act
            let client = new Bitbucket(credentials);
            let result = client.refreshTokens();

            // assert
            return result.catch((err) => {
                expect(err.toString()).to.equal('Error: Can not refresh access token by given refresh: refreshToken. Stack trace: Error: Cannot parse tokens. Stack trace: SyntaxError: Unexpected token o in JSON at position 1');
            });
        });

        it('should refresh access token by given refresh token', function() {
            // arrange
            let response = {
                access_token: 'newAccessToken'
            };
            promise.resolves(JSON.stringify(response));

            // act
            let client = new Bitbucket(credentials);
            let result = client.refreshTokens();

            // assert
            return result.then(() => {
                expect(client.accessToken).to.equal(response.access_token);
            });
        });

        it('should call configuration module with new access token', function() {
            // arrange
            let response = {
                    access_token: 'newAccessToken'
                },
                expected = [{
                    key: 'bitbucket.accessToken',
                    value: 'newAccessToken'
                }];

            promise.resolves(JSON.stringify(response));

            // act
            let client = new Bitbucket(credentials);
            let result = client.refreshTokens();

            // assert
            return result.then(() => {
                expect(configModule.write.callCount).to.equal(1);
                expect(configModule.write.args[0][0]).to.eql(expected);
            });
        });
    });

    describe('pullRequests', function() {
        let PullRequests;

        beforeEach(function() {
            credentials.clientId = clientId;
            credentials.clientSecret = clientSecret;
            credentials.accessToken = accessToken;
            credentials.refreshToken = refreshToken;

            PullRequests = sinon.stub();

            Bitbucket = proxyquire('../lib/Bitbucket', {
                './PullRequests': PullRequests
            });
        });

        it('should create new istance of PullRequests class', function() {
            // arrange
            let username = 'username',
                repoSlug = 'repoSlug';

            // act
            let client = new Bitbucket(credentials);
            client.pullRequests(username, repoSlug);

            // assert
            expect(PullRequests.callCount).to.equal(1);
            expect(PullRequests.calledWithNew()).to.be.true;
            expect(PullRequests.calledWith(client, username, repoSlug)).to.be.true;
        });
    });
});