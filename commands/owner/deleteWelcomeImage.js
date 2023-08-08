const { Command } = require('commando');
const guildSettings = require('../../models/GuildSettings');

module.exports = class DeleteWelcomeImageCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'deletewelcomeimage',
            aliases: ['dwi'],
            group: 'owner',
            memberName: 'deletewelcomeimage',
            description: 'Deletes a welcome image from the welcome embeds.',
            guildOnly: true,
            ownerOnly: true
        });
    }

    async run(msg) {
        const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
        let welcome = settings.welcome;
        if (typeof welcome === 'undefined') welcome = {};
        if (typeof welcome.images === 'undefined') welcome.images = [];

        for (let i = 0; i < welcome.images.length; i++) {
            msg.channel.send(welcome.images[i]);
        }
        await msg.say(`Please enter the URL of the image you would like to delete\nRespond with \`cancel\` to cancel the command. The command will automatically be cancelled in 60 seconds.`);
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

        if (welcome.images.indexOf(image.content) > -1)
            welcome.images.splice(welcome.images.indexOf(image.content), 1);
        settings.welcome = welcome;
        await settings.save();
        return msg.reply(`Removed welcome image: ${image.content}`);
    }
};