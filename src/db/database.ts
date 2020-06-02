import Database from "better-sqlite3";

import logger from "../utilities/logger";
import { readFileSync } from "fs";

const LABEL = "db";

const dbName = "bot.db";
const schemaFile = "schema.sql";

export const db = new Database(`./sql/${dbName}`);

if (db !== undefined) {
  logger.info(LABEL, `Successfully connected to ${dbName}`);
}

/**
 * Load the schema from the schema sql file.
 *
 * @returns string array of statements to execute.
 */
function loadSchemaFile(): string[] {
  logger.debug(LABEL, `Reading schema from ${schemaFile}`);
  const schemaSqlRaw = readFileSync(`./sql/${schemaFile}`, "utf-8").trim();
  const schemaSql: string[] = schemaSqlRaw
    .split(/([\-]+ \w+ [\-]+)/g)
    .filter((statement) => statement.indexOf("CREATE") > -1);

  return schemaSql;
}

/**
 * Loads the schema file and creates the tables required.
 */
function createTables(): void {
  const schemaSql = loadSchemaFile();

  logger.debug(LABEL, `Creating required tables`);
  for (const createTableSql of schemaSql) {
    const createTable = db.prepare(createTableSql);
    const transaction = db.transaction(() => createTable.run());
    transaction();
  }

  logger.debug(LABEL, `Tables created successfully`);
}

/**
 * Check if tables have previously been created.
 * Does not validate the tables schema.
 */
export function checkTables(): void {
  // SQL to check if any tables exist.
  const sql: string = `SELECT count(*) FROM sqlite_master WHERE type = 'table'`;
  const tables: number = db.prepare(sql).get()["count(*)"];

  logger.debug(LABEL, `Database contains ${tables} tables`);

  if (tables === 0) {
    createTables();
  }

  // const x = db.prepare(
  //   "INSERT INTO `Commands` (command, body) VALUES ('lasik', 'yes, im very blind');"
  // );
  // console.log(x.run());
}
