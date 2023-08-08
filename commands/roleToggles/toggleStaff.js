const { Command } = require('commando');
const guildSettings = require('../../models/GuildSettings');

module.exports = class ToggleStaffCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'togglestaff',
            group: 'roletoggles',
            aliases: ['tstaff', 'givemestaff'],
            memberName: 'toggle-staff',
            description: 'Toggles your visibility on the sidebar as staff.',
            guildOnly: true,
            whitelist: { roles: true }
        });
    }

    async run(msg) {
        const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
        const staffRole = await msg.guild.roles.get(settings.staffRoleID);
        if (!staffRole) return msg.reply('**Error:** `Staff Role not configured!`');
        if (msg.member.roles.has(staffRole.id)) msg.member.roles.remove(staffRole);
        else msg.member.roles.add(staffRole);
    }
};