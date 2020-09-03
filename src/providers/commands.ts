import { client } from "../banana-pan-chan";
import {
  getAllCommands,
  setAddDelegate,
  setDeleteDelegate,
} from "../db/commands";
import { permissions, Role } from "../services/permissions";
import { importCogs } from "../utilities/cogs";
import logger from "../utilities/logger";

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
 * @param permissionLevel the minimum role required to use a command.
 * @param handles a list of commands to be handled by the decorated method.
 */
export function registerCmd(
  permissionLevel: Role,
  ...handles: string[]
): MethodDecorator {
  return (target: { [index: string]: any }, propertyKey: string | symbol) => {
    if (typeof propertyKey === "symbol") {
      return;
    }
    for (const handle of handles) {
      const newHandle = handle.toLowerCase();
      if (COMMAND_TABLE[newHandle]) {
        throw new Error(`Handle ${handle} already exists.`);
      }

      const wrappedCmd = generateWrappedCmd(
        newHandle,
        permissionLevel,
        target[propertyKey] as Command
      );
      COMMAND_TABLE[newHandle] = wrappedCmd;
    }
  };
}

/**
 * Wrap the command to capture errors for more comprehensive logging.
 *
 * @param handle for logging purposes.
 * @param permissionLevel minimum permission level required to use the command.
 * @param cmd the raw command function.
 */
function generateWrappedCmd(
  handle: string,
  permissionLevel: Role,
  cmd: Command
): Command {
  return async (username: string, message: string) => {
    const cmdLabel = `${LABEL}.${handle}`;
    try {
      const permitted = await permissions.isUserPermitted(
        permissionLevel,
        username
      );

      if (!permitted) {
        logger.warn(cmdLabel, `${username}: Permission denied.`);
        return;
      }

      await cmd(username, message);
    } catch (error) {
      error.label = cmdLabel;
      throw error;
    }
  };
}

function addCmd(cmd: string, body: string): void {
  COMMAND_TABLE[cmd] = () => client.say(body);
  logger.verbose(LABEL, `Added ${cmd} to command store.`);
}

setAddDelegate(addCmd);

function deleteCmd(cmd: string): void {
  delete COMMAND_TABLE[cmd];
  logger.verbose(LABEL, `Deleted ${cmd} from command store.`);
}

setDeleteDelegate(deleteCmd);

export function loadFromDb(): void {
  const cmds = getAllCommands();
  for (const cmd of cmds) {
    const basicCmd = () => client.say(cmd.body);
    const wrappedCmd = generateWrappedCmd(cmd.command, cmd.role, basicCmd);
    COMMAND_TABLE[cmd.command] = wrappedCmd;
  }
  logger.info(LABEL, `Loaded ${cmds.length} commands from the database.`);
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
