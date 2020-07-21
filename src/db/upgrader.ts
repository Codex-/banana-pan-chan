import logger from "../utilities/logger";
import { getDbSchemaVersion } from "./bot";

const LABEL = "db-upgrader";

export const SCHEMA_VERSION = 0;

export function checkAndUpgradeTables(): void {
  const dbVersion = getDbSchemaVersion();

  if (dbVersion === SCHEMA_VERSION) {
    logger.verbose(LABEL, `Schema version up to date!`);
    return;
  }

  if (dbVersion > SCHEMA_VERSION) {
    const msg = `DB Version ${dbVersion} exceeds schema version ${SCHEMA_VERSION}`;
    logger.error(LABEL, msg);
    throw new Error(msg);
  }
}
