import logger from "../utilities/logger";
import { db } from "./provider";

const LABEL = "db-bot";

const TABLE = "Bot";

export function getDbSchemaVersion(): number {
  const sql = `SELECT schema_version FROM ${TABLE}`;
  const version: number = db.prepare(sql).get()[0];

  return version;
}

export function setDbSchemaVersion(version: number): void {
  const sql = `INSERT OR REPLACE INTO ${TABLE} (schema_version) VALUES (@schema_version);`;
  const statement = db.prepare(sql);
  const tx = db.transaction(() => {
    statement.run({ schema_version: version });
  });
  tx();

  logger.verbose(LABEL, `Set schema_version: ${version}`);
}
