import { client } from "../../banana-pan-chan";
import { registerMatcher } from "../../providers/matchers";

class Ayy {
  @registerMatcher(/\bayy+$/i)
  public static async ayy(): Promise<void> {
    await client.say("lmao");
  }
}
