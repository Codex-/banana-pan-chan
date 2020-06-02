import { db } from "./database";

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
