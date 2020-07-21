import { importCogs } from "../utilities/cogs";
import logger from "../utilities/logger";

type MatcherMethod = (username: string, message: string) => Promise<void>;
interface MatcherEntry {
  regex: RegExp;
  method: MatcherMethod;
}

const LABEL = "matchers";

const MATCHER_ARRAY: MatcherEntry[] = [];

/**
 * Provides the decorator for registering message matchers.
 *
 * @param regex the regular expression to test messages with.
 */
export function registerMatcher(regex: RegExp): MethodDecorator {
  return (target: { [index: string]: any }, propertyKey: string | symbol) => {
    if (typeof propertyKey === "symbol") {
      return;
    }

    /**
     * Wrap the matcher method to capture errors for more comprehensive logging.
     *
     * @param message
     */
    const wrappedMatcher: MatcherMethod = async (
      username: string,
      message: string
    ) => {
      try {
        await target[propertyKey](username, message);
      } catch (error) {
        error.label = `${LABEL}.${regex}`;
        throw error;
      }
    };

    MATCHER_ARRAY.push({
      regex,
      method: wrappedMatcher,
    });
  };
}

export async function executeMatchers(
  username: string,
  message: string
): Promise<void> {
  for (const matcherEntry of MATCHER_ARRAY) {
    if (matcherEntry.regex.test(message)) {
      try {
        await matcherEntry.method(username, message);
      } catch (error) {
        const matcherLabel = error.label || LABEL;
        logger.error(matcherLabel, `${error.message}`);
        logger.debug(matcherLabel, `Stacktrace:\n${error.stack}`);
      }
    }
  }
}

importCogs("matcher");
