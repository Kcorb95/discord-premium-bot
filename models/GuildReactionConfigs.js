const { DataTypes, Model } = require('sequelize');
const Database = require('../structures/PostgreSQL');

class GuildReactionConfigs extends Model {
}

GuildReactionConfigs.init({
    guildID: DataTypes.STRING,
    channelID: DataTypes.STRING,
    messageID: DataTypes.STRING,
    reactionID: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    emoji: DataTypes.STRING,
    role: DataTypes.STRING
}, { sequelize: Database.db });

module.exports = GuildReactionConfigs;