const { Command } = require('commando');
const GuildPingRoles = require('../../models/GuildPingRoles');

module.exports = class CreatePingToggleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'createping',
            group: 'owner',
            aliases: ['cpt', 'createping', 'registerpingrole', 'registerping', 'rpr'],
            memberName: 'create-ping-toggle',
            description: 'Registers a role in the bot for ping toggling.',
            details: `Registers a role in the bot for ping toggling.`,
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
        const alreadyExists = await GuildPingRoles.findAll({
            where: {
                guildID: msg.guild.id,
                roleID: role.id
            }
        });
        if (alreadyExists.length !== 0) return msg.reply('`Error: A configuration already exists for this role!`');
        const createdPing = await GuildPingRoles.create({
            guildID: msg.guild.id,
            roleID: role.id
        });
        const embed = await new this.client.methods.Embed()
            .setTitle(`Toggle Successfully Created!`)
            .addField(`:diamond_shape_with_a_dot_inside: Role`, role)
            .addField(`--`, `Use **${this.client.commandPrefix}unlock ${role.name}** to unlock this role!`)
            .setTimestamp(new Date())
            .setThumbnail(`https://i.imgur.com/5EFDz4Y.gif`)
            .setColor(`#f442a4`)
            .setFooter(this.client.user.username, this.client.user.displayAvatarURL());
        return msg.channel.send(embed);
    }
};