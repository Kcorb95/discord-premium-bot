const { DataTypes, Model } = require('sequelize');
const Database = require('../structures/PostgreSQL');

class Tags extends Model {
}

Tags.init({
    guildID: DataTypes.STRING,
    userID: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    tagID: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    tagContent: DataTypes.STRING
}, { sequelize: Database.db });

module.exports = Tags;