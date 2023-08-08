const { DataTypes, Model } = require('sequelize');
const Database = require('../structures/PostgreSQL');

class JoinStatistics extends Model {
}

JoinStatistics.init({
    primaryKey: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    timestamp: DataTypes.DATE,
    guildID: DataTypes.STRING,
    userID: DataTypes.INTEGER,
    accountAge: DataTypes.INTEGER,
}, { sequelize: Database.db });

module.exports = JoinStatistics;