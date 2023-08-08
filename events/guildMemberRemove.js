const guildSettings = require('../models/GuildSettings');
const WelcomeMessages = require('../structures/WelcomeMessages');

exports.run = async (bot, member) => {
    const settings = await guildSettings.findOne({ where: { guildID: member.guild.id } });
    if (!settings) return;
    WelcomeMessages.removeFromJoins(member.id);
};
