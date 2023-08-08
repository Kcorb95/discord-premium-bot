const { Command } = require('commando');
const GuildPingRoles = require('../../models/GuildPingRoles');

module.exports = class UnlockPingRoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'lockping',
            group: 'pings',
            aliases: ['lping', 'lock'],
            memberName: 'lock-ping-role',
            description: 'Denies ALL to mention a role.',
            details: `Denies ALL to mention a role.`,
            guildOnly: true,
            whitelist: { roles: true },
            args: [
                {
                    key: 'role',
                    prompt: 'What role should be locked?',
                    type: 'role'
                }
            ]
        });
    }

    async run(msg, { role }) {
        const pingRole = await GuildPingRoles.findAll({
            where: {
                guildID: msg.guild.id,
                roleID: role.id
            }
        });
        if (pingRole.length === 0) return msg.reply('`Error: This role is not permitted to be locked!`').then(reply => {
            msg.delete({ timeout: 2500 });
            reply.delete({ timeout: 2000 });
        });
        await role.setMentionable(false, `${msg.author.username} did a good and re-locked after pinging!`);
        msg.react(`✅`).then(msg.delete({ timeout: 1500 }));
    }
};