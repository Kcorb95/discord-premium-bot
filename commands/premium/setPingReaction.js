const { Command } = require('commando');
const UserProfiles = require('../../models/UserProfiles');

module.exports = class SetPingReactionCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setpingreaction',
            group: 'premium',
            aliases: ['setping', 'pingreaction', 'setpingr', 'pr'],
            memberName: 'setpingreaction',
            description: 'Reacts with this emoji when someone mentions you.',
            guildOnly: true,
            args: [
                {
                    key: 'emoji',
                    prompt: 'What emoji do you want as your reply?\n',
                    type: 'emoji'
                }
            ]
        });
    }

    async run(msg, { emoji }) {
        const profile = await UserProfiles.findOne({
            where: {
                guildID: msg.guild.id,
                userID: msg.member.id
            }
        }) || await UserProfiles.create({ guildID: msg.guild.id, userID: msg.member.id });
        let tag = profile.tagEmoji;
        tag = emoji.identifier || emoji;
        profile.tagEmoji = tag;
        await profile.save().catch(this.client.log.error);
        await msg.reply(`Response set as: ${emoji}`);
    }
};