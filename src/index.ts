import 'dotenv/config'
import { Client, Intents } from "discord.js"
import { ReactionBotConfig, RoleReaction } from './roleReaction';
import { SammyBot, SammyBotConfig } from './sammy';


const reactionBotConfig: ReactionBotConfig = require('./assets/reactionBotConfig.json');
const sammyBotConfig: SammyBotConfig = require('./assets/sammyBotConfig.json');
const client = new Client({
  partials: ["CHANNEL"],
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_TYPING]
});

RoleReaction.setup(client, reactionBotConfig);
SammyBot.setup(client, sammyBotConfig);

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);
