import { createLogger, format, transports } from "winston";
import CONFIG from "../config";

const readableFormat = format.printf((log) => {
  return (
    `${log.timestamp} ` +
    `${log.label ? `[${log.label}] ` : ``}` +
    `${log.level}: ` +
    `${log.message}`
  );
});

const stdLevels = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5,
};

const logger = createLogger({
  level: CONFIG.Logger.Level,
  levels: stdLevels,
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: "YYYY-MM-DD HH:MM:ss.SSS" }),
    readableFormat
  ),
  transports: [new transports.Console()],
});

const TMI_PHASE = "tmi client";
export const tmiLogger = {
  info: (msg: string) => logger.info(msg, { label: TMI_PHASE }),
  warn: (msg: string) => logger.warn(msg, { label: TMI_PHASE }),
  error: (msg: string) => logger.error(msg, { label: TMI_PHASE }),
};

export default logger;
