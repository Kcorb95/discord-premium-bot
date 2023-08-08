const { Command } = require('commando');
const UserProfiles = require('../../models/UserProfiles');
const moment = require('moment');
moment.suppressDeprecationWarnings = true;

module.exports = class SetBirthdayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setbirthday',
            group: 'premium',
            aliases: ['sbd', 'setbd', 'setbday', 'birthday', 'bday'],
            memberName: 'setbirthday',
            description: 'Register your birthday with the bot so that it may be announced automatically.',
            guildOnly: true,
            args: [
                {
                    key: 'date',
                    prompt: 'What is the Month and Day of your birthday? (In Eastern Timezone!!!)\n',
                    type: 'string',
                    validate: date => {
                        let birthday = moment(date);
                        return birthday.isValid();
                    }
                }
            ]
        });
    }

    async run(msg, { date }) {
        const profile = await UserProfiles.findOne({ where: { userID: msg.member.id, guildID: msg.guild.id } }) || await UserProfiles.create({ userID: msg.member.id, guildID: msg.guild.id });
        let birthday = profile.birthday;
        birthday = moment(date).format('MM/DD');
        profile.birthday = birthday;
        await profile.save().catch(this.client.log.error);
        await msg.reply(`Birthday defined as: ${moment(date).format('MMMM Do')} in Eastern timezone.`);
    }
};