import { client } from "../banana-pan-chan";
import config from "../config";
import logger from "../utilities/logger";

export enum Role {
  Owner = 3,
  Moderator = 2,
  Vip = 1,
  User = 0,
}

interface PermissionsMap {
  [username: string]: Role;
}

export const AVAILABLE_PERMISSIONS = "(user|vips|mods|owner)";
const LABEL = "permissions";
const LOAD_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export function getRoleFromStr(role: string): Role {
  switch (role.toLowerCase()) {
    case "mods":
    case "moderators":
      return Role.Moderator;
    case "vip":
    case "vips":
      return Role.Vip;
    default:
      return Role.User;
  }
}

class PermissionsService {
  private permissionsMap: PermissionsMap = {};
  private lastLoadTime = Date.now();

  public async isUserPermitted(
    requiredRole: Role,
    user: string
  ): Promise<boolean> {
    const userRole = this.permissionsMap[user];
    const permitted = userRole >= requiredRole;

    // Reload permissions in case of changes.
    if (!permitted && this.shouldReload()) {
      logger.info(LABEL, "Reloading permissions...");
      await this.reloadUserPermissions();
      return this.isUserPermitted(requiredRole, user);
    }

    return permitted;
  }

  public async loadUserPermissions(): Promise<void> {
    // Load the lowest level permission to highest
    const vips = await client.getVIPs();
    this.addUserPermissions(Role.Vip, vips);
    logger.verbose(LABEL, `Loaded ${vips.length} VIPs: ${vips.join(", ")}`);

    const mods = await client.getMods();
    this.addUserPermissions(Role.Moderator, mods);
    logger.verbose(
      LABEL,
      `Loaded ${mods.length} moderators: ${mods.join(", ")}`
    );

    this.addUserPermissions(Role.Owner, [config.Tmi.Channel]);
  }

  private addUserPermissions(role: Role, users: string[]): void {
    for (const user of users) {
      this.permissionsMap[user] = role;
    }
  }

  private async reloadUserPermissions(): Promise<void> {
    this.lastLoadTime = Date.now();
    return this.loadUserPermissions();
  }

  private shouldReload(): boolean {
    return Date.now() > this.lastLoadTime + LOAD_TIMEOUT;
  }
}

export const permissions = new PermissionsService();
