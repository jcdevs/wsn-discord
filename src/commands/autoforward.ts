import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import autoforwardSettings from "../data/autoforwarding-settings";
import db from "../data/sqlite-client";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('autoforward')
		.setDescription('Configures a channel to forward messages to another.')
		.addChannelOption(option => {
			option
			.setName("source")
			.setDescription("The source channel.")
			.setRequired(true);
			return option;
		})
		.addChannelOption(option => {
			option
			.setName("destination")
			.setDescription("The destination. Set equal to source channel to disable autoforwarding for the given channel.")
			.setRequired(true);
			return option;
		}),
	async execute(interaction: CommandInteraction) {
		if (!interaction.memberPermissions?.has("ADMINISTRATOR", true)) {
			return;
		}
		const { guildId } = interaction;
		const source = interaction.options.getChannel('source');
		const destination = interaction.options.getChannel('destination');

		if (source && destination) {
			if (source.id === destination.id) {
				db.run(`DELETE FROM autoforwardSettings WHERE sourceId = :sourceId`, {
					":sourceId": source.id
				}, err => {
					if (err) {
						console.error('Failed to delete autoforward settings: ', err);
						interaction.reply(`Failed to remove autodeletion settings for #${source.name}`);
					} else {
						autoforwardSettings.delete(source.id);
						interaction.reply(`Removed autoforward settings for #${source.name}`);
					}
				});
			} else {
				db.run(`INSERT INTO autoforwardSettings (serverId, sourceId, destinationId) VALUES (:serverId, :source, :destination)
					ON CONFLICT (sourceId, destinationId) DO UPDATE SET serverId = excluded.serverId, sourceId = excluded.sourceId, destinationId = excluded.destinationId`, {
						":serverId": guildId,
						":source": source.id,
						":destination": destination.id
				}, err => {
					if (err) {
						console.error('Failed to upsert autoforward settings: ', err);
						interaction.reply(`Failed to configure autoforwarding from source #${source.name} to desination #${destination.name}`);
					} else {
						autoforwardSettings.set(source.id, destination.id);
						interaction.reply(`Configured autoforwarding from source #${source.name} to destination #${destination.name}`);
					}
				});
			}
		}
	},
};