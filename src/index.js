const {
    BOT_TOKEN,
    DISCORD_CHANNEL,
    DISCORD_DISCRIMINATOR,
    DISCORD_USERNAME,
    WATCH_FILE,
    WRITE_FILE
} = require('./config.json');

const fs = require('fs');
const Discord = require('discord.js');
const watch = require('node-watch');
const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES] });

async function sendDiscord(content) {
    try {
        const logChannel = client.channels.cache.get(DISCORD_CHANNEL) || await client.channels.fetch(DISCORD_CHANNEL);
        logChannel.send(content);
        console.log(`Sent to Discord: ${content}`);
    } catch (err){
        console.log(err);
    }
}

client.on("messageCreate", function(message){
    if(message.author.username !== DISCORD_USERNAME && message.author.discriminator !== DISCORD_DISCRIMINATOR) return;

    try {
        fs.writeFileSync(WRITE_FILE, message.content);
        sendDiscord(`\`${message.content}\` written to ${WRITE_FILE}`);
    } catch(err) {
        console.error(err);
    }
});

console.log("Connecting to Discord");
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
client.login(BOT_TOKEN);

watch(WATCH_FILE, { recursive: false }, async function(evt, name) {
    console.log('%s changed', name);

    try {
        const line = fs.readFileSync(WATCH_FILE, { encoding: 'utf8' });
        sendDiscord(line);
    } catch(err) {
        console.error(err);
    }
});
