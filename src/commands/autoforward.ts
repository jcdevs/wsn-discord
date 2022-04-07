import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import AutoforwardSetting from "../data/models/AutoforwardSetting";

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
				try {
					await AutoforwardSetting.destroy({
						where: { sourceId: source.id }
					});
					interaction.reply(`Removed autoforward settings for #${source.name}`);
				} catch(e) {
					console.error('Failed to delete autoforward settings: ', e);
					interaction.reply(`Failed to remove autodeletion settings for #${source.name}`);
				}
			} else {
				try {
					await AutoforwardSetting.upsert({
						serverId: guildId,
						sourceId: source.id,
						destinationId: destination.id,
					});
					interaction.reply(`Configured autoforwarding from source #${source.name} to destination #${destination.name}`);
				} catch(e) {
					console.error('Failed to upsert autoforward settings: ', e);
					interaction.reply(`Failed to configure autoforwarding from source #${source.name} to desination #${destination.name}`);
				}
			}
		}
	},
};