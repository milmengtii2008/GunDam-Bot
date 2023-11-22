require("dotenv").config()
const fs = require("node:fs");
const path = require("node:path");

const {DISCORD_TOKEN: token} = process.env;

//Require the necessary discord.js classes
const {Client, GatewayIntentBits, Collection} = require("discord.js");

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
});


//Load the events file on startup
const eventsPath = path.join(__dirname, "events");
const eventsFile = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));

for(const file of eventsFile) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if(event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

//Load the command file on startup
client.commands = new Collection();
const commandPath = path.join(__dirname, "commands")
const commandFile = fs.readdirSync(commandPath).filter((file) => file.endsWith(".js"));

for(const file of commandFile) {
    const filePath = path.join(commandPath, file);
    const command = require(filePath);
    if("data" in command && "execute" in command) {
        client.command.set(command.data.name, command);
    } else {
        console.log(
            `[WARNING] the command at ${filePath} is missing a required "data" or "execute property"`
        );
    }
}

client.login(token);