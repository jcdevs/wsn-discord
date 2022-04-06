import { Client, Intents } from "discord.js";
import commands from "./commands";
import autodeleteIntervals from "./data/autodelete-intervals";
import autoforwardSettings from "./data/autoforwarding-settings";
import { recordLastActivityTimestamp } from "./data/queries";

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

client.on('messageCreate', message => {
	const { channelId } = message;
  // set autodeletion timer
  const seconds = autodeleteIntervals.get(channelId);
  if (seconds && message.author.id !== client.user?.id && message.deletable) {
    setTimeout(() => {
      message.delete().catch(err => console.error("Failed to delete message: ", err));
    }, seconds*1000);
  }

	// check autoforwarding
	const destinationId = autoforwardSettings.get(channelId);
	if (destinationId) {
		const destinationChannel = client.channels.cache.get(destinationId);
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

	// record last activity times
	if (!message.author.bot && message.guildId) {
		recordLastActivityTimestamp(message.author.id, message.guildId, message.createdTimestamp);
	}
});

export default client;