const { Command } = require('commando');
const { stripIndents } = require('common-tags');

module.exports = class DonateCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'donate',
            aliases: ['patreon', 'paypal', 'premium'],
            group: 'util',
            memberName: 'donate',
            description: 'Responds with the bot\'s donation links.',
            guarded: true
        });
    }

    run(msg) {
        return msg.say(stripIndents`
			Help support TASS to keep it running <3
			https://www.patreon.com/a_ss
			https://paypal.me/AntiSocialSociety
		`);
    }
};