const GuildSettings = require('../models/GuildSettings');
const UserProfiles = require('../models/UserProfiles');
const moment = require('moment');
const Logger = require('../structures/Logger');

module.exports = async client => {
    let now = moment();
    let midnight = moment(now).endOf('day');
    // let midnight = moment(now).add(5, 's');
    let dur = moment.duration(midnight.diff(now));
    setTimeout(() => handleBirthdays(), dur.asMilliseconds());


    const handleBirthdays = async () => {
        const guilds = await client.guilds;
        Logger.info(`Posting birthdays in ${guilds.size} guilds.....`);
        for (const guild of guilds) {
            let Guild = guild[1];
            const settings = await GuildSettings.findOne({ where: { guildID: Guild.id } });
            if (!settings || typeof settings.birthdayChannelID === 'undefined' || typeof settings.birthdayAnnouncementMessage === 'undefined') return null;
            const birthdayChannel = await Guild.channels.get(settings.birthdayChannelID);
            if (!birthdayChannel) return null;
            const birthdayProfiles = await checkBirthdays(Guild);
            await postBirthdays(birthdayProfiles, birthdayChannel, settings.birthdayAnnouncementMessage);
            Logger.info(`Posting birthdays Complete!`);
        }
    };

    const checkBirthdays = async guild => {
        const today = moment().format('MM/DD');
        const profiles = await UserProfiles.findAll({
            where: {
                guildID: guild.id,
                birthday: {
                    $eq: today
                }
            }
        });
        return profiles;
    };

    const postBirthdays = async (userProfiles, channel, message) => {
        userProfiles.map(async profile => {
            const member = await channel.guild.members.get(profile.userID);
            const birthdayMessage = message.replace('%user%', member);
            if (!member) return null;
            let embed = await new client.methods.Embed()
                .setTitle(`🎂 Happy Birthday ${member.displayName}!!! 🎂`)
                .setFooter(`Check out A-SS premium for more awesome features like this!`, member.user.displayAvatarURL())
                .setColor('#f442ee')
                .setThumbnail('https://i.imgur.com/2LR2Ghf.gif')
                .setDescription(birthdayMessage);
            channel.send(embed);
        });
    };

    handleBirthdays();
};