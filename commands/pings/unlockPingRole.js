const { Command } = require('commando');
const GuildPingRoles = require('../../models/GuildPingRoles');

module.exports = class UnlockPingRoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unlockping',
            group: 'pings',
            aliases: ['uping', 'unlock'],
            memberName: 'unlock-ping-role',
            description: 'Allows ALL to mention a role. Must unlock after usage!!',
            details: `Allows ALL to mention a role. Must unlock after usage!!`,
            guildOnly: true,
            whitelist: { roles: true },
            args: [
                {
                    key: 'role',
                    prompt: 'What role should be unlocked?',
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
        if (pingRole.length === 0) return msg.reply('`Error: This role is not permitted to be unlocked!`').then(reply => {
            msg.delete({ timeout: 2500 });
            reply.delete({ timeout: 2000 });
        });
        await role.setMentionable(true, `${msg.author.username} ping request`);
        setTimeout(async () => {
            await role.setMentionable(false, `${msg.author.username} was too slow or forgot!`);
        }, 120000);
        return msg.reply(`Make sure to re-lock with **${this.client.commandPrefix}lock ${role.name}** after ping!`).then(reply => {
            msg.delete({ timeout: 1500 });
            reply.delete({ timeout: 1000 });
        });
    }
};