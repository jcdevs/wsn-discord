import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import AutodeleteSetting from "../data/models/AutodeleteSetting";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('autodelete')
		.setDescription('Configures a channel for autodeletion on a given interval.')
		.addChannelOption(option => {
			option
			.setName("channel")
			.setDescription("The channel")
			.setRequired(true);
			return option;
		})
		.addIntegerOption(option => {
			option
			.setName("seconds")
			.setDescription("The interval in seconds. Pass 0 to disable autodeletion for the given channel.")
			.setRequired(true);
			return option;
		}),
	async execute(interaction: CommandInteraction) {
		if (!interaction.memberPermissions?.has("ADMINISTRATOR", true)) {
			return;
		}
		const { guildId } = interaction;
		const channel = interaction.options.getChannel('channel');
		const seconds = interaction.options.getInteger('seconds');

		if (channel && seconds === 0) {
			try {
				await AutodeleteSetting.destroy({
					where: {
						channelId: channel.id,	
					}
				});
				interaction.reply(`Removed autodeletion settings for #${channel.name}`);
			} catch(e) {
				console.error('Failed to delete autodelete settings: ', e);
				interaction.reply(`Failed to remove autodeletion settings for #${channel.name}`);
			}
		} else if (channel && seconds) {
			try {
				await AutodeleteSetting.upsert({
					serverId: guildId,
					channelId: channel.id,
					seconds,
				});
				interaction.reply(`Configured #${channel.name} for autodeletion on a ${seconds} second interval.`);
			} catch(e) {
				console.error('Failed to upsert autodelete settings: ', e);
				interaction.reply(`Failed to configure autodeletion for #${channel.name}`);
			}
		}
	},
};