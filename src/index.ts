import 'dotenv/config'
import { Client, Guild, Intents, Role, TextChannel } from "discord.js"

interface ReactionBotConfig {
  [guildId: string]: {
    [channelId: string]: {
      [messageId: string]: {
        [emojiName: string]: {
          nameOfRoleToApply: string
        }
      }
    }
  }
}

const reactionBotConfig: ReactionBotConfig = {
  "403626881649475584": {
    "974980882702139402": {
      "974986807542439987": {
        "4882_EpicBruh": { nameOfRoleToApply: "dnd role" }
      }
    }
  },
  "964205068935127120": {
    "966422654473089034": {
      "966427064188145724": {
        "underage": { nameOfRoleToApply: "Over 18" }
      },
      "966427071469457510": {
        "blue_book": { nameOfRoleToApply: "Back Up DM" }
      },
      "966431504546811946": {
        "book": { nameOfRoleToApply: "DM" }
      },
    }
  }
}

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS]
});



const { guildsToWatch, channelsToWatch } = Object.keys(reactionBotConfig).reduce((acc, guildId) => {
  return {
    guildsToWatch: [...acc.guildsToWatch, guildId],
    channelsToWatch: [
      ...acc.channelsToWatch,
      ...Object.keys(reactionBotConfig[guildId])
    ]
  }
}, { guildsToWatch: [] as string[], channelsToWatch: [] as string[] })


const getRoleFromGuild = (guild: Guild, roleName: string): Role => {
  const role: Role | undefined = guild.roles.cache.find(role => role.name === roleName);
  if (!role) {
    throw Error(`no role matching '${roleName}' on server ${guild.name}`);
  }
  return role;
}

const getMemberFromGuild = (guild: Guild, username: string | null) => {
  if (!username) {
    throw Error("no username given")
  }
  const member = guild.members.cache.find(member => member.user.username === username);
  if (!member) {
    throw Error(`no username matching '${username}' on server ${guild.name}`);
  }
  return member;
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
  const guild = reaction.message.guild;
  const channel = reaction.message.channel;
  const message = reaction.message;
  const emojiName = reaction.emoji.name;

  if (!guild || !emojiName || !channel || !message) {
    throw Error("required inputs could not be calculated")
  }

  const config = reactionBotConfig[guild.id][channel.id][message.id][emojiName]

  if (config) {
    const role = getRoleFromGuild(guild, config.nameOfRoleToApply)
    const member = reaction.message.member || getMemberFromGuild(guild, user?.username)
    member.roles.add(role)
    console.log(`${role.name} added to ${member.user.username}`)
  }
});

client.on('messageReactionRemove', (reaction, user) => {
  const guild = reaction.message.guild;
  const channel = reaction.message.channel;
  const message = reaction.message;
  const emojiName = reaction.emoji.name;

  if (!guild || !emojiName || !channel || !message) {
    throw Error("required inputs could not be calculated")
  }

  const config = reactionBotConfig[guild.id][channel.id][message.id][emojiName]
  if (config) {
    const role = getRoleFromGuild(guild, config.nameOfRoleToApply);
    const member = getMemberFromGuild(guild, user?.username);
    member.roles.remove(role)
    console.log(`${role.name} removed from ${member.user.username}`)
  }
});

// Login to Discord with your client's token
client.login(process.env.DISCROD_BOT_TOKEN);


