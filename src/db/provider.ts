import Database from "better-sqlite3";
import { readFileSync } from "fs";

import logger from "../utilities/logger";
import { checkAndUpgradeTables, SCHEMA_VERSION } from "./upgrader";
import { setDbSchemaVersion } from "./bot";

const LABEL = "db-provider";

const dbName = "bot.db";
const schemaFile = "schema.sql";

export const db = getDbInstance();

/**
 * Attempt to create database instance.
 */
function getDbInstance() {
  const newDb = new Database(`./sql/${dbName}`);
  logger.info(LABEL, `Successfully connected to ${dbName}`);
  return newDb;
}

/**
 * Loads the schema file and creates the tables required.
 */
function createTables(schemaSql: string[]): void {
  logger.debug(LABEL, `Creating required tables`);
  for (const createTableSql of schemaSql) {
    const createTable = db.prepare(createTableSql);
    const transaction = db.transaction(() => createTable.run());
    transaction();
  }
  setDbSchemaVersion(SCHEMA_VERSION);

  logger.debug(LABEL, `Tables created ${schemaSql.length} successfully`);
}

/**
 * Load the schema from the schema sql file.
 */
function loadSchemaFile(): string[] {
  logger.debug(LABEL, `Reading schema from ${schemaFile}`);
  const schemaSqlRaw = readFileSync(`./sql/${schemaFile}`, "utf-8").trim();
  const schemaSql: string[] = schemaSqlRaw
    .split(/([-]+ \w+ [-]+)/g)
    .filter((statement) => statement.indexOf("CREATE") > -1);

  return schemaSql;
}

/**
 * Check if tables have previously been created.
 *
 * Create tables if they do not exist.
 */
export function validateOrCreateTables(): void {
  const sql = `SELECT count(*) FROM sqlite_master WHERE type = 'table'`;
  const tables: number = db.prepare(sql).get()["count(*)"];

  if (tables === 0) {
    logger.debug(LABEL, `Database contains ${tables} tables`);
    const schemaSql = loadSchemaFile();
    createTables(schemaSql);
  }

  checkAndUpgradeTables();
}
