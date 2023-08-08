const { Command } = require('commando');
const Tags = require('../../models/Tags');

module.exports = class UseTagCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'tag',
            group: 'premium',
            aliases: ['t', '!'],
            memberName: 'tag',
            description: 'Posts a tag.',
            guildOnly: true,
            args: [
                {
                    key: 'tagID',
                    prompt: 'Which tag should be posted?\n',
                    type: 'string',
                    parse: str => str.toLowerCase()
                }
            ]
        });
    }

    async run(msg, { tagID }) {
        const tag = await Tags.findOne({
            where: {
                guildID: msg.guild.id,
                userID: msg.member.id,
                tagID: tagID
            }
        });
        if (tag) return msg.reply(`${tag.tagContent}`).then(reply => {
            reply.delete({ timeout: 25000 });
            msg.delete({ timeout: 10000 });
        });
    }
};
