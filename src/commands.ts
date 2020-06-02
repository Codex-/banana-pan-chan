// import { importCogs } from "./utilities/cogs";
import logger from "./utilities/logger";
import { client } from "./banana-pan-chan";
import { importCogs } from "./utilities/cogs";

type Command = (
  channel: string,
  user: string,
  message: string
) => Promise<void>;
type CommandStore = {
  [id: string]: Command;
};

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
  return (
    target: { [index: string]: any },
    propertyKey: string | symbol,
    _: PropertyDescriptor
  ) => {
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
      const wrappedCmd = async (
        channel: string,
        username: string,
        message: string
      ) => {
        try {
          await target[propertyKey](channel, username, message);
        } catch (error) {
          error.label = `${LABEL}.${newHandle}`;
          throw error;
        }
      };

      COMMAND_TABLE[newHandle] = wrappedCmd;
    }
  };
}

export async function executeCommand(
  channel: string,
  username: string,
  command: string,
  message: string
): Promise<void> {
  try {
    if (COMMAND_TABLE[command]) {
      await COMMAND_TABLE[command](channel, username, message);
      return;
    }
    logger.verbose(LABEL, `Command not found: ${command}`);
  } catch (error) {
    client.say(channel, "Command failed :pensive:");
    const cmdLabel = error.LABEL || LABEL;
    logger.error(cmdLabel, `${error.message}`);
    logger.debug(cmdLabel, `Stacktrace:\n${error.stack}`);
  }
}

importCogs("command");
