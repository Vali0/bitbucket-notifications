const path = require('path');
const nodemailer = require('nodemailer');
const pug = require('pug');

/*
 * Gmail requires browser authorisation and client must verify requested access rights to his account by the application.
 * This means there is no way to obtain tokens with calls.
 * Therefore you must obtain your refresh token via browser, postman, google playground or another preferable by you way.
 */
class Gmail {
    constructor(configuration) {
        this.user = configuration.user;
        this.id = configuration.clientId;
        this.secret = configuration.clientSecret;
        this.accessToken = configuration.accessToken;
        this.refreshToken = configuration.refreshToken;
        this.options = configuration.options;
    }

    get user() {
        return this._user;
    }

    set user(user) {
        if (!user) {
            throw new Error('OAuth2 user is missing');
        }

        this._user = user;
    }

    get id() {
        return this._id;
    }

    set id(clientId) {
        if (!clientId) {
            throw new Error('OAuth2 client id is missing');
        }

        this._id = clientId;
    }

    get secret() {
        return this._secret;
    }

    set secret(clientSecret) {
        if (!clientSecret) {
            throw new Error('OAuth2 client secret is missing');
        }

        this._secret = clientSecret;
    }

    get accessToken() {
        return this._accessToken;
    }

    set accessToken(accessToken) {
        if (!accessToken) {
            throw new Error('OAuth2 access token is missing.');
        }

        this._accessToken = accessToken;
    }

    get refreshToken() {
        return this._refreshToken;
    }

    set refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new Error('OAuth2 refresh token is missing. Please obtain refresh token and put in your configuration');
        }

        this._refreshToken = refreshToken;
    }

    get options() {
        return this._options;
    }

    set options(options) {
        let opts = {};

        if (options && options.templatePath) {
            let configurationPath = path.join('config', options.templatePath);

            opts.templatePath = configurationPath;
        } else {
            opts.templatePath = path.join(__dirname, 'email.pug');
        }

        this._options = opts;
    }

    compileTemplate(context) {
        let template = pug.compileFile(this.options.templatePath);
        let content = template(context);

        return content;
    }

    sendEmail(sender, recipientsObject, subject, content) {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: this.user,
                clientId: this.id,
                clientSecret: this.secret,
                accessToken: this.accessToken,
                refreshToken: this.refreshToken
            }
        });

        let mailOptions = {};

        if (!sender) {
            throw new Error('Email sender is missing');
        }
        mailOptions.from = sender;

        if (!recipientsObject) {
            throw new Error('Missing recipients');
        }

        if (!(recipientsObject.to && recipientsObject.to.length)) {
            throw new Error('Direct recipient is missing(to)');
        }
        mailOptions.to = recipientsObject.to.join(', ');

        if (recipientsObject.cc && recipientsObject.cc.length) {
            mailOptions.cc = recipientsObject.cc.join(', ');
        }

        if (recipientsObject.bcc && recipientsObject.bcc.length) {
            mailOptions.bcc = recipientsObject.bcc.join(', ');
        }

        if (!subject) {
            throw new Error('Email subject is missing');
        }
        mailOptions.subject = subject;

        if (!content) {
            throw new Error('Email content is missing');
        }
        mailOptions.html = content;

        // Send email with options from above. If something is missing error will be thrown and email won't send
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw new Error(`Can not send email. Stack trace: ${error}`);
            }

            console.log('Message sent: %s', info.messageId); // eslint-disable-line no-console
        });
    }
}

module.exports = Gmail;