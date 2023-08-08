const { Command } = require('commando');
const guildSettings = require('../../models/GuildSettings');

module.exports = class ToggleSpeakerCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'togglespeaker',
            group: 'roletoggles',
            aliases: ['tspeaker', 'tspeak', 'speak'],
            memberName: 'toggle-speaker',
            description: 'Toggles your visibility on the sidebar as staff.',
            guildOnly: true,
            whitelist: { roles: true },
            args: [
                {
                    key: 'member',
                    prompt: 'What member do you want to manage?\n',
                    type: 'member'
                }
            ]
        });
    }

    async run(msg, { member }) {
        const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
        const speakerRole = await msg.guild.roles.get(settings.speakerRoleID);
        if (!speakerRole) return msg.reply('**Error:** `Speaker Role not configured!`');
        if (member.roles.has(speakerRole.id)) member.roles.remove(speakerRole);
        else member.roles.add(speakerRole);
    }
};