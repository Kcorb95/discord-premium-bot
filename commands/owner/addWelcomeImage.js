const { Command } = require('commando');
const guildSettings = require('../../models/GuildSettings');
const imgur = require('imgur');

module.exports = class AddWelcomeImageCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'addwelcomeimage',
            aliases: ['awi'],
            group: 'owner',
            memberName: 'addwelcomeimage',
            description: 'Adds a welcome image to the welcome embed.',
            guildOnly: true,
            ownerOnly: true
        });
    }

    async run(msg) {
        const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
        let welcome = settings.welcome;
        if (typeof welcome === 'undefined') welcome = {};
        if (typeof welcome.images === 'undefined') welcome.images = [];

        await msg.say(`Please enter a URL or upload the image that you would like to use?\nRespond with \`cancel\` to cancel the command. The command will automatically be cancelled in 60 seconds.`);
        let responded = false;
        let image;
        while (!responded) {
            const responses = await msg.channel.awaitMessages(msg2 => msg2.author.id === msg.author.id, {
                max: 1,
                time: 60 * 1000
            });

            if (!responses || responses.size !== 1) {
                return msg.say('Command cancelled');
            }

            image = responses.first();
            if (image.content.toLowerCase() === 'cancel' || image.content.toLowerCase() === 'quit' || image.content.toLowerCase() === 'abort') return msg.say('Command Cancelled.');
            responded = true;
        }

        if (image.attachments.array().length > 0) image.content = image.attachments.first().url;

        const json = await imgur.uploadUrl(image.content);

        welcome.images.push(json.data.link);
        settings.welcome = welcome;
        await settings.save();
        return msg.reply(`Added welcome image: ${json.data.link}`);
    }
};