import fs from "fs";
import Path from "path";

const COGS_DIR = Path.join(__dirname, "..", "cogs");

/**
 * Walk the cogs directory and import cogs of the type specified.
 *
 * @param type
 */
export function importCogs(type: string): void {
  if (!fs.existsSync(COGS_DIR)) {
    return;
  }

  const cogs = fs
    .readdirSync(COGS_DIR)
    .map((cogDir) =>
      fs
        .readdirSync(Path.join(COGS_DIR, cogDir))
        .filter((cogSrc) =>
          cogSrc.toLowerCase().match(new RegExp(`.${type}.js$`))
        )
        .map((filename) => Path.join(COGS_DIR, cogDir, filename))
    )
    .filter((results) => results.length > 0);

  for (const cog of cogs) {
    for (const command of cog) {
      require(command);
    }
  }
}
