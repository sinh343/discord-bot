import { Client, Guild, Role, TextChannel } from "discord.js"

export interface ReactionBotConfig {
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

export class RoleReaction {
  public static setup(client: Client, reactionBotConfig: ReactionBotConfig) {
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
      try {
        const channels = channelsToWatch.map(channelId => client.channels.cache.get(channelId) as TextChannel).filter(Boolean)
        const guilds = guildsToWatch.map(guildId => client.guilds.cache.get(guildId))
        await Promise.all(channels.map(channel => channel.messages.fetch()))
        await Promise.all(guilds.map(guild => guild?.roles.fetch()))
        await Promise.all(guilds.map(guild => guild?.members.fetch()))
      } catch (error) {
        console.error(error)
        return console.error('failed to startup')
      }
      console.log('ReactionBot initialized with config:');
      console.log(JSON.stringify(reactionBotConfig, undefined, 2))
    });

    client.on('messageReactionAdd', async (reaction, user) => {
      try {
        const guild = reaction.message.guild;
        const channel = reaction.message.channel;
        const message = reaction.message;
        const emojiName = reaction.emoji.name;
        if (!guild || !emojiName || !channel || !message) {
          throw Error("required inputs could not be calculated")
        }
        console.log(guild.id, channel.id, message.id, emojiName, reactionBotConfig[guild.id][channel.id][message.id][emojiName])
        const config = reactionBotConfig[guild.id][channel.id][message.id][emojiName]

        if (config) {
          const role = getRoleFromGuild(guild, config.nameOfRoleToApply)
          const member = getMemberFromGuild(guild, user?.username)
          await member.roles.add(role)
          console.log(`${role.name} added to ${member.user.username}`)
        }
      } catch (error) {
        console.error(error)
      }
    });

    client.on('messageReactionRemove', async (reaction, user) => {
      try {
        const guild = reaction.message.guild;
        const channel = reaction.message.channel;
        const message = reaction.message;
        const emojiName = reaction.emoji.name;

        if (!guild || !emojiName || !channel || !message) {
          throw Error("required inputs could not be calculated")
        }
        console.log(guild.id, channel.id, message.id, emojiName, reactionBotConfig[guild.id][channel.id][message.id][emojiName])
        const config = reactionBotConfig[guild.id][channel.id][message.id][emojiName]
        if (config) {
          const role = getRoleFromGuild(guild, config.nameOfRoleToApply);
          const member = getMemberFromGuild(guild, user?.username);
          await member.roles.remove(role)
          console.log(`${role.name} removed from ${member.user.username}`)
        }
      } catch (error) {
        console.error(error)
      }
    });

    return client;
  }
}