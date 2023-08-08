const { Command } = require('commando');
const Tags = require('../../models/Tags');
const { cleanContent } = require('../../functions/Util');
module.exports = class AddTagCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'addtag',
            group: 'premium',
            aliases: ['at', 'addt', 'tagadd', 'atag'],
            memberName: 'addtag',
            description: 'Registers a response with the provided key.',
            guildOnly: true,
            args: [
                {
                    key: 'tagID',
                    prompt: 'What is the name of this tag?\n',
                    type: 'string',
                    parse: str => str.toLowerCase()
                },
                {
                    key: 'tagContent',
                    prompt: 'What is the content of this tag?\n',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { tagID, tagContent }) {
        const existingTagFound = await Tags.findOne({
            where: {
                guildID: msg.guild.id,
                userID: msg.member.id,
                tagID: tagID
            }
        });
        if (existingTagFound) return msg.reply(`Error: There is already a tag with this name registered. Please try a different name.`).then(reply => {
            reply.delete({ timeout: 2000 });
            msg.delete({ timeout: 2000 });
        });
        const content = await cleanContent(tagContent, msg);
        const createdTag = await Tags.create({
            guildID: msg.guild.id,
            userID: msg.member.id,
            tagID: tagID,
            tagContent: content
        });
        await createdTag.save().catch(this.client.log.error);
        return msg.reply(`I have successfully registered a tag with the name ${tagID}!`).then(reply => {
            reply.delete({ timeout: 2000 });
            msg.delete({ timeout: 2000 });
        });
    }
};
