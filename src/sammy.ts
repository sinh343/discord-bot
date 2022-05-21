import { Client } from "discord.js"

// set up simple bot to send sammy a compliment when she dms the bot
export interface SammyBotConfig { }

export class SammyBot {
  public static setup(client: Client, config?: SammyBotConfig) {
    client.once('ready', () => {
      console.log('SammyBot initialized with config:')
      console.log(JSON.stringify(config, undefined, 2))
    })

    return client
  }
}