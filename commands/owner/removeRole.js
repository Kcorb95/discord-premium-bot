const { Command } = require('commando');
const GuildReactionConfig = require('../../models/GuildReactionConfigs');
const Logger = require('../../structures/Logger');

module.exports = class EchoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'remove-reaction-role',
            group: 'owner',
            aliases: ['removerole', 'rrr', 'removereaction'],
            memberName: 'remove-reaction-role',
            description: 'Removes a reaction role.',
            details: `Removes a reaction role.`,
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'reactionID',
                    prompt: 'What reaction do you wish to delete?',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { reactionID }) {
        const reactionConfig = await GuildReactionConfig.findOne({ where: { reactionID: reactionID } });
        if (!reactionConfig) return msg.reply('`Error: Reaction not found!`');
        const message = await msg.say(`You are trying to delete reaction: ${reactionConfig.emoji} for role: ${msg.guild.roles.get(reactionConfig.role)} in channel: ${msg.guild.channels.get(reactionConfig.channelID)}.\nAre you sure you wish to do this?`);
        await message.react('✅');
        await message.react('❌');
        let approved;
        const filter = (reaction, user) => !user.bot && (reaction.emoji.name === '✅' || reaction.emoji.name === '❌') && user.id === msg.member.id;
        const collector = message.createReactionCollector(filter, { time: 60 * 1000 });
        collector.on('collect', reaction => {
            if (reaction.emoji.name === '✅')
                approved = true;
            else if (reaction.emoji.name === '❌')
                approved = false;
            collector.stop(`Responded`);
        });
        collector.on('end', () => handleResponse());
        const handleResponse = async () => {
            message.delete({ reason: `Automated Command Deletion` });
            if (approved) {
                await GuildReactionConfig.destroy({ where: { reactionID: reactionID } });
            }
            msg.reply(`Action ${approved ? 'Completed' : 'Canceled'}!`);
        };
    }
};