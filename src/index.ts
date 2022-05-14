import 'dotenv/config'
import { Client, Intents, Role, TextChannel } from "discord.js"

interface EmojiConfig {
  [key: string]: {
    [key: string]: {
      nameOfRoleToApply: string
    }
  }
}

// Create a new client instance
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS]
});

const guildsToWatch = [
  "403626881649475584", // 49 gamerz
  "964205068935127120" // lobo dnd server
]

const channelsToWatch = [
  "974980882702139402", // 49 gamerz test channel
  "966422654473089034", // lobo role-requets
];

const messagesToWatch = [
  "974986807542439987", // debug message in 49 gamerz
  "966427064188145724", // 18+
  "966427071469457510", // backup dm
  "966431504546811946" // dm
];

const emojiConfig: EmojiConfig = {
  "403626881649475584": {
    "4882_EpicBruh": { nameOfRoleToApply: "dnd role" }
  }
}
// When the client is ready, find channels that we care about and load all the messages into cache
client.once('ready', async () => {
  console.log('Ready!');
  const channels = channelsToWatch.map(channelId => client.channels.cache.get(channelId) as TextChannel).filter(Boolean)
  const guilds = guildsToWatch.map(guildId => client.guilds.cache.get(guildId))
  await Promise.all(channels.map(channel => channel.messages.fetch()))
  await Promise.all(guilds.map(guild => guild?.roles.fetch()))
});

client.on('messageReactionAdd', (reaction, user) => {
  if (messagesToWatch.includes(reaction.message.id)) {
    const guild = reaction.message.guild;
    if (!guild) {
      return console.error("error retrieveing discord server, no server found")
    }
    const emojiName = reaction.emoji.name;
    if (!emojiName) {
      return console.error("reaction emoji not found")
    }
    const config = emojiConfig[guild.id][emojiName]
    if (config) {
      const role: Role | undefined = guild.roles.cache.find(role => role.name === config.nameOfRoleToApply)
      if (!role) {
        return console.error(`no role found on server '${reaction.message.guild?.name}' matching name '${config.nameOfRoleToApply}'`)
      }
      const member = reaction.message.member;
      if (!member) {
        return console.error("failed to find member from reaction")
      }
      member.roles.add(role)
      console.log(`${role.name} added to ${member.user.username}`)
    }

  } else {
    console.log("reaction to something else")
  }
});

client.on('messageReactionRemove', (reaction, user) => {
  if (messagesToWatch.includes(reaction.message.id)) {
    const guild = reaction.message.guild;
    if (!guild) {
      return console.error("error retrieveing discord server, no server found")
    }
    const emojiName = reaction.emoji.name;
    if (!emojiName) {
      return console.error("reaction emoji not found")
    }

    const config = emojiConfig[guild.id][emojiName]
    if (config) {
      const role: Role | undefined = guild.roles.cache.find(role => role.name === config.nameOfRoleToApply)
      if (!role) {
        return console.error(`no role found on server '${reaction.message.guild?.name}' matching name '${config.nameOfRoleToApply}'`)
      }
      console.log(user)
      const member = guild.members.cache.find(member => member.user.username === user.username)
      if (!member) {
        return console.error(`failed to find member with username '${user.username}' from server '${guild.name}'`)
      }
      member.roles.remove(role)
      console.log(`${role.name} removed from ${member.user.username}`)
    }

  } else {
    console.log("reaction to something else")
  }
});

// Login to Discord with your client's token
client.login(process.env.DISCROD_BOT_TOKEN);


