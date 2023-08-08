const { DataTypes, Model } = require('sequelize');
const Database = require('../structures/PostgreSQL');

class GuildStatistics extends Model {
}

GuildStatistics.init({
    primaryKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    timestamp: DataTypes.DATE,
    guildID: DataTypes.STRING,
    memberCount: DataTypes.INTEGER,
    guildJoins: DataTypes.INTEGER, // Update off-schedule, save on-schedule
    guildLeaves: DataTypes.INTEGER, // Update off-schedule, save on-schedule
    membersOnline: DataTypes.INTEGER,
    membersAFK: DataTypes.INTEGER,
    membersDND: DataTypes.INTEGER,
    membersActive: DataTypes.INTEGER, // Update off-schedule, save on-schedule
}, { sequelize: Database.db });

module.exports = GuildStatistics;