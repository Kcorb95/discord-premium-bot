const { Command } = require('commando');
const guildSettings = require('../../models/GuildSettings');

module.exports = class SetSpeakerRoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setspeakerrole',
            group: 'roletoggles',
            aliases: ['setspeaker', 'setspeak'],
            memberName: 'set-speaker-role',
            description: 'Sets the role for VC Speaking Perms.',
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'role',
                    prompt: 'What role should be used for this?',
                    type: 'role'
                }
            ]
        });
    }

    async run(msg, { role }) {
        const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
        settings.speakerRoleID = role.id;
        await settings.save().catch(console.error);
        return msg.reply(`I have successfully set ${role} as the speaking perms role.`);
    }
};