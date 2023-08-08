const { Command } = require('commando');
const GuildReactionConfig = require('../../models/GuildReactionConfigs');
const GuildSettings = require('../../models/GuildSettings');

module.exports = class EchoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unlockmessage',
            group: 'owner',
            memberName: 'unlockmessage',
            description: 'Unlocks a message so people can have more than one reaction on it.',
            details: `Unlocks a message so people can have more than one reaction on it.`,
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'messageID',
                    prompt: 'What message should be unlocked?\n',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { messageID }) {
        const reaction = await GuildReactionConfig.findOne({ where: { messageID: messageID } });
        if (!reaction) return msg.reply('`Error: message not found!`');
        const settings = await GuildSettings.findOne({ where: { guildID: msg.guild.id } });
        if (settings.lockedReactionMessages.indexOf(messageID) === -1) return msg.reply('`Error: Message is not locked!`');
        const lockedReactionMessages = settings.lockedReactionMessages;
        const index = lockedReactionMessages.indexOf(messageID);
        lockedReactionMessages.splice(index, 1);
        settings.lockedReactionMessages = lockedReactionMessages;
        await settings.save();
        return msg.reply(`Message Unlocked!`);
    }
};