import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import autodeleteIntervals from "../data/autodelete-intervals";
import db from "../data/sqlite-client";

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
			.setDescription("The interval in seconds. Pass 0 to turn autodeletion off for the given channel.")
			.setRequired(true);
			return option;
		}),
	async execute(interaction: CommandInteraction) {
		const { guildId } = interaction;
		const channel = interaction.options.getChannel('channel');
		const seconds = interaction.options.getInteger('seconds');

		if (channel && seconds === 0) {
			db.run(`DELETE FROM autodeleteSettings WHERE channelId = :channelId`,
				{ ":channelId": channel.id },
				err => {
					if (err) {
						console.error('Failed to delete autodelete settings: ', err);
						interaction.reply(`Failed to remove autodeletion settings for #${channel.name}`)
					} else {
						autodeleteIntervals.delete(channel.id);
						interaction.reply(`Removed autodeletion settings for #${channel.name}`);
					}
				}
			);
		} else if (channel && seconds) {
			db.run(`INSERT INTO autodeleteSettings (serverId, channelId, seconds) VALUES (:serverId, :channelId, :seconds)
				ON CONFLICT (channelId) DO UPDATE SET seconds = excluded.seconds`, {
					":serverId": guildId,
					":channelId": channel,
					":seconds": seconds
			}, err => {
				if (err) {
					console.error('Failed to upsert autodelete settings: ', err);
					interaction.reply(`Failed to configure autodeletion for #${channel.name}`)
				} else {
					interaction.reply(`Configured #${channel.name} for autodeletion on a ${seconds} second interval.`)
						.then(() => {
							autodeleteIntervals.set(channel.id, seconds);
						});
				}
			});
		}
	},
};