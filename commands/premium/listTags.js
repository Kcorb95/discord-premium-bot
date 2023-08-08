const { Command } = require('commando');
const Tags = require('../../models/Tags');

module.exports = class ListTagsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'listtags',
            group: 'premium',
            aliases: ['lt', 'taglist', 'listt', 'tlist', 'ltag'],
            memberName: 'listtags',
            description: 'Lists all registered tags you have access to.',
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'Whose tags do you wish to see?\n',
                    type: 'member',
                    default: ''
                }
            ]
        });
    }

    async run(msg, args) {
        const member = args.member || msg.member;
        const tagsFound = await Tags.findAll({
            attributes: ['tagID', 'tagContent'],
            where: {
                guildID: msg.guild.id,
                userID: msg.member.id
            }
        });
        if (tagsFound.length === 0) return null;
        const tags = tagsFound.map(tag => `${tag.tagID} **--** ${tag.tagContent}`);

        const itemsPerPage = 5;
        let currentPage = 1;
        const totalPages = Math.ceil(tags.length / itemsPerPage);
        let index = 0;
        let message = '';
        const embed = await new this.client.methods.Embed()
            .setFooter(`Page ${currentPage}/${totalPages}`, this.client.user.displayAvatarURL())
            .setTimestamp(new Date())
            .setColor('#8B008B')
            .setTitle(`${member.displayName} has ${tags.length} tag(s) registered`);
        if (tags.length > itemsPerPage) {
            embed.setDescription(tags.slice(index, index + itemsPerPage).join('\n'));
            message = await msg.say(embed);
        } else {
            embed.setDescription(tags.join('\n'));
            return msg.say(embed);
        }

        await message.react('⬅');
        await message.react('➡');
        const filter = (reaction, user) => (!user.bot && user.id === msg.author.id && reaction.emoji.name === '⬅') || (!user.bot && user.id === msg.author.id && reaction.emoji.name === '➡');
        const collector = message.createReactionCollector(filter, { time: 60 * 1000 });
        collector.on('collect', async (reaction, user) => {
            if (reaction.emoji.name === '⬅') {
                if (currentPage !== 1) await generatePage('back');
            } else if (reaction.emoji.name === '➡') {
                if (currentPage !== totalPages) await generatePage('next');
            }
            await reaction.users.remove(user);
        });
        collector.on('end', () => message.reactions.removeAll());

        const generatePage = async pageControl => {
            if (pageControl === 'next') {
                index += itemsPerPage;
                currentPage++;
                if (index + itemsPerPage >= tags.length) await embed.setDescription(tags.slice(index, tags.length).join('\n'));
                else await embed.setDescription(tags.slice(index, index + itemsPerPage).join('\n'));
            } else if (pageControl === 'back') {
                index -= itemsPerPage;
                currentPage--;
                if (index + itemsPerPage >= tags.length) await embed.setDescription(tags.slice(index, tags.length).join('\n'));
                else await embed.setDescription(tags.slice(index, index + itemsPerPage).join('\n'));
            }
            await embed.setFooter(`Page ${currentPage}/${totalPages}`, msg.client.user.displayAvatarURL());
            message = await message.edit('', { embed });
        };
    }
};