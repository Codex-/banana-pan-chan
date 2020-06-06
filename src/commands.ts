import { client } from "./banana-pan-chan";
import { getAllCommands } from "./db/commands";
import { importCogs } from "./utilities/cogs";
import logger from "./utilities/logger";

type Command = (user: string, message: string) => Promise<void>;
interface CommandStore {
  [id: string]: Command;
}

const LABEL = "commands";

const COMMAND_TABLE: CommandStore = {};

/**
 * Split message on whitespace into arguments.
 *
 * @param msg
 * @returns an array of strings representing command arguments.
 */
export function getArgs(msg: string): string[] {
  const message = msg.split(/\s+/g);
  return message.slice(1);
}

/**
 * Provides the decorator for registering bot commands.
 *
 * @param handles a list of commands to be handled by the decorated method.
 */
export function registerCmd(...handles: string[]): MethodDecorator {
  return (target: { [index: string]: any }, propertyKey: string | symbol) => {
    if (typeof propertyKey === "symbol") {
      return;
    }
    for (const handle of handles) {
      const newHandle = handle.toLowerCase();
      if (COMMAND_TABLE[newHandle]) {
        throw new Error(`Handle ${handle} already exists.`);
      }

      /**
       * Wrap the command to capture errors for more comprehensive logging.
       *
       * @param message
       */
      const wrappedCmd = async (username: string, message: string) => {
        try {
          await target[propertyKey](username, message);
        } catch (error) {
          error.label = `${LABEL}.${newHandle}`;
          throw error;
        }
      };

      COMMAND_TABLE[newHandle] = wrappedCmd;
    }
  };
}

export function loadFromDb(): void {
  const cmds = getAllCommands();
  for (const cmd of cmds) {
    COMMAND_TABLE[cmd.command] = () => client.say(cmd.body);
  }
  logger.info(LABEL, `Loaded ${cmds.length} commands from the database.`);

  // tslint:disable-next-line: no-console
  console.log(COMMAND_TABLE);
}

export async function executeCommand(
  username: string,
  command: string,
  message: string
): Promise<void> {
  try {
    if (COMMAND_TABLE[command]) {
      await COMMAND_TABLE[command](username, message);
      return;
    }
    logger.verbose(LABEL, `Command not found: ${command}`);
  } catch (error) {
    const cmdLabel = error.LABEL || LABEL;
    logger.error(cmdLabel, `${error.message}`);
    logger.debug(cmdLabel, `Stacktrace:\n${error.stack}`);
    await client.say(`@${username} Command failed 😔`);
  }
}

importCogs("command");
