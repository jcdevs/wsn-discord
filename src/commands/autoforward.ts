import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import AutoforwardRoleDestination from "../data/models/AutoforwardRoleDestination";
import AutoforwardSource from "../data/models/AutoforwardSource";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("autoforward")
		.setDescription("Configures a channel and certain roles to autoforward to other channels.")
		.addSubcommand(sub => {
			sub
				.setName("map")
				.setDescription("Associate a role with a default channel. Channel mentions will override these mappings.")
				.addRoleOption(option => {
					option
						.setName("role")
						.setDescription("The role.")
						.setRequired(true);
					return option;
				})
				.addChannelOption(option => {
					option
					.setName("destination")
					.setDescription("The destination channel for this role.")
					.setRequired(true);
					return option;
				})
				.addBooleanOption(option => {
					option
						.setName("remove")
						.setDescription("If true, removes the mapping between this role and channel.");
					return option;
				})
			return sub;
		})
		.addSubcommand(sub => {
			sub
				.setName("trigger")
				.setDescription("Sets a source channel that will trigger the autoforward process.")
				.addChannelOption(option => {
					option
						.setName("source")
						.setDescription("The source channel.")
						.setRequired(true);
					return option;
				})
				.addBooleanOption(option => {
					option
						.setName("remove")
						.setDescription("If true, removes this channel from autoforwarding.");
					return option;
				});
			return sub;
		}),
	async execute(interaction: CommandInteraction) {
		if (!interaction.memberPermissions?.has("ADMINISTRATOR", true)) {
			return;
		}
		const { guildId } = interaction;
		const role = interaction.options.getRole('role');
		const destination = interaction.options.getChannel('destination');
		const source = interaction.options.getChannel('source');
		const remove = interaction.options.getBoolean('remove');

		if (role && destination) {
			if (remove) {
				try {
					await AutoforwardRoleDestination.destroy({
						where: { roleId: role.id }
					});
					interaction.reply(`Removed autoforward mapping for role ${role.name} to channel #${destination.name}`);
				} catch(e) {
					console.error('Failed to delete autoforward role mapping: ', e);
					interaction.reply(`Failed to remove role mapping for role ${role.name}`);
				}
			} else {
				try {
					await AutoforwardRoleDestination.upsert({
						serverId: guildId,
						roleId: role.id,
						channelId: destination.id,
					});
					interaction.reply(`Configured mapping for role ${role.name} to channel #${destination.name}`);
				} catch(e) {
					console.error('Failed to upsert autoforward role mapping: ', e);
					interaction.reply(`Failed to configure mapping for role ${role.name} to channel #${destination.name}`);
				}
			}
		}

		if (source) {
			if (remove) {
				try {
					await AutoforwardSource.destroy({
						where: { sourceId: source.id }
					});
					interaction.reply(`Removed autoforward settings for #${source.name}`);
				} catch(e) {
					console.error('Failed to delete autoforward settings: ', e);
					interaction.reply(`Failed to remove autodeletion settings for #${source.name}`);
				}
			} else {
				try {
					await AutoforwardSource.upsert({
						serverId: guildId,
						sourceId: source.id,
					});
					interaction.reply(`Configured autoforwarding from source #${source.name}`);
				} catch(e) {
					console.error('Failed to upsert autoforward settings: ', e);
					interaction.reply(`Failed to configure autoforwarding from source #${source.name}`);
				}
			}
		}
	},
};