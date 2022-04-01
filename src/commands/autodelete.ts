import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('autodelete')
		.setDescription('Configures a channel for autodeletion on a given interval.'),
	async execute(interaction: CommandInteraction) {
		await interaction.reply('Not yet implemented.');
	},
};