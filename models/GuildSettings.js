const { DataTypes, Model } = require('sequelize');
const Database = require('../structures/PostgreSQL');

class GuildSettings extends Model {
}

GuildSettings.init({
    guildID: DataTypes.STRING,
    staffRoleID: DataTypes.STRING,
    speakerRoleID: DataTypes.STRING,
    verifyChannelID: DataTypes.STRING,
    requestChannelID: DataTypes.STRING,
    premiumRoleID: DataTypes.STRING,
    birthdayChannelID: DataTypes.STRING,
    birthdayAnnouncementMessage: DataTypes.STRING,
    joins: DataTypes.STRING,
    lockedReactionMessages: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    welcome: {
        type: DataTypes.JSONB(),
        defaultValue: {}
    },
}, { sequelize: Database.db });

module.exports = GuildSettings;