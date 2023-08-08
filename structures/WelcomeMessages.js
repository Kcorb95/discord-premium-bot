const GuildSettings = require('../models/GuildSettings');
const { stripIndents, oneLine } = require('common-tags');

let MEMBERS_TO_WELCOME = [];
let client;
let assGuild;

class WelcomeMessages {
    static async initWelcomeMessages(bot) {
        client = bot;
        assGuild = await client.guilds.resolve(`217402245250154498`);
        setInterval(() => WelcomeMessages.postJoins(), 3 * 60 * 1000); // Post new joins every 3 minutes
    }

    static async postJoins() {
        if (MEMBERS_TO_WELCOME < 1) return null; // If nobody to welcome, do nothing
        const settings = await GuildSettings.findOne({ where: { guildID: assGuild.id } });
        if (!settings) return;
        if (!settings.welcome.enabled) return MEMBERS_TO_WELCOME = []; // If welcomes are disabled, only clear array so no crazy spam when enabled
        const channel = await assGuild.channels.get(settings.welcome.channel); // Get channel to post to
        const _members = await MEMBERS_TO_WELCOME.map(async member => await assGuild.members.fetch(member)); // process IDs into member objects
        const members = await Promise.all(_members);
        const random = Math.floor(Math.random() * settings.welcome.images.length); // For random image
        const embed = await new client.methods.Embed()
            .setAuthor(`Welcome to Anti-Social Society!`, assGuild.iconURL(), `https://twitter.com/AntiSocialSoc_`)
            .setColor(`#654FCA`)
            .setTitle(`Please welcome our new friends!`)
            .setImage(settings.welcome.images[random])
            .setDescription(stripIndents`
            ${members.join(' **--** ').toString()}
            
            Message **!join** to get started and unlock the rest of the channels!
            If you have any questions or need any help, please stop by <#392868100338352138>!
            `)
            .setFooter(`Member #${assGuild.memberCount} -- Join #${settings.joins}`, client.user.displayAvatarURL())
            .setTimestamp(new Date());
        await channel.send(members.join(' **--** '), embed).then(reply => reply.delete({ timeout: 15000 }));;
        return MEMBERS_TO_WELCOME = [];
    }

    static addToJoins(memberID) {
        // If member ID is NOT in array, add it. Otherwise do nothing.
        if (!MEMBERS_TO_WELCOME.includes(memberID)) MEMBERS_TO_WELCOME.push(memberID);
    }

    static removeFromJoins(memberID) {
        const index = MEMBERS_TO_WELCOME.indexOf(memberID); // Get index of member ID from array
        if (index !== -1) MEMBERS_TO_WELCOME.splice(index, 1); // IF IT EXISTS, remove it. Otherwise do nothing.
    }
}

module.exports = WelcomeMessages;
