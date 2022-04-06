import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import db from "../data/sqlite-client";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('useractivity')
		.setDescription("Provides information on user activity.")
		.addStringOption(option => {
			option
			.setName('direction')
			.setDescription("Whether to list 'active' or 'inactive' users.")
			.addChoice('active', 'active')
			.addChoice('inactive', 'inactive')
			.setRequired(true);
			return option;
		})
		.addNumberOption(option => {
			option
			.setName('days')
			.setDescription('How many days to look back upon for activity.')
			.setRequired(true);
			return option;
		}),
	async execute(interaction: CommandInteraction) {
		if (!interaction.memberPermissions?.has("ADMINISTRATOR", true)) {
			return;
		}
		if (!interaction.guildId){
			interaction.reply('Unable to get server id.');
			return;
		}
		const direction = interaction.options.getString('direction');
		const days = interaction.options.getNumber('days');
		if (!days) {
			interaction.reply('Must enter parameter for days.');
			return;
		}

		const epoch = Date.now() - days*24*60*60*1000;
		if (direction === 'active') {
			db.all(`SELECT userId FROM usersLastActivity WHERE epoch > :epoch`, {
				':epoch': epoch
			}, (err, rows) => {
				if (err) {
					console.error(`Failed to get active users: `, err);
					interaction.reply(`Failed to query active users`);
				} else {
					const mentions = rows.map(row => `<@${row.userId}>`);
					const content = `Users active within the last ${days} days:\n${mentions.length ? mentions.join("\n") : 'None!'}`;
					interaction.reply({
						content,
						allowedMentions: { parse: [] } // Prevents mentions from pinging
					});
				}
			});
		} else if(direction === 'inactive') {
			db.all(`SELECT userId FROM usersLastActivity WHERE epoch < :epoch`, {
				':epoch': epoch
			}, (err, rows) => {
				if (err) {
					console.error(`Failed to get inactive users: `, err);
					interaction.reply(`Failed to query inactive users`);
				} else {
					const mentions = rows.map(row => `<@${row.userId}>`);
					const content = `Users inactive within the last ${days} days:\n${mentions.length ? mentions.join("\n") : 'None!'}`;
					interaction.reply({
						content,
						allowedMentions: { parse: [] } // Prevents mentions from pinging
					});
				}
			});
		}
	},
};