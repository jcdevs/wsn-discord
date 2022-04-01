
import fs from "node:fs";
import { Collection } from "discord.js";
import path from "node:path";

const commands = new Collection<string, any>();
const dirPath = path.resolve(__dirname, './');
const cmdFiles = fs.readdirSync(dirPath).filter(file => file.endsWith('.js') && file !== 'index.js');

for (const file of cmdFiles) {
  const command = require(`./${file}`);
  if (command) {
    console.log(`Registering command: ${command.data.name}`);
    commands.set(command.data.name, command);
  }
}

export default commands;