const tmi = require("tmi.js");

import CONFIG from "./config";
import logger, { tmiLogger } from "./utilities/logger";
import { Client, UserState, ConnectionInfo } from "./types/tmi";
import { executeCommand } from "./commands";
import { executeMatchers } from "./matchers";

const LABEL = "BananaPan";

class BananaPanChan {
  private client: Client;
  private commandChar = CONFIG.Tmi.CommandCharacter;

  constructor() {
    this.client = this.createClient();
    this.bindMessageHandler();
  }

  public connect(): Promise<ConnectionInfo> {
    return this.client.connect();
  }

  public async say(
    channel: string,
    message: string,
    username?: string
  ): Promise<void> {
    try {
      await this.client.say(channel, message);
    } catch (error) {
      logger.error(
        `.say Ch: ${channel} Msg: ${message} ${
          username ? `User: ${username}` : ""
        }`,
        { label: LABEL }
      );
    }
  }

  private createClient(): Client {
    return new tmi.client({
      clientId: "BananaPan",
      connection: {
        secure: true,
        reconnect: true,
      },
      identity: {
        username: CONFIG.Tmi.Username,
        password: CONFIG.Tmi.Token,
      },
      logger: tmiLogger,
    });
  }

  private bindMessageHandler() {
    this.client.on(
      "message",
      async (
        channel: string,
        userstate: UserState,
        message: string,
        bot: boolean
      ) => {
        if (message.length === 0 || bot) {
          return;
        }
        const userId = userstate["user-id"];
        const username = userstate.username || "";

        if (message[0] === this.commandChar) {
          logger.verbose(
            `Ch: ${channel} User: ${username}, ID: ${userId}, Command: ${message}`,
            { label: LABEL }
          );
          const command = message
            .substr(this.commandChar.length)
            .split(/\s+/g)[0];

          executeCommand(channel, username, command, message);
        } else {
          executeMatchers(username, message);
        }
      }
    );
  }
}

export const client = new BananaPanChan();

(async () => {
  await client.connect();
})();
