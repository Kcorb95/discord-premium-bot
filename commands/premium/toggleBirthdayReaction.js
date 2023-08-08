const { Command } = require('commando');
const UserProfiles = require('../../models/UserProfiles');
const moment = require('moment');
moment.suppressDeprecationWarnings = true;

module.exports = class ToggleBirthdayResponseCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'togglebirthdayreaction',
            group: 'premium',
            aliases: ['tbr', 'togglebirthday', 'tbd'],
            memberName: 'togglebirthdayreaction',
            description: 'Register your birthday with the bot so that it may be announced automatically.',
            guildOnly: true
        });
    }

    async run(msg, { date }) {
        const profile = await UserProfiles.findOne({
            where: {
                userID: msg.member.id,
                guildID: msg.guild.id
            }
        }) || await UserProfiles.create({ userID: msg.member.id, guildID: msg.guild.id });
        let birthdayReaction = profile.birthdayReactionEnabled;
        birthdayReaction = !birthdayReaction;
        profile.birthdayReactionEnabled = birthdayReaction;
        await profile.save().catch(this.client.log.error);
        await msg.reply(`Birthday reaction has been ${birthdayReaction ? 'enabled' : 'disabled'}.`);
    }
};