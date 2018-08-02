let configModule = (function() {
    const fs = require('fs');

    let configPath;
    let config;

    // Private functions
    /**
     * Updates object by given key and value. Key could be nested property e.g. foo.bar.jane.doe
     *
     * @param {String} key - Object key. Could be nested property e.g. foo.bar.jane.doe
     * @param {Object} value - Any type of object key
     * @returns {undefined}
     */
    function updateObject(key, value) {
        // Moving reference to internal objects within obj
        let schema = config;
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
    /**
     * Reads configuration file
     *
     * @param {String} configurationPath - Path to configuration file
     * @returns {Object} configuration - File configuration as JavaScript object
     */
    function read(configurationPath) {
        configPath = configurationPath;

        /**
         * Personally I don't find reason to put try-catch here as error from fs.readFileSync itself is descriptive
         * Sync method is required because configuration may not be loaded when execution start
         */
        let configurationJSON = fs.readFileSync(configurationPath, 'utf8'); // eslint-disable-line no-sync
        let configuration;

        try {
            configuration = JSON.parse(configurationJSON);
            config = configuration;
        } catch (err) {
            throw new Error(`Cant not parse configuration. Stack trace: {err}`);
        }

        return configuration;
    }

    /**
     * Writes object data inside configuration file
     *
     * @param {String} data - configuration data which has to be written inside the file.
     * @returns {undefined}
     */
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

            console.log('Tokens are successfully written.'); // eslint-disable-line no-console
        });
    }

    return {
        read: read,
        write: write
    };
}());

module.exports = configModule;