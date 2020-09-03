// tslint:disable-next-line: no-var-requires
const tmi = require("tmi.js");

import CONFIG from "./config";
import * as db from "./db/provider";
import * as commands from "./providers/commands";
import { executeMatchers } from "./providers/matchers";
import { permissions } from "./services/permissions";
import { Client, ConnectionInfo, UserState } from "./types/tmi";
import logger, { tmiLogger } from "./utilities/logger";

const LABEL = "BananaPan";

class BananaPanChan {
  private client: Client;
  private commandChar = CONFIG.Tmi.CommandCharacter;

  constructor() {
    db.validateOrCreateTables();
    this.loadDbData();

    this.client = this.createClient();
    this.bindMessageHandler();
  }

  public async connect(): Promise<ConnectionInfo> {
    return this.client.connect();
  }

  public async say(message: string, username?: string): Promise<void> {
    try {
      await this.client.say(CONFIG.Tmi.Channel, message);
    } catch (error) {
      logger.error(
        LABEL,
        `.say Ch: ${CONFIG.Tmi.Channel} Msg: ${message} ${
          username ? `User: ${username}` : ""
        }`
      );
    }
  }

  public async getMods(): Promise<string[]> {
    try {
      return await this.client.mods(CONFIG.Tmi.Channel);
    } catch (error) {
      logger.error(
        LABEL,
        `.getMods Ch: ${CONFIG.Tmi.Channel} Failed to get moderators."
        }`
      );
    }
    return [];
  }

  public async getVIPs(): Promise<string[]> {
    try {
      return await this.client.vips(CONFIG.Tmi.Channel);
    } catch (error) {
      logger.error(
        LABEL,
        `.getVIPs Ch: ${CONFIG.Tmi.Channel} Failed to get VIPs."
        }`
      );
    }
    return [];
  }

  private createClient(): Client {
    return new tmi.client({
      clientId: "BananaPan",
      channels: [CONFIG.Tmi.Channel],
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

  private bindMessageHandler(): void {
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
            LABEL,
            `Ch: ${channel} User: ${username}, ID: ${userId}, Command: ${message}`
          );
          const command = message
            .substr(this.commandChar.length)
            .split(/\s+/g)[0];

          // tslint:disable-next-line: no-floating-promises
          commands.executeCommand(username, command, message);
        } else {
          // tslint:disable-next-line: no-floating-promises
          executeMatchers(username, message);
        }
      }
    );
  }

  private loadDbData(): void {
    commands.loadFromDb();
  }
}

export const client = new BananaPanChan();

// tslint:disable-next-line: no-floating-promises
(async () => {
  await client.connect();
  await permissions.loadUserPermissions();
})();
