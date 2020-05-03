const tmi = require("tmi.js");

import CONFIG from "./config";
import logger, { tmiLogger } from "./utilities/logger";
import { Client, UserState } from "./types/tmi";
import { executeCommand } from "./commands";
import { executeMatchers } from './matchers';

const PHASE = "BananaPan";

class BananaPanChan {
  private client: Client;
  private commandChar = CONFIG.Tmi.CommandCharacter;

  constructor() {
    this.client = this.createClient();
    this.bindMessageHandler();
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
        { label: PHASE }
      );
    }
  }

  private createClient(): Client {
    return new tmi.Client({
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
        const username = `${userstate.username}`; // coerce undefined to empty string.

        if (message[0] === this.commandChar) {
          logger.verbose(
            `Ch: ${channel} User: ${username}, ID: ${userId}, Command: ${message}`,
            { label: PHASE }
          );
          const command = message
            .substr(this.commandChar.length)
            .split(/\s+/g)[0];

          executeCommand(command, username, command, message);
        } else {
          executeMatchers(username, message);
        }
      }
    );
  }
}

export const client = new BananaPanChan();
