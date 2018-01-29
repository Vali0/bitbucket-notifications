var expect = require('chai').expect;

describe('Bitbucket', function() {
    let Bitbucket = require('../lib/Bitbucket'),
        clientId,
        clientSecret,
        accessToken,
        refreshToken;

    beforeEach(function() {
        clientId = 'clientId';
        clientSecret = 'clientSecret';
        accessToken = 'accessToken';
        refreshToken = 'refreshToken';
    });

    describe('constructor', function() {
        it('should throw an error if client id is missing', function() {
            // arrange

            // act
            let client = function() {
                new Bitbucket();
            };

            // assert
            expect(client).to.throw('Client id is missing');
        });

        it('should throw an error if client secret is missing', function() {
            // arrange

            // act
            let client = function() {
                new Bitbucket(clientId);
            };

            // assert
            expect(client).to.throw('Client secret is missing');
        });

        it('should throw an error if access token is missing', function() {
            // arrange

            // act
            let client = function() {
                new Bitbucket(clientId, clientSecret);
            };

            // assert
            expect(client).to.throw('Access token is missing');
        });

        it('should throw an error if refresh token is missing', function() {
            // arrange

            // act
            let client = function() {
                new Bitbucket(clientId, clientSecret, accessToken);
            };

            // assert
            expect(client).to.throw('Refresh token is missing');
        });

        it('should return bitbucket instance if all parameters are passed correctly', function() {
            // arrange

            // act
            let client = new Bitbucket(clientId, clientSecret, accessToken, refreshToken);

            // assert
            expect(client).to.be.ok;
            expect(client).to.eql({
                _id: 'clientId',
                _secret: 'clientSecret',
                _accessToken: 'accessToken',
                _refreshToken: 'refreshToken'
            });
        });
    });
});