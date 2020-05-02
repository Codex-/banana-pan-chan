import config from "./config.json";

interface BananaPanChanConfig {
  Tmi: TmiConfig;
  Logger: LoggerConfig;
}

interface LoggerConfig {
    /**
     * @example "info"
     */
    Level: string;
}

interface TmiConfig {
    /**
     * @example "!"
     */
    CommandCharacter: string;

    /**
     * @example "oauth:my-bot-token"
     */
    Token: string;

    /**
     * @example "my-bot-name"
     */
    Username: string;
}

export default config as BananaPanChanConfig;
