import client from "./client.js";
import { BOT_TOKEN } from "./config.json";
import { deployCommands } from "./deploy-commands.js";

console.log("Deploying commands...");
deployCommands();
console.log("Starting bot...");
client.login(BOT_TOKEN);
