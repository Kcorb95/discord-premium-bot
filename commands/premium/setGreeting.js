const { Command } = require('commando');
const UserProfiles = require('../../models/UserProfiles');

module.exports = class SetGreetingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setgreeting',
            group: 'premium',
            aliases: ['sgreeting', 'sgreet', 'setreturn', 'sreturn', 'greeting', 'swelcome', 'setwelcome'],
            memberName: 'setgreeting',
            description: 'Sets the message the bot will send you when you return from being away.',
            guildOnly: true,
            args: [
                {
                    key: 'response',
                    prompt: 'What should the bot greet you upon returning?\n',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { response }) {
        const profile = await UserProfiles.findOne({
            where: {
                userID: msg.member.id,
                guildID: msg.guild.id
            }
        }) || await UserProfiles.create({ userID: msg.member.id, guildID: msg.guild.id });
        let greeting = profile.greetingText;
        greeting = response;
        profile.greetingText = greeting;
        await profile.save().catch(this.client.log.error);
        await msg.react('✔').then(msg.delete({ timeout: 3000 }));
    }
};