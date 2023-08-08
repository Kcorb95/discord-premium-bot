const { Command } = require('commando');
const GuildSettings = require('../../models/GuildSettings');

module.exports = class SetPremiumCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setpremiumrole',
            group: 'config',
            aliases: ['spr', 'setpremium'],
            memberName: 'setpremiumrole',
            description: 'Sets the premium role.',
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'role',
                    prompt: 'What is the ID of the role for premium?\n',
                    type: 'role'
                }
            ]
        });
    }

    async run(msg, { role }) {
        const settings = await GuildSettings.findOne({ where: { guildID: msg.guild.id } }) || await GuildSettings.create({ guildID: msg.guild.id });
        let id = settings.premiumRoleID;
        id = role.id;
        settings.premiumRoleID = id;
        await settings.save().catch(this.client.log.error);
        return msg.reply(`I have successfully set ${role} as the role for premium.`);
    }
};