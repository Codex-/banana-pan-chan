import {
  createLogger,
  format,
  Logger as WinstonLogger,
  transports,
} from "winston";

import CONFIG from "../config";

const STD_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5,
};

class Logger {
  private internalLogger: WinstonLogger;

  constructor() {
    this.internalLogger = createLogger({
      level: CONFIG.Logger.Level,
      levels: STD_LEVELS,
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: "YYYY-MM-DD HH:MM:ss.SSS" }),
        this.generateFormatter()
      ),
      transports: [new transports.Console()],
    });
  }

  public info(label: string, message: string): void {
    this.internalLogger.info(message, {
      label: label,
    });
  }

  public warn(label: string, message: string): void {
    this.internalLogger.warn(message, {
      label: label,
    });
  }

  public error(label: string, message: string): void {
    this.internalLogger.error(message, {
      label: label,
    });
  }

  public verbose(label: string, message: string): void {
    this.internalLogger.verbose(message, {
      label: label,
    });
  }

  public debug(label: string, message: string): void {
    this.internalLogger.debug(message, {
      label: label,
    });
  }

  public silly(label: string, message: string): void {
    this.internalLogger.silly(message, {
      label: label,
    });
  }

  // Winston does not export the Format type from Logform.
  // tslint:disable-next-line: typedef
  private generateFormatter() {
    return format.printf((log) => {
      return (
        `${log.timestamp} ` +
        `[${log.label}] ` +
        `${log.level}: ` +
        `${log.message}`
      );
    });
  }
}

const logger = new Logger();

const TMI_LABEL = "tmi";
export const tmiLogger = {
  info: (msg: string): void => logger.info(TMI_LABEL, msg),
  warn: (msg: string): void => logger.warn(TMI_LABEL, msg),
  error: (msg: string): void => logger.error(TMI_LABEL, msg),
};

export default logger;
