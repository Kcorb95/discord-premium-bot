const { Command } = require('commando');
const GuildReactionConfig = require('../../models/GuildReactionConfigs');
const GuildSettings = require('../../models/GuildSettings');

module.exports = class EchoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'lockmessage',
            group: 'owner',
            memberName: 'lockmessage',
            description: 'Locks a message so people can only have ONE reaction on it.',
            details: `Locks a message so people can only have ONE reaction on it.`,
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'messageID',
                    prompt: 'What message should be locked?\n',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { messageID }) {
        const reaction = await GuildReactionConfig.findOne({ where: { messageID: messageID } });
        if (!reaction) return msg.reply('`Error: message not found!`');
        const settings = await GuildSettings.findOne({ where: { guildID: msg.guild.id } });
        if (settings.lockedReactionMessages.indexOf(messageID) !== -1) return msg.reply('`Error: Message already locked!`');
        const lockedReactionMessages = settings.lockedReactionMessages;
        lockedReactionMessages.push(messageID);
        settings.lockedReactionMessages = lockedReactionMessages;
        await settings.save();
        return msg.reply(`Message Locked!`);
    }
};