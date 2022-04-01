import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { APP_ID, BOT_TOKEN } from './config.json';
import fs from "node:fs";
import path from "node:path";

export const deployCommands = async () => {
	try {
		const commands = [];
		const dirPath = path.resolve(__dirname, './commands');
		const cmdFiles = fs.readdirSync(dirPath).filter(file => file.endsWith('.js') && file !== 'index.js');

		for (const file of cmdFiles) {
			const command = require(`./commands/${file}`);
			commands.push(command.data.toJSON());
		}

		const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);

		await rest.put(Routes.applicationCommands(APP_ID), { body: commands })
			.then(() => console.log('Successfully registered application commands.'))
			.catch(console.error);
	} catch(e) {
		console.error("deployCommands -- ", e);
	}
}

deployCommands();