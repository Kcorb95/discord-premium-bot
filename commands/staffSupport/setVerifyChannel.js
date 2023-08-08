const { Command } = require('commando');
const guildSettings = require('../../models/GuildSettings');

module.exports = class SetVerifyChannelCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setverifychannel',
            group: 'staffsupport',
            aliases: ['setverify', 'verifychannel'],
            memberName: 'set-verify-channel',
            description: 'Sets the channel for verification posts to mirror to.',
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'What channel should posts be redirected to?',
                    type: 'channel'
                }
            ]
        });
    }

    async run(msg, { channel }) {
        const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
        settings.verifyChannelID = channel.id;
        await settings.save().catch(console.error);
        return msg.reply(`I have successfully set ${channel} as the channel for verification requests.`);
    }
};