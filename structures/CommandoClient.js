const { Client } = require('commando');

const Database = require('./PostgreSQL');
const Raven = require('raven');

const { SENTRY_TOKEN } = require('../settings.json');

class CommandoClient extends Client {
    constructor(options) {
        super(options);
        this.database = Database.db;

        Database.start();

        Raven.config(SENTRY_TOKEN).install();
    }
}

module.exports = CommandoClient;
