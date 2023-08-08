const UserProfiles = require('../models/UserProfiles');
const GuildSettings = require('../models/GuildSettings');
const moment = require('moment');

const spokenRecently = [];
const shouldGreet = [];

exports.run = async (bot, message) => {
    forwardDMs(bot, message);
    if (message.channel.id === '691537235090341968' && message.content.includes('Bump in ~15!! Please claim AND REMEMBER! If nobody has claimed, PLEASE CLAIM!!') )
        setTimeout(() => {
          message.channel.send('~2 MINUTES!! PLEASE CLAIM!! <@&662383396860723211>');
        }, 12 * 60 * 1000);
    if (message.channel.type === 'dm' || message.author.bot) return null; // ONLY continue if message is not a DM, not from a bot AND has mentions in it
    if (message.channel.id === '690998968871550998' || message.channel.id === '690998746355466312') filterSelfies(bot, message);
    const guildSettings = await GuildSettings.findOne({ where: { guildID: message.guild.id } });
    if (!guildSettings || !guildSettings.premiumRoleID) return null; // If no premium role found, do not continue
    const premiumMentions = await parseMentionsForPremium(message, guildSettings);
    const premiumProfiles = await fetchPremiumProfiles(premiumMentions);
    checkAFK(premiumProfiles, message);
    doFlair(premiumProfiles, message);

    if (!await message.member || !await message.member.roles.some(role => role.id === guildSettings.premiumRoleID)) return null; // Check if user has premium

    if (!spokenRecently.includes(message.member.id)) {
        reactBirthdays(message);
        spokenRecently.push(message.member.id);
        setTimeout(() => {
            const index = spokenRecently.indexOf(message.member.id); // remove the user from the list of recently spoken people
            spokenRecently.splice(index, 1);
        }, 2 * 60 * 1000);// 2-Minutes = 2 * 60 * 1000
    }

    if (!shouldGreet[message.guild.id]) shouldGreet[message.guild.id] = {};
    if (!shouldGreet[message.guild.id][message.member.id]) {
        doGreet(bot, message);
        setGreetingTimer(message);
    } else {
        clearTimeout(shouldGreet[message.guild.id][message.member.id]);
        setGreetingTimer(message);
    }
};

const filterSelfies = (bot, message) => {
    if (message.attachments.array().length === 0 && !message.member.hasPermission(`MANAGE_MESSAGES`)) message.delete();
};

const forwardDMs = (bot, message) => {
    if (message.channel.type === 'dm' && !message.author.bot) {
        const guild = bot.guilds.get('477140659581616128');
        const messageCenter = guild.channels.get('534204964080189440');
        if (message.attachments.array().length > 0)
            message.attachments.map(attachment => {
                return messageCenter.send(`**Member:** ${message.author} | ${message.author.username}#${message.author.discriminator} | ${message.author.id}\n**Date:** ${moment()
                    .format('LLLL')}\n**Content:**`, {
                    embed: {
                        image: {
                            url: `attachment://${attachment.name}`
                        }
                    },
                    files: [{
                        attachment: `${attachment.url}`,
                        name: attachment.name
                    }]
                });
            });
        else
            return messageCenter.send(`**Member:** ${message.author} | ${message.author.username}#${message.author.discriminator} | ${message.author.id}\n**Date:** ${moment()
                .format('LLLL')}\n**Content:** ${message.content}`);
    }
};

const setGreetingTimer = message => {
    const timer = setTimeout(() => {
        delete shouldGreet[message.guild.id][message.member.id];
    }, 8 * 60 * 60 * 1000); // 8 Hours = 8 * 60 * 60 * 1000
    shouldGreet[message.guild.id][message.member.id] = timer;
};

const doGreet = async (bot, message) => {
    const profile = await UserProfiles.findOne({
        where: {
            guildID: message.guild.id,
            userID: message.member.id
        }
    });
    if (!profile || !profile.greetingText) return null;
    let embed = await new bot.methods.Embed()
        .setAuthor(`Welcome back ${message.member.displayName}!`, message.member.user.displayAvatarURL())
        .setFooter(`Check out A-SS premium for more awesome features like this!`, bot.user.displayAvatarURL())
        .setColor('#8c63a5')
        .setDescription(`${profile.greetingText}\n\nIt is ${moment()
            .format('LLLL')}\nIs there anything I can do to assist you?\nI am at your service`);
    message.channel.send(embed)
        .then(reply => reply.delete({ timeout: 10000 }));
};

const reactBirthdays = async message => {
    const profile = await UserProfiles.findOne({
        where: {
            guildID: message.guild.id,
            userID: message.member.id
        }
    });
    if (!profile || typeof profile.birthday === null) return null;
    const today = moment()
        .format('MM/DD');
    if (profile.birthday === today && profile.birthdayReactionEnabled)
        message.react('🎂');
};

const doFlair = async (profiles, message) => {
    const reactions = profiles.map(async profile => {
        if (profile && profile.userID === '134349083568504832') {
            message.react('😩');
            message.react('🌰');
        } else {
            if (profile && profile.tagEmoji)
                message.react(profile.tagEmoji);
        }
    });
};

const checkAFK = async (profiles, message) => {
    let AFKResponse = ``; // Init the string that is to be replied
    const responses = await profiles.map(async profile => { // Okay so there MUST be some better way to do this but it's 12:30 AM and even if I promise to come back and find a better way to do this, you and I both know that won't happen...
        if (profile && profile.AFK) { // Profile should exist and be AFK
            const premiumMember = await message.guild.members.get(profile.userID);
            AFKResponse += `\n${premiumMember.displayName} is currently AFK...\n${profile.AFKReason.length > 0 ? `Reason: ${profile.AFKReason}` : ''}`; // If so, mark them AFK and then include the reason
        }
    });
    await Promise.all(responses); // So we have to do this because map won't wait for the promises to resolve inside of it for whatever reason. This makes sure it does before returning the message
    if (AFKResponse.length > 0) return message.reply(AFKResponse)
        .then(reply => reply.delete({ timeout: 10000 }));
};

const parseMentionsForPremium = async (message, guildSettings) => {
    const premiumMentions = await message.mentions.members.map(async member => {
        if (await member.roles.some(role => role.id === guildSettings.premiumRoleID))
            return member;
    });
    const resolved = await Promise.all(premiumMentions);
    return resolved;
};

const fetchPremiumProfiles = async members => {
    const profiles = await members.map(async member => {
        if (!member) return null;
        const profile = await UserProfiles.findOne({
            where: {
                guildID: member.guild.id,
                userID: member.id
            }
        });
        return profile;
    });
    const resolved = await Promise.all(profiles);
    return resolved;
};
