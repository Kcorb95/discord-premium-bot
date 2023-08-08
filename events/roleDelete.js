const GuildReactionConfig = require('../models/GuildReactionConfigs');

exports.run = async (bot, role) => {
    await GuildReactionConfig.destroy({ where: { guildID: role.guild.id, role: role.id } });
};