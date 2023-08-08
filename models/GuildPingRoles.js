const { DataTypes, Model } = require('sequelize');
const Database = require('../structures/PostgreSQL');

class GuildPingRoles extends Model {
}

GuildPingRoles.init({
    guildID: DataTypes.STRING,
    roleID: DataTypes.STRING
}, { sequelize: Database.db });

module.exports = GuildPingRoles;