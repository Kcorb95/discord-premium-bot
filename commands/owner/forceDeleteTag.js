const { Command } = require('commando');
const Tags = require('../../models/Tags');

module.exports = class ForceDeleteTagCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'fdt',
            group: 'premium',
            aliases: ['fdelete'],
            memberName: 'fdt',
            description: 'Deletes a tag (OWNER ONLY).',
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'tagID',
                    prompt: 'Which tag should be deleted?\n',
                    type: 'string',
                    parse: str => str.toLowerCase()
                },
                {
                    key: 'member',
                    prompt: 'Who does this tag belong to?',
                    type: 'member'
                }
            ]
        });
    }

    async run(msg, { tagID, member }) {
        const tag = await Tags.findOne({
            where: {
                guildID: msg.guild.id,
                userID: member.id,
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
                userID: member.id,
                tagID: tagID
            }
        });
    }
};