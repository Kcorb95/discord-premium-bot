const { FriendlyError, SequelizeProvider } = require('commando');
const Discord = require('discord.js');
const CommandoClient = require('./structures/CommandoClient');

const { oneLine } = require('common-tags');
const path = require('path');

const { OWNER, TOKEN, COMMAND_PREFIX } = require('./settings');
const Logger = require('./structures/Logger');

const loadEvents = require('./functions/loadEvents.js');
const loadFunctions = require('./functions/loadFunctions.js');
const syncGuilds = require('./functions/syncGuilds.js');
const premiumBirthdays = require('./functions/premiumBirthdays');
const WelcomeMessages = require('./structures/WelcomeMessages');

const GuildSettings = require('./models/GuildSettings');
const GuildReactionConfig = require('./models/GuildReactionConfigs');

const client = new CommandoClient({
    owner: OWNER,
    commandPrefix: COMMAND_PREFIX,
    unknownCommandResponse: false,
    disableEveryone: true,
    clientOptions: { disabledEvents: ['USER_NOTE_UPDATE', 'VOICE_STATE_UPDATE', 'TYPING_START', 'VOICE_SERVER_UPDATE', 'PRESENCE_UPDATE'] }
});

client.setProvider(new SequelizeProvider(client.database));

client.on('error', Logger.error)
    .on('warn', Logger.warn)
    .once('ready', () => {
        Logger.info(oneLine`
			Client ready... Logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})
		`);

        client.user.setActivity('Check out Premium A-SS!');
        loadFunctions(client).then(() => {
            loadEvents(client);
            syncGuilds(client);
            premiumBirthdays(client);
            client.methods = {};
            client.methods.Collection = Discord.Collection;
            client.methods.Embed = Discord.MessageEmbed;
            client.log = Logger;
        });
    })
    .once('ready', async () => {
        await WelcomeMessages.initWelcomeMessages(client);
    })
    .on('disconnect', () => {
        Logger.warn(`[DISCORD]: [${Date.now()}] Disconnected! Exiting app in 10s.`);
        setTimeout(() => {
            process.exit('1');
        }, 10000);
    })
    .on('disconnect', () => {
        Logger.warn(`[DISCORD]: [${Date.now()}] Disconnected! Exiting app in 10s.`);
        setTimeout(() => {
            process.exit('1');
        }, 10000);
    })
    .on('reconnect', () => Logger.warn('[DISCORD]: Reconnecting...'))
    .on('raw', async data => {
        if (data.t === 'MESSAGE_REACTION_ADD') {
            const channel = await client.channels.resolve(data.d.channel_id);
            if (!channel || channel.type === 'dm') return;
            const message = await channel.messages.fetch(data.d.message_id);
            const user = await client.users.fetch(data.d.user_id);
            const config = await GuildReactionConfig.findAll({
                where: {
                    guildID: message.guild.id,
                    channelID: channel.id,
                    messageID: message.id,
                    emoji: data.d.emoji.identifier || data.d.emoji.name
                }
            });
            if (config.length !== 0)
                client.emit('messageReactionAdd', { message, emoji: data.d.emoji }, user);
        } else if (data.t === 'MESSAGE_REACTION_REMOVE') {
            const channel = await client.channels.resolve(data.d.channel_id);
            if (!channel || channel.type === 'dm') return;
            const message = await channel.messages.fetch(data.d.message_id);
            const user = await client.users.fetch(data.d.user_id);
            const config = await GuildReactionConfig.findAll({
                where: {
                    guildID: message.guild.id,
                    channelID: channel.id,
                    messageID: message.id,
                    emoji: data.d.emoji.identifier || data.d.emoji.name
                }
            });
            if (config.length !== 0)
                client.emit('messageReactionRemove', { message, emoji: data.d.emoji }, user);
        } else if (data.t === 'MESSAGE_DELETE') {
            const channel = await client.channels.resolve(data.d.channel_id);
            if (!channel || channel.type === 'dm') return;
            await GuildReactionConfig.destroy({
                where: {
                    guildID: channel.guild.id,
                    channelID: channel.id,
                    messageID: data.d.id
                }
            });
        }
    })
    .on('commandRun', (cmd, promise, msg, args) => {
        Logger.info(oneLine`
			[DISCORD]: ${msg.author.tag} (${msg.author.id})
			> ${msg.guild ? `${msg.guild.name} (${msg.guild.id})` : 'DM'}
			>> ${cmd.groupID}:${cmd.memberName}
			${Object.values(args).length ? `>>> ${Object.values(args)}` : ''}
		`);
    })
    .on('commandError', (cmd, err) => {
        if (err instanceof FriendlyError) return;
        Logger.error(`[DISCORD]: Error in command ${cmd.groupID}:${cmd.memberName}`, err);
    })
    .on('commandBlocked', (msg, reason) => {
        Logger.info(oneLine`
			[DISCORD]: Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; User ${msg.author.tag} (${msg.author.id}): ${reason}
		`);
    })
    .on('commandPrefixChange', (guild, prefix) => {
        Logger.info(oneLine`
			[DISCORD]: Prefix changed to ${prefix || 'the default'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
    })
    .on('commandStatusChange', (guild, command, enabled) => {
        Logger.info(oneLine`
			[DISCORD]: Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
    })
    .on('groupStatusChange', (guild, group, enabled) => {
        Logger.info(oneLine`
			[DISCORD]: Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
    });

client.registry
    .registerGroups([
        ['commands', 'Commands'],
        ['config', 'Config'],
        ['owner', 'Owner'],
        ['pings', 'Pings'],
        ['premium', 'Premium', { roles: true }],
        ['roletoggles', 'Role Toggles'],
        ['staffsupport', 'Staff Support'],
        ['util', 'Util']
    ])
    .registerDefaultTypes()
    .registerCommandsIn(path.join(__dirname, 'commands'))
    .registerDefaultCommands();

client.login(TOKEN);

process.on('unhandledRejection', err => {
    if (!err) return;

    let errorString = 'Uncaught Promise Error!!: \n';
    if (err.status === 400) return Logger.error(errorString += err.text || err.body.message); // eslint-disable-line consistent-return
    if (!err.response) return Logger.error(errorString += err.stack); // eslint-disable-line consistent-return

    if (err.response.text && err.response.status) {
        errorString += `Status: ${err.response.status}: ${err.response.text}\n`;
    }
    if (err.response.request && err.response.request.method && err.response.request.url) {
        errorString += `Request: ${err.response.request.method}: ${err.response.request.url}\n`;
    }
    Logger.error(errorString += err.stack);
});

exports.client = client;
