const { DataTypes, Model } = require('sequelize');
const Database = require('../structures/PostgreSQL');

class VoiceChannelStatistics extends Model {
}

VoiceChannelStatistics.init({
    primaryKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    timestamp: DataTypes.DATE,
    guildID: DataTypes.STRING,
    channelID: DataTypes.STRING,
    memberCount: DataTypes.INTEGER,
    voiceJoins: DataTypes.INTEGER,
    voiceLeaves: DataTypes.INTEGER,
}, { sequelize: Database.db });

module.exports = VoiceChannelStatistics;