let chai = require('chai'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    expect = chai.expect;

describe('config', function() {
    let config,
        fs;

    beforeEach(function() {
        fs = {
            readFileSync: sinon.stub(),
            writeFile: sinon.stub()
        };

        config = proxyquire('../lib/config', {
            'fs': fs
        });
    });

    describe('read', function() {
        it('should throw an exception if file can not be found', function() {
            // arrange
            fs.readFileSync.throws('File could not be found!');

            // act
            let result = function() {
                return config.read();
            };

            // assert
            expect(result).to.throw();
        });

        it('should throw an exception if file can not be parsed', function() {
            // arrange
            fs.readFileSync.returns("{invalidJSON}");

            // act
            let result = function() {
                return config.read();
            };

            // assert
            expect(result).to.throw('Cant not parse configuration. Stack trace: SyntaxError: Unexpected token i in JSON at position 1');
        });

        it('should read configuration content', function() {
            // arrange
            let expected = {
                jane: 'doe'
            };

            fs.readFileSync.returns(JSON.stringify(expected));

            // act
            let result = config.read('filePath');

            // assert
            expect(result).to.eql(expected);
        });
    });

    describe('write', function() {
        let data,
            consoleSpy;

        beforeEach(function() {
            consoleSpy = sinon.spy(console, 'log');

            data = {
                jane: 'doe'
            };

            fs.readFileSync.returns(JSON.stringify(data));
            config.read('filePath');
        });

        afterEach(function() {
            console.log.restore();
        });

        it('should throw an error if file could not be written', function() {
            // arrange

            // act
            let result = function() {
                let data = config.write([]);

                fs.writeFile.yield('Can not write file');

                return data;
            };

            // assert
            expect(result).to.throw('Can not write file');
        });

        it('should console log successful message if tokens are written', function() {
            // arrange

            // act
            config.write([]);
            fs.writeFile.yield(undefined);

            // assert
            expect(consoleSpy.callCount).to.equal(1);
            expect(consoleSpy.getCall(0).args).to.include('Tokens are successfully written.');
        });

        it('should write the file if property present', function() {
            // arrange

            // act
            config.write([{
                key: 'jane.doe',
                value: 'foobar'
            }]);

            fs.writeFile.yield(undefined);

            // assert
            expect(consoleSpy.callCount).to.equal(1);
            expect(consoleSpy.getCall(0).args).to.include('Tokens are successfully written.');
        });

        it('should write the file if property does not present', function() {
            // arrange

            // act
            config.write([{
                key: 'foobar.foobar',
                value: 'foobar'
            }]);

            fs.writeFile.yield(undefined);

            // assert
            expect(consoleSpy.callCount).to.equal(1);
            expect(consoleSpy.getCall(0).args).to.include('Tokens are successfully written.');
        });
    });
});