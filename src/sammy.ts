import axios from "axios";
import { Client } from "discord.js"
import { getCompliemnt } from "./helpers/complimentr";

// set up simple bot to send sammy a compliment when she dms the bot
export interface SammyBotConfig {
  acceptedUserIds: string[]
}

export class SammyBot {
  public static setup(client: Client, config: SammyBotConfig) {
    client.once('ready', () => {
      console.log('SammyBot initialized with config:')
      console.log(JSON.stringify(config, undefined, 2))
    })

    client.on('message', async msg => {
      // messages the bot types will trigger this event so return if its a bot
      if (msg.author.bot) return
      if (msg.channel.type == 'DM' && config.acceptedUserIds.includes(msg.author.id)) {
        const compliement = await getCompliemnt();
        if (compliement) {
          msg.author.send(compliement);
        } else {
          msg.author.send(`there was a problem getting a compliment - shout at me to fix it!`)
        }
        return;
      }
    });

    return client
  }
}