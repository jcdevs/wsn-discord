import { Client, Intents } from "discord.js";
import commands from "./commands";
import AutodeleteSetting from "./data/models/AutodeleteSetting";
import AutoforwardSetting from "./data/models/AutoforwardSetting";
import UsersLastActivity from "./data/models/UsersLastActivity";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGES,
  ]
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = commands.get(interaction.commandName);
	if (!command) return;

	try {
		console.info(`Received command ${interaction.commandName} from user ${interaction.user.tag} with options: \n`, interaction.options);
		await command.execute(interaction);
	} catch(e) {
		console.error(e);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on('messageCreate', async message => {
	const { channelId } = message;
	// check autodeletion
	try {
		// set autodeletion timer
		const setting = await AutodeleteSetting.findOne({
			where: { channelId }
		});
		if (setting && message.author.id !== client.user?.id && message.deletable) {
			setTimeout(() => {
				message.delete().catch(err => console.error("Failed to delete message: ", err));
			}, setting.seconds*1000);
		}
	} catch(e) {
		console.error("messageCreate failed to check autodeletion: ", e);
	}

	// check autoforwarding
	try {
		const setting = await AutoforwardSetting.findOne({
			where: { sourceId: channelId }
		});
		if (setting) {
			const destinationChannel = client.channels.cache.get(setting.destinationId);
			if (destinationChannel?.isText()) {
				const { author, content, createdAt, embeds } = message;
				const time = `${createdAt.toLocaleDateString()}, ${createdAt.toLocaleTimeString()}`;
				const sourceChannel = client.channels.cache.get(channelId);
				// "all" channel: 960973215923068978
				const tag = sourceChannel?.id == '960973215923068978' ? '@everyone\n' : '';
				// ‎ is an empty character that Discord's formatting won't trim
				const body = `‎\n${tag}${time} in ${sourceChannel}\n${author} - ${content}`;
				destinationChannel.send({
					content: body,
					embeds,
					allowedMentions: { parse: tag ? ['everyone'] : [] } // Prevents mentions from pinging
				});
			}
		}
	} catch(e) {
		console.error(`messageCreate failed to check autoforwarding: `, e);
	}

	// record last activity times
	try {
		if (!message.author.bot && message.guildId) {
			await UsersLastActivity.upsert({
				userId: message.author.id,
				serverId: message.guildId,
				epoch: message.createdTimestamp,
			});
		}
	} catch(e) {
		console.error(`messageCreate failed to record user's last activity: `, e);
	}
});
export default client;