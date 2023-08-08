const { Command } = require('commando');
const guildSettings = require('../../models/GuildSettings');

module.exports = class SetStaffRoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setstaffrole',
            group: 'roletoggles',
            aliases: ['ssr'],
            memberName: 'set-staff-role',
            description: 'Sets the staff sidebar role.',
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'role',
                    prompt: 'What role should be used?',
                    type: 'role'
                }
            ]
        });
    }

    async run(msg, { role }) {
        const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
        settings.staffRoleID = role.id;
        await settings.save().catch(console.error);
        return msg.reply(`I have successfully set ${role} as the sidebar role.`);
    }
};