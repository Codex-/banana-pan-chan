import { Role } from "../services/permissions";
import logger from "../utilities/logger";
import { db } from "./provider";

const LABEL = "db-cmd";

const COLUMNS = "command, role, body";
const TABLE = "Commands";

interface CmdRow {
  command: string;
  body: string;
}

/**
 * Called when a new command is added.
 */
type AddCmdDelegate = (cmd: string, body: string) => void;
let addDelegate: AddCmdDelegate = () => undefined;

/**
 * Called when a command is deleted.
 */
type DeleteCmdDelegate = (cmd: string) => void;
let deleteDelegate: DeleteCmdDelegate = () => undefined;

export function setAddDelegate(delegate: AddCmdDelegate): void {
  addDelegate = delegate;
}

export function setDeleteDelegate(delegate: DeleteCmdDelegate): void {
  deleteDelegate = delegate;
}

export function getAllCommands(): CmdRow[] {
  const sql = `SELECT ${COLUMNS} FROM ${TABLE};`;
  const statement = db.prepare(sql);
  return statement.all();
}

export function addCommand(cmd: string, role: Role, body: string): void {
  const sql = `INSERT INTO ${TABLE} (${COLUMNS}) VALUES (@command, @role, @body);`;
  const statement = db.prepare(sql);
  const tx = db.transaction(() => {
    statement.run({ command: cmd, role: role, body: body });
  });
  tx();

  logger.verbose(
    LABEL,
    `Inserted command: ${cmd}, role: ${role}, body: ${body}`
  );
  addDelegate(cmd, body);
}

export function deleteCommand(cmd: string): boolean {
  const sql = `DELETE FROM ${TABLE} WHERE command = '${cmd}';`;
  const statement = db.prepare(sql);
  const result = statement.run();

  const deleted = !!result.changes;
  if (deleted) {
    logger.verbose(LABEL, `Deleted command: ${cmd}`);
    deleteDelegate(cmd);
  }
  return deleted;
}
