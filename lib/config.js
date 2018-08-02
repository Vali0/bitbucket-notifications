var configModule = (function() {
    'use strict';

    const fs = require('fs');

    var configPath;
    var config;

    // Private functions
    function updateObject(key, value) {
        let schema = config; // a moving reference to internal objects within obj
        let pList = key.split('.');
        let len = pList.length;

        for (let i = 0; i < len - 1; i++) {
            let elem = pList[i];

            if (!schema[elem]) {
                schema[elem] = {};
            }

            schema = schema[elem];
        }

        schema[pList[len - 1]] = value;
    }

    // Public functions
    function read(configurationPath) {
        configPath = configurationPath;

        // Personally I don't find reason to put try-catch here as error from fs.readFileSync itself is descriptive
        let configurationJSON = fs.readFileSync(configurationPath, 'utf8');
        let configuration;

        try {
            configuration = JSON.parse(configurationJSON);
            config = configuration;
        } catch (err) {
            throw new Error('Cant not parse configuration. Stack trace: ' + err);
        }

        return configuration;
    }

    function write(data) {
        for (let i = 0, len = data.length; i < len; i++) {
            let pair = data[i];

            updateObject(pair.key, pair.value);
        }

        let configurationJSON = JSON.stringify(config);

        fs.writeFile(configPath, configurationJSON, (err) => {
            if (err) {
                throw err;
            }

            console.log('Tokens are successfully written.');
        });
    }

    return {
        read: read,
        write: write
    };
}());

module.exports = configModule;