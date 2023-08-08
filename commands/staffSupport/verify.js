const { Command } = require('commando');
const guildSettings = require('../../models/GuildSettings');
const { stripIndents } = require('common-tags');

module.exports = class VerifyCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'verify',
            group: 'staffsupport',
            guildOnly: true,
            memberName: 'verify',
            description: 'Use this command to verify your identity. This is to prevent catfishing.'
        });
    }

    async run(msg) {
        const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
        const verifyChannel = await msg.guild.channels.get(settings.verifyChannelID);
        if (!verifyChannel) return msg.reply('**Error:** `Verification Channel Not Defined!`');

        let error = false;
        await msg.member.send(stripIndents`To verify your identity in efforts to prevent catfishing (people pretending to be someone whom they are not),
        upload an image of **yourself** holding a piece of paper that has your discord username and tag written on it such as Akira#6969.
        *Note: We do not accept filtered or edited pictures. The picture must be clear and the handwriting on the paper must be readable. Your picture will* **never** *be shared with anyone else and only staff can see it in-order to approve!*`).catch(() => {
            error = true; // NOPE
            msg.reply(`\`Error!\` **Please enable Direct Messages in your Discord settings under Privacy & Safety before trying to do this!**`); // Inform the dude
        });
        if (error) return; // Don't Continue
        let responded = false;
        let response = '';
        const filter = message => message.author.id === msg.author.id;
        while (!responded) {
            const responses = await msg.author.dmChannel.awaitMessages(filter, { max: 1, time: 10 * 60 * 1000 });
            if (!responses || responses.size !== 1) return msg.member.send(`Whoops! Looks like you are busy. Please try again when you are ready.`);
            response = responses.first();
            if (['cancel', 'quit', 'abort'].includes(response.content.toString().toLowerCase())) return msg.member.send(`Cancelled!`);
            if (response.attachments.array().length > 0) responded = true;
        }
        const embed = new msg.client.methods.Embed()
            .setAuthor(`${msg.member.displayName}#${msg.author.discriminator} (${msg.member.id})`, msg.author.displayAvatarURL())
            .setDescription(`${msg.member} wants to verify!`)
            .setImage(response.attachments.first().url)
            .setFooter(`Please react to this message when it has been processed!`)
            .setTimestamp();
        await verifyChannel.send(`${msg.member}`);
        await verifyChannel.send(embed);
        
        return msg.member.send(`Awesome, thanks! A staff member will review your request shortly and you should either hear back if there was a problem, or your role will be automatically added! :smile:`);
    }
};
