const { Command } = require('commando');
const Tags = require('../../models/Tags');

module.exports = class DeleteTagCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'deletetag',
            group: 'premium',
            aliases: ['dt', 'deletet', 'tagdelete', 'rt', 'removet', 'tagremove', 'dtag', 'rtag'],
            memberName: 'deletetag',
            description: 'Deletes a tag.',
            guildOnly: true,
            args: [
                {
                    key: 'tagID',
                    prompt: 'Which tag should be deleted?\n',
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
        if (tag) msg.reply(`Deleting tag...`).then(reply => {
            reply.delete({ timeout: 2000 });
            msg.delete({ timeout: 2000 });
        });
        else return msg.reply(`Error: Tag with the name ${tagID} not found!`).then(reply => {
            reply.delete({ timeout: 2000 });
            msg.delete({ timeout: 2000 });
        });
        Tags.destroy({
            where: {
                guildID: msg.guild.id,
                userID: msg.member.id,
                tagID: tagID
            }
        });
    }
};