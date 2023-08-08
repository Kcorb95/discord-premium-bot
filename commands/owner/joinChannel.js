const { Command } = require('commando');
const guildSettings = require('../../models/GuildSettings');

module.exports = class WelcomeEmbedChannelCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'joinchannel',
            aliases: ['setjoins', 'setjoin'],
            group: 'owner',
            memberName: 'joinchannel',
            description: 'Sets the channel for join messages.',
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'Where should join messages be posted?\n',
                    type: 'channel'
                }
            ]
        });
    }

    async run(msg, { channel }) {
        const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
        let welcome = settings.welcome;
        if (typeof welcome === 'undefined') welcome = {};
        welcome.channel = channel.id;
        settings.welcome = welcome;
        await settings.save();
        return msg.reply(`Welcome embeds will now be posted in ${channel}`);
    }
};