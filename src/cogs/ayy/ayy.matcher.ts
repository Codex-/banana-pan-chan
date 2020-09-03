import { client } from "../../banana-pan-chan";
import { registerMatcher } from "../../providers/matchers";
import { Role } from "../../services/permissions";

class Ayy {
  @registerMatcher(Role.User, "Ayy", /\bayy+$/i)
  public static async ayy(): Promise<void> {
    await client.say("lmao");
  }
}
