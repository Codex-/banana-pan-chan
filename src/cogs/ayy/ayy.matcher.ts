import { registerMatcher } from "../../matchers";
import { client } from "../../banana-pan-chan";

class Ayy {
  @registerMatcher(/\bayy+$/i)
  public static async ayy(): Promise<void> {
    client.say("lmao");
  }
}
