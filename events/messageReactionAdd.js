const GuildReactionConfig = require('../models/GuildReactionConfigs');
const GuildSettings = require('../models/GuildSettings');

exports.run = async (bot, reaction, user) => {
    if (user.bot) return null;
    const channel = reaction.message.channel;
    if (channel.type !== 'text') return null;
    const message = await channel.messages.fetch(reaction.message.id);
    const guild = message.guild;
    const member = await guild.members.fetch(user.id);

    processRoleReactions(guild, channel, message, reaction, member);
};

const processRoleReactions = async (guild, channel, message, reaction, member) => {
    const foundReactions = await GuildReactionConfig.findAll({
        where: {
            guildID: guild.id,
            channelID: channel.id,
            messageID: message.id,
            emoji: reaction.emoji.identifier || reaction.emoji.name || reaction.emoji.id
        }
    });
    if (foundReactions.length === 0) return null;
    const settings = await GuildSettings.findOne({ where: { guildID: guild.id } });
    if (settings.lockedReactionMessages.includes(message.id)) {
        await message.reactions.map(async messageReaction => {
            if (messageReaction.emoji.identifier === reaction.emoji.identifier || messageReaction.emoji.name === reaction.emoji.name) return null;
            const reactedUsers = await messageReaction.users.fetch();
            await reactedUsers.map(async reactedUser => {
                if (reactedUser.id === member.id) {
                    await messageReaction.users.remove(reactedUser);
                }
            });
        });
    }
    foundReactions.map(async reaction => {
        const role = await guild.roles.get(reaction.role);
        if (!role) return null;
        await member.roles.add(role);
    });
};