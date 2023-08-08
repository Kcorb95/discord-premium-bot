const GuildReactionConfig = require('../models/GuildReactionConfigs');

exports.run = async (bot, channel) => {
    if (channel.type === 'dm') return;
    await GuildReactionConfig.destroy({ where: { guildID: channel.guild.id, channelID: channel.id } });
};