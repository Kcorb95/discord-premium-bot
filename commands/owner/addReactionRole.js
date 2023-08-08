const { Command } = require('commando');
const GuildReactionConfig = require('../../models/GuildReactionConfigs');
const Logger = require('../../structures/Logger');

module.exports = class EchoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'add-reaction-role',
            group: 'owner',
            aliases: ['addrole', 'arr', 'addreaction'],
            memberName: 'add-reaction-role',
            description: 'Adds a reaction role with an emoji to a message.',
            details: `Adds a reaction role with an emoji to a message.`,
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'What channel contains the message you wish to modify?',
                    type: 'channel'
                },
                {
                    key: 'messageID',
                    prompt: 'What is the messageID for the message you wish to modify?',
                    type: 'string'
                },
                {
                    key: '_emoji',
                    prompt: 'What is the emoji to use as a reaction for this role?',
                    type: 'emoji'
                },
                {
                    key: 'role',
                    prompt: 'What is the role that should be used for this reaction?',
                    type: 'role'
                }
            ]
        });
    }

    async run(msg, { channel, messageID, _emoji, role }) {
        const emoji = _emoji.identifier || _emoji;
        const message = await channel.messages.fetch(messageID).catch(error => Logger.error(error.message));
        if (!message) return msg.reply('`Error: Message not found!`');
        const alreadyExists = await GuildReactionConfig.findAll({
            where: {
                messageID: messageID,
                emoji: emoji.identifier || emoji,
                role: role.id
            }
        });
        if (alreadyExists.length !== 0) return msg.reply('`Error: A configuration already exists on this message using this emoji and role!`');
        const createdReaction = await GuildReactionConfig.create({
            guildID: msg.guild.id,
            channelID: channel.id,
            messageID: messageID,
            emoji: emoji.identifier || emoji,
            role: role.id
        });
        await message.react(emoji);
        const embed = await new this.client.methods.Embed()
            .setTitle(`Reaction Successfully Created!`)
            .addField(`:star: Reaction Unique ID (Save This!)`, `**${createdReaction.reactionID}**`)
            .addField(`:link: Channel`, channel)
            .addField(`:id: messageID`, createdReaction.messageID)
            .addField(`:mag: Emoji`, createdReaction.emoji)
            .addField(`:diamond_shape_with_a_dot_inside: Role`, role)
            .setTimestamp(new Date())
            .setThumbnail(`https://i.imgur.com/5EFDz4Y.gif`)
            .setColor(`#f442a4`)
            .setFooter(this.client.user.username, this.client.user.displayAvatarURL());
        return msg.channel.send(embed); // Make me fancy
    }
};