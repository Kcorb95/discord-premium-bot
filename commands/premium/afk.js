const { Command } = require('commando');
const UserProfiles = require('../../models/UserProfiles');

module.exports = class ToggleAFKCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'afk',
            group: 'premium',
            memberName: 'afk',
            description: 'Toggles your AFK status.',
            guildOnly: true,
            args: [
                {
                    key: 'reason',
                    prompt: 'Why are you going AFK?\n',
                    type: 'string',
                    default: ''
                }
            ]
        });
    }

    async run(msg, { reason }) {
        const profile = await UserProfiles.findOne({ where: { userID: msg.member.id, guildID: msg.guild.id } }) || await UserProfiles.create({ userID: msg.member.id, guildID: msg.guild.id });
        let AFK = profile.AFK;
        let afkReason = profile.AFKReason;
        if (reason.length > 0) {
            AFK = true;
            afkReason = reason;
            profile.AFK = AFK;
            profile.AFKReason = afkReason;
        } else {
            AFK = !AFK;
            afkReason = '';
            profile.AFKReason = afkReason;
            profile.AFK = AFK;
        }
        await profile.save().catch(this.client.log.error);
        await msg.react(AFK ? '💤' : '🌞').then(msg.delete({ timeout: 3000 }));
    }
};