const { DataTypes, Model } = require('sequelize');
const Database = require('../structures/PostgreSQL');

class UserProfiles extends Model {
}

UserProfiles.init({
    guildID: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    userID: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    AFK: DataTypes.BOOLEAN,
    AFKReason: DataTypes.STRING,
    tagEmoji: DataTypes.STRING,
    birthday: DataTypes.STRING,
    birthdayReactionEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    greetingText: DataTypes.STRING
}, { sequelize: Database.db });

module.exports = UserProfiles;