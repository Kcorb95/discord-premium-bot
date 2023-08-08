const { Command } = require('commando');
const GuildSettings = require('../../models/GuildSettings');

module.exports = class ConfigureBirthdayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'configbirthday',
            group: 'config',
            aliases: ['cbirth', 'cbday', 'cbd'],
            memberName: 'configbirthday',
            description: 'Configures birthday posts for premium users.',
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'What channel should the announcement be posted?\n',
                    type: 'channel'
                },
                {
                    key: 'message',
                    prompt: 'What should the message be?\n',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { channel, message }) {
        const settings = await GuildSettings.findOne({ where: { guildID: msg.guild.id } }) || await GuildSettings.create({ guildID: msg.guild.id });
        let channelID = settings.birthdayChannelID;
        let announcementMessage = settings.birthdayAnnouncementMessage;
        channelID = channel.id;
        announcementMessage = message;
        settings.birthdayChannelID = channelID;
        settings.birthdayAnnouncementMessage = announcementMessage;
        await settings.save().catch(this.client.log.error);
        return msg.reply(`I have successfully set ${channel} as the channel for birthday announcements with the text being \`${message}\`.`);
    }
};