let expect = require('chai').expect;

describe('Jira', function() {
    let Jira,
        domain;

    beforeEach(function() {
        domain = 'myJira';
    });

    describe('constructor', function() {
        beforeEach(function() {
            Jira = require('../lib/Jira');
        });

        it('should not add browse url if domain is missing', function() {
            // arrange

            // act
            let jira = new Jira();

            // assert
            expect(jira).to.eql({
                domain: undefined
            });
        });

        it('should create Jira instance by given domain name', function() {
            // arrange

            // act
            let jira = new Jira(domain);

            // assert
            expect(jira).to.eql({
                domain: domain,
                browseUrl: 'https://myJira.atlassian.net/browse/{ticketId}'
            });
        });
    });

    describe('generateBrowseUrl', function() {
        beforeEach(function() {
            Jira = require('../lib/Jira');
        });

        it('should return null if ticket id is missing', function() {
            // arrange

            // act
            let jira = new Jira(domain);
            let browseUrl = jira.generateBrowseUrl();

            // assert
            expect(browseUrl).to.be.null;
        });

        it('should return null if domain is missing', function() {
            // arrange

            // act
            let jira = new Jira();
            let browseUrl = jira.generateBrowseUrl();

            // assert
            expect(browseUrl).to.be.null;
        });

        it('should return browse url if ticket id and domain are passed', function() {
            // arrange
            let expected = 'https://myJira.atlassian.net/browse/FOO-666';

            // act
            let jira = new Jira(domain);
            let browseUrl = jira.generateBrowseUrl('FOO-666');

            // assert
            expect(browseUrl).to.equal(expected);
        });
    });
});