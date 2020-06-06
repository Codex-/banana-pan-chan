import { db } from "./provider";

const COLUMNS = "command, body";
const TABLE = "Commands";

interface CmdRow {
  command: string;
  body: string;
}

export function getAllCommands(): CmdRow[] {
  const sql = `SELECT ${COLUMNS} FROM ${TABLE};`;
  const statement = db.prepare(sql);
  return statement.all();
}

export function addCommand(cmd: string, body: string): void {
  const sql = `INSERT INTO ${TABLE} (${COLUMNS}) VALUES (@command, @body);`;
  const statement = db.prepare(sql);
  const tx = db.transaction(() => {
    statement.run({ command: cmd, body: body });
  });
  tx();
}

export function deleteCommand(cmd: string): boolean {
  const sql = `DELETE FROM ${TABLE} WHERE command = '${cmd}';`;
  const statement = db.prepare(sql);
  const result = statement.run();
  return !!result.changes;
}
