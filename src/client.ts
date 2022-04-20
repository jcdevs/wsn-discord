import { Client, Collection, Intents, TextBasedChannel } from "discord.js";
import { Op } from "sequelize";
import commands from "./commands";
import AutodeleteSetting from "./data/models/AutodeleteSetting";
import AutoforwardRoleDestination from "./data/models/AutoforwardRoleDestination";
import AutoforwardSource from "./data/models/AutoforwardSource";
import UsersLastActivity from "./data/models/UsersLastActivity";

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

client.on('messageCreate', async message => {
	const { channelId } = message;
	// check autodeletion
	try {
		// set autodeletion timer
		const setting = await AutodeleteSetting.findOne({
			where: { channelId }
		});
		if (setting && message.author.id !== client.user?.id && message.deletable) {
			setTimeout(() => {
				message.delete().catch(err => console.error("Failed to delete message: ", err));
			}, setting.seconds*1000);
		}
	} catch(e) {
		console.error("messageCreate failed to check autodeletion: ", e);
	}

	// check autoforwarding
	try {
		const setting = await AutoforwardSource.findOne({
			where: { sourceId: channelId }
		});
		if (setting) {
			let { channels } = message.mentions;

			if (!channels.size) {
				// default to the destination channels associated with author's roles if no channels were mentioned
				const roles = message.member?.roles.cache;

				if (roles) {
					const authorRoleIds = [...roles.keys()];
					const mappings = await AutoforwardRoleDestination.findAll({
						where: { roleId: { [Op.in]: authorRoleIds } }
					});
					const channelIds = mappings.map(record => record.channelId);

					channels = client.channels.cache.filter(chan => chan.type === 'GUILD_TEXT' && channelIds.includes(chan.id)) as Collection<string, TextBasedChannel> ;
				}
			}

			if (channels.size) {
				channels.each(channel => {
					if (channel.id !== channelId) {
						const { author, content, createdAt, embeds } = message;
						const alertEmojis = `:rotating_light: :rotating_light: :rotating_light:`;
						const time = `${createdAt.toLocaleDateString()}, ${createdAt.toLocaleTimeString()}`;
						const tag = '@here';
						// ‎ is an empty character that Discord's formatting won't trim
						const body = `‎\n${alertEmojis}\n${time} ${tag}\n${author} - ${content}`;
						channel.send({
							content: body,
							embeds,
							allowedMentions: { parse: tag ? ['everyone'] : [] } // Prevents mentions from pinging
						});
					}
				});
			}
		}
	} catch(e) {
		console.error(`messageCreate failed to check autoforwarding: `, e);
	}

	// record last activity times
	try {
		if (!message.author.bot && message.guildId) {
			await UsersLastActivity.upsert({
				userId: message.author.id,
				serverId: message.guildId,
				epoch: message.createdTimestamp,
			});
		}
	} catch(e) {
		console.error(`messageCreate failed to record user's last activity: `, e);
	}
});
export default client;