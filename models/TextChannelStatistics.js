const { DataTypes, Model } = require('sequelize');
const Database = require('../structures/PostgreSQL');

class TextChannelStatistics extends Model {
}

TextChannelStatistics.init({
    primaryKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    timestamp: DataTypes.DATE,
    guildID: DataTypes.STRING,
    channelID: DataTypes.STRING,
    messageCount: DataTypes.INTEGER,
    deletionCount: DataTypes.INTEGER,
}, { sequelize: Database.db });

module.exports = TextChannelStatistics;