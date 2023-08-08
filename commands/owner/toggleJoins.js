const { Command } = require('commando');
const guildSettings = require('../../models/GuildSettings');

module.exports = class ToggleJoinsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'togglejoins',
            aliases: ['togglejoin'],
            group: 'config',
            memberName: 'togglejoins',
            description: 'Enables or disables join messages.',
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'enabled',
                    prompt: 'Would you like to enable or disable join messages?\n',
                    type: 'boolean'
                }
            ]
        });
    }

    async run(msg, args) {
        const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
        let welcome = settings.welcome;
        if (typeof welcome === 'undefined') welcome = {};
        welcome.enabled = args.enabled;
        settings.welcome = welcome;
        await settings.save();
        return msg.reply(`Welcome embeds have been ${args.enabled ? 'enabled' : 'disabled'}.`);
    }
};