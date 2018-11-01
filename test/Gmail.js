let chai = require('chai'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    expect = chai.expect;

describe('Gmail', function () {
    let credentials,
        user,
        clientId,
        clientSecret,
        accessToken,
        refreshToken,
        Gmail;

    beforeEach(function () {
        credentials = {};
        user = 'userName';
        clientId = 'clientId';
        clientSecret = 'clientSecret';
        accessToken = 'accessToken';
        refreshToken = 'refreshToken';
    });

    describe('constructor', function () {
        // For some reason this describe with proxyquire is reaching timeout of 2000ms. Require is working just fine though
        this.timeout(3000);
        let path = {};

        beforeEach(function () {
            path.join = sinon.stub();

            Gmail = proxyquire('../lib/Gmail', {
                'path': path
            });
        });

        it('should throw an exception if user is missing', function () {
            // arrange

            // act
            let gmail = function () {
                return new Gmail(credentials);
            };

            // assert
            expect(gmail).to.throw('OAuth2 user is missing');
        });

        it('should throw an exception if client id is missing', function () {
            // arrange
            credentials.user = user;

            // act
            let gmail = function () {
                return new Gmail(credentials);
            };

            // assert
            expect(gmail).to.throw('OAuth2 client id is missing');
        });

        it('should throw an exception if client secret is missing', function () {
            // arrange
            credentials.user = user;
            credentials.clientId = clientId;

            // act
            let gmail = function () {
                return new Gmail(credentials);
            };

            // assert
            expect(gmail).to.throw('OAuth2 client secret is missing');
        });

        it('should throw an exception if access token is missing', function () {
            // arrange
            credentials.user = user;
            credentials.clientId = clientId;
            credentials.clientSecret = clientSecret;

            // act
            let gmail = function () {
                return new Gmail(credentials);
            };

            // assert
            expect(gmail).to.throw('OAuth2 access token is missing.');
        });

        it('should throw an exception if refresh token is missing', function () {
            // arrange
            credentials.user = user;
            credentials.clientId = clientId;
            credentials.clientSecret = clientSecret;
            credentials.accessToken = accessToken;

            // act
            let gmail = function () {
                return new Gmail(credentials);
            };

            // assert
            expect(gmail).to.throw('OAuth2 refresh token is missing. Please obtain refresh token and put in your configuration');
        });

        it('should return new instance of Gmail client with build in template', function () {
            // arrange
            credentials.user = user;
            credentials.clientId = clientId;
            credentials.clientSecret = clientSecret;
            credentials.accessToken = accessToken;
            credentials.refreshToken = refreshToken;

            path.join.returns('email.pug');

            // act
            let gmail = new Gmail(credentials);

            // assert
            expect(gmail).to.be.ok;
            expect(gmail).to.eql({
                _user: "userName",
                _id: "clientId",
                _secret: "clientSecret",
                _accessToken: "accessToken",
                _refreshToken: "refreshToken",
                _options: {
                    templatePath: 'email.pug'
                }
            });
        });

        it('should return new instance of Gmail client with custom template', function () {
            // arrange
            credentials.user = user;
            credentials.clientId = clientId;
            credentials.clientSecret = clientSecret;
            credentials.accessToken = accessToken;
            credentials.refreshToken = refreshToken;
            credentials.options = {
                templatePath: 'templatePath'
            };

            path.join.returns('templatePath');

            // act
            let gmail = new Gmail(credentials);

            // assert
            expect(gmail).to.be.ok;
            expect(gmail).to.eql({
                _user: "userName",
                _id: "clientId",
                _secret: "clientSecret",
                _accessToken: "accessToken",
                _refreshToken: "refreshToken",
                _options: {
                    templatePath: 'templatePath'
                }
            });
        });
    });

    describe('compileTemplate', function () {
        let pug = {},
            gmail;

        beforeEach(function () {
            credentials.user = user;
            credentials.clientId = clientId;
            credentials.clientSecret = clientSecret;
            credentials.accessToken = accessToken;
            credentials.refreshToken = refreshToken;

            pug.compileFile = sinon.stub();

            Gmail = proxyquire('../lib/Gmail', {
                'pug': pug
            });

            gmail = new Gmail(credentials);
        });

        it('should compile file by given template', function () {
            // arrange
            let compiledTemplate = sinon.stub();
            let expected = {
                data: {
                    author: 'JaneDoe',
                    ticketId: '666'
                }
            };
            pug.compileFile.returns(compiledTemplate);
            compiledTemplate.returns('compiled html');

            // act
            let result = gmail.compileTemplate(expected);

            // assert
            expect(compiledTemplate.getCall(0).args[0]).to.eql(expected);
            expect(result).to.equal('compiled html');
        });
    });

    describe('sendMail', function () {
        let nodemailer = {},
            transporter = {},
            sender,
            subject,
            content,
            gmail;

        beforeEach(function () {
            credentials.user = user;
            credentials.clientId = clientId;
            credentials.clientSecret = clientSecret;
            credentials.accessToken = accessToken;
            credentials.refreshToken = refreshToken;

            sender = 'jane@gmail.com';
            subject = 'Merged pull requests in last 24h';
            content = '<h1>Foobar</h1>';

            nodemailer.createTransport = sinon.stub();
            transporter.sendMail = sinon.stub();

            Gmail = proxyquire('../lib/Gmail', {
                'nodemailer': nodemailer
            });

            gmail = new Gmail(credentials);
        });

        after(function () {
            console.log.restore(); // eslint-disable-line no-console
        });

        it('should throw an exception if sender email is missing', function () {
            // arrange

            // act
            let result = function () {
                gmail.sendEmail();
            };

            // assert
            expect(result).to.throw('Email sender is missing');
        });

        it('should throw an exception if recipients object is missing', function () {
            // arrange

            // act
            let result = function () {
                gmail.sendEmail(sender);
            };

            // assert
            expect(result).to.throw('Missing recipients');
        });

        it('should throw an exception if recipients object to property is missing', function () {
            // arrange

            // act
            let result = function () {
                gmail.sendEmail(sender, {});
            };

            // assert
            expect(result).to.throw('Direct recipient is missing(to)');
        });

        it('should throw an exception if recipients object to property is there but null', function () {
            // arrange

            // act
            let result = function () {
                gmail.sendEmail(sender, {
                    to: null
                });
            };

            // assert
            expect(result).to.throw('Direct recipient is missing(to)');
        });

        it('should throw an exception if recipients object to property is there but undefined', function () {
            // arrange

            // act
            let result = function () {
                gmail.sendEmail(sender, {
                    to: undefined
                });
            };

            // assert
            expect(result).to.throw('Direct recipient is missing(to)');
        });

        it('should throw an exception if recipients object to property is there but empty array', function () {
            // arrange

            // act
            let result = function () {
                gmail.sendEmail(sender, {
                    to: []
                });
            };

            // assert
            expect(result).to.throw('Direct recipient is missing(to)');
        });

        it('should throw an exception if subject is missing', function () {
            // arrange

            // act
            let result = function () {
                gmail.sendEmail(sender, {
                    to: ['jane@gmail.com']
                });
            };

            // assert
            expect(result).to.throw('Email subject is missing');
        });

        it('should throw an exception if content is missing', function () {
            // arrange

            // act
            let result = function () {
                gmail.sendEmail(sender, {
                    to: ['jane@gmail.com']
                }, subject);
            };

            // assert
            expect(result).to.throw('Email content is missing');
        });

        it('should not concatenate to email list if there is only one email', function () {
            // arrange
            let recipient = 'jane@gmail.com';
            nodemailer.createTransport.returns(transporter);

            // act
            gmail.sendEmail(sender, {
                to: [recipient]
            }, subject, content);

            // assert
            expect(transporter.sendMail.callCount).to.equal(1);
            expect(transporter.sendMail.getCall(0).args[0].to).to.equal(recipient);
        });

        it('should concatenate to email list if there is more than one email', function () {
            // arrange
            let firstRecipient = 'jane@gmail.com',
                secondRecipient = 'john@gmail.com';

            nodemailer.createTransport.returns(transporter);

            // act
            gmail.sendEmail(sender, {
                to: [firstRecipient, secondRecipient]
            }, subject, content);

            // assert
            expect(transporter.sendMail.callCount).to.equal(1);
            expect(transporter.sendMail.getCall(0).args[0].to).to.equal([firstRecipient, secondRecipient].join(', '));
        });

        it('should not add cc list if not passed', function () {
            // arrange
            let recipient = 'jane@gmail.com';

            nodemailer.createTransport.returns(transporter);

            // act
            gmail.sendEmail(sender, {
                to: [recipient]
            }, subject, content);

            // assert
            expect(transporter.sendMail.callCount).to.equal(1);
            expect(transporter.sendMail.getCall(0).args[0].cc).to.be.undefined;
        });

        it('should not add cc list if passed but null', function () {
            // arrange
            let recipient = 'jane@gmail.com';

            nodemailer.createTransport.returns(transporter);

            // act
            gmail.sendEmail(sender, {
                to: [recipient],
                cc: null
            }, subject, content);

            // assert
            expect(transporter.sendMail.callCount).to.equal(1);
            expect(transporter.sendMail.getCall(0).args[0].cc).to.be.undefined;
        });

        it('should not add cc list if passed but undefined', function () {
            // arrange
            let recipient = 'jane@gmail.com';

            nodemailer.createTransport.returns(transporter);

            // act
            gmail.sendEmail(sender, {
                to: [recipient],
                cc: undefined
            }, subject, content);

            // assert
            expect(transporter.sendMail.callCount).to.equal(1);
            expect(transporter.sendMail.getCall(0).args[0].cc).to.be.undefined;
        });

        it('should not add cc list if passed but empty', function () {
            // arrange
            let recipient = 'jane@gmail.com';

            nodemailer.createTransport.returns(transporter);

            // act
            gmail.sendEmail(sender, {
                to: [recipient],
                cc: []
            }, subject, content);

            // assert
            expect(transporter.sendMail.callCount).to.equal(1);
            expect(transporter.sendMail.getCall(0).args[0].cc).to.be.undefined;
        });

        it('should not concatenate cc email list if only one is passed', function () {
            // arrange
            let recipient = 'jane@gmail.com';

            nodemailer.createTransport.returns(transporter);

            // act
            gmail.sendEmail(sender, {
                to: [recipient],
                cc: [recipient]
            }, subject, content);

            // assert
            expect(transporter.sendMail.callCount).to.equal(1);
            expect(transporter.sendMail.getCall(0).args[0].cc).to.be.equal(recipient);
        });

        it('should concatenate cc email list if more than one is passed', function () {
            // arrange
            let firstRecipient = 'jane@gmail.com',
                secondRecipient = 'john@gmail.com';

            nodemailer.createTransport.returns(transporter);

            // act
            gmail.sendEmail(sender, {
                to: [firstRecipient],
                cc: [firstRecipient, secondRecipient]
            }, subject, content);

            // assert
            expect(transporter.sendMail.callCount).to.equal(1);
            expect(transporter.sendMail.getCall(0).args[0].cc).to.be.equal([firstRecipient, secondRecipient].join(', '));
        });

        it('should not add bcc list if not passed', function () {
            // arrange
            let recipient = 'jane@gmail.com';

            nodemailer.createTransport.returns(transporter);

            // act
            gmail.sendEmail(sender, {
                to: [recipient],
            }, subject, content);

            // assert
            expect(transporter.sendMail.callCount).to.equal(1);
            expect(transporter.sendMail.getCall(0).args[0].bcc).to.be.undefined;
        });

        it('should not add bcc list if passed but null', function () {
            // arrange
            let recipient = 'jane@gmail.com';

            nodemailer.createTransport.returns(transporter);

            // act
            gmail.sendEmail(sender, {
                to: [recipient],
                bcc: null
            }, subject, content);

            // assert
            expect(transporter.sendMail.callCount).to.equal(1);
            expect(transporter.sendMail.getCall(0).args[0].bcc).to.be.undefined;
        });

        it('should not add bcc list if passed but undefined', function () {
            // arrange
            let recipient = 'jane@gmail.com';

            nodemailer.createTransport.returns(transporter);

            // act
            gmail.sendEmail(sender, {
                to: [recipient],
                bcc: undefined
            }, subject, content);

            // assert
            expect(transporter.sendMail.callCount).to.equal(1);
            expect(transporter.sendMail.getCall(0).args[0].bcc).to.be.undefined;
        });

        it('should not add bcc list if passed but empty', function () {
            // arrange
            let recipient = 'jane@gmail.com';

            nodemailer.createTransport.returns(transporter);

            // act
            gmail.sendEmail(sender, {
                to: [recipient],
                bcc: []
            }, subject, content);

            // assert
            expect(transporter.sendMail.callCount).to.equal(1);
            expect(transporter.sendMail.getCall(0).args[0].bcc).to.be.undefined;
        });

        it('should not concatenate bcc email list if only one is passed', function () {
            // arrange
            let recipient = 'jane@gmail.com';

            nodemailer.createTransport.returns(transporter);

            // act
            gmail.sendEmail(sender, {
                to: [recipient],
                bcc: [recipient]
            }, subject, content);

            // assert
            expect(transporter.sendMail.callCount).to.equal(1);
            expect(transporter.sendMail.getCall(0).args[0].bcc).to.be.equal(recipient);
        });

        it('should concatenate bcc email list if more than one is passed', function () {
            // arrange
            let firstRecipient = 'jane@gmail.com',
                secondRecipient = 'john@gmail.com';

            nodemailer.createTransport.returns(transporter);

            // act
            gmail.sendEmail(sender, {
                to: [firstRecipient],
                bcc: [firstRecipient, secondRecipient]
            }, subject, content);

            // assert
            expect(transporter.sendMail.callCount).to.equal(1);
            expect(transporter.sendMail.getCall(0).args[0].bcc).to.be.equal([firstRecipient, secondRecipient].join(', '));
        });

        it('should throw an error if email can not be sent', function () {
            // arrange
            let recipient = 'jane@gmail.com';

            nodemailer.createTransport.returns(transporter);

            // act
            let result = function () {
                let response = gmail.sendEmail(sender, {
                    to: [recipient]
                }, subject, content);

                transporter.sendMail.yield('nodemailer error');

                return response;
            };

            // assert
            expect(result).to.throw('Can not send email. Stack trace: nodemailer error');
        });

        it('should log console message if message is sent', function () {
            // arrange
            let recipient = 'jane@gmail.com';
            let consoleSpy = sinon.spy(console, 'log');

            nodemailer.createTransport.returns(transporter);

            // act
            gmail.sendEmail(sender, {
                to: [recipient]
            }, subject, content);

            transporter.sendMail.yield(undefined, {
                messageId: 666
            });

            // assert
            expect(consoleSpy.callCount).to.equal(1);
            expect(consoleSpy.getCall(0).args).to.include('Message sent: %s', 666);
        });
    });

});