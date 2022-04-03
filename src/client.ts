import { Client, Intents } from "discord.js";
import commands from "./commands";
import autodeleteIntervals from "./data/autodelete-intervals";

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
		await command.execute(interaction);
	} catch(e) {
		console.error(e);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on('messageCreate', message => {
  // set autodeletion timer
  const seconds = autodeleteIntervals.get(message.channelId);
  if (seconds && !message.author.bot && message.deletable) {
    setTimeout(() => {
      message.delete().catch(err => console.error("Failed to delete message: ", err));
    }, seconds*1000);
  }
});

export default client;