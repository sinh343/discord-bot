import 'dotenv/config'
import { Client, Guild, Intents, Role, TextChannel } from "discord.js"
import { ReactionBotConfig, RoleReaction } from './roleReaction';
import { SammyBot } from './sammy';


const reactionBotConfig: ReactionBotConfig = require('./assets/reactionBotConfig.json');
const sammyBotConfig = {};
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_MEMBERS]
});


RoleReaction.setup(client, reactionBotConfig);
SammyBot.setup(client, sammyBotConfig);

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);
