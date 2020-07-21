import config from "./config.json";

interface BananaPanChanConfig {
  Tmi: TmiConfig;
  Logger: LoggerConfig;
  Twitch: Twitch;
}

interface LoggerConfig {
  /**
   * @example "info"
   */
  Level: string;
}

interface TmiConfig {
  /**
   * @example "YourOwnChannel"
   */
  Channel: string;

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

/**
 * An application must be registered via the Twitch Dev portal to get these details.
 */
interface Twitch {
  ClientId: string;
  ClientSecret: string;
}

export default config as BananaPanChanConfig;
