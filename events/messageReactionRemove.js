const GuildReactionConfig = require('../models/GuildReactionConfigs');

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
    const Reaction = await GuildReactionConfig.findAll({
        where: {
            guildID: message.guild.id,
            channelID: channel.id,
            messageID: message.id,
            emoji: reaction.emoji.identifier || reaction.emoji.name || reaction.emoji.id
        }
    });
    if (Reaction.length === 0) return null;

    Reaction.map(async reaction => {
        const role = await guild.roles.get(reaction.role);
        if (!role) return null;
        await member.roles.remove(role);
    });
};