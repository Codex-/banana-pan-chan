import { client } from "../../banana-pan-chan";
import config from "../../config";
import { addCommand, deleteCommand } from "../../db/commands";
import { getArgs, registerCmd } from "../../providers/commands";
import {
  AVAILABLE_PERMISSIONS,
  getRoleFromStr,
  Role,
} from "../../services/permissions";

const CMD_CHAR = config.Tmi.CommandCharacter;

class Cmd {
  @registerCmd(Role.Moderator, "cmd-add")
  public static async add(user: string, message: string): Promise<void> {
    const args = getArgs(message);
    if (args.length < 3) {
      await client.say(
        `@${user} not enough arguments supplied, "!cmd-add cmd ${AVAILABLE_PERMISSIONS} text"`
      );
      return;
    }

    const cmd = args[0];
    const permission = getRoleFromStr(args[1]);
    const body = args.slice(2).join(" ");

    try {
      addCommand(cmd, permission, body);
      await client.say(`@${user} successfully added ${CMD_CHAR}${cmd}`);
    } catch (error) {
      const msg: string = error.message;
      if (msg.includes("UNIQUE constraint failed")) {
        await client.say(
          `@${user} adding ${CMD_CHAR}${cmd} failed: already exists`
        );
        return;
      }
      throw error;
    }
  }

  @registerCmd(Role.Moderator, "cmd-remove")
  public static async remove(user: string, message: string): Promise<void> {
    const args = getArgs(message);
    if (args.length < 1) {
      await client.say(
        `@${user} not enough arguments supplied, "!cmd-remove cmd"`
      );
      return;
    }
    if (args.length > 1) {
      await client.say(
        `@${user} too many arguments supplied, "!cmd-remove cmd"`
      );
      return;
    }

    const cmd = args[0];

    const removed = deleteCommand(cmd);
    if (removed) {
      await client.say(`@${user} successfully removed ${CMD_CHAR}${cmd}`);
    } else {
      await client.say(
        `@${user} failed to remove ${CMD_CHAR}${cmd}, does the command exist?`
      );
    }
  }
}
