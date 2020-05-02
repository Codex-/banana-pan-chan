import { importCogs } from "./utilities/cogs";
import logger from "./utilities/logger";

type MatcherMethod = (username: string, message: string) => Promise<void>;
interface MatcherEntry {
  regex: RegExp;
  method: MatcherMethod;
}

const PHASE = "matchers";

const MATCHER_ARRAY: MatcherEntry[] = [];

/**
 * Provides the decorator for registering message matchers.
 *
 * @param regex the regular expression to test messages with.
 */
export function registerMatcher(regex: RegExp): MethodDecorator {
  return (
    target: { [index: string]: any },
    propertyKey: string | symbol,
    _: PropertyDescriptor
  ) => {
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
        error.phase = `${PHASE}\\${regex}`;
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
      /**
       * Wrap and execute the matcher method call to handle promise rejections
       * whilst not blocking iteration.
       */
      (async () => {
        try {
          await matcherEntry.method(username, message);
        } catch (error) {
          const matcherPhase = error.phase || PHASE;
          logger.error(`${error.message}`, { label: matcherPhase });
          logger.debug(`Stacktrace:\n${error.stack}`, { label: matcherPhase });
        }
      })();
    }
  }
}

importCogs("matcher");
