export enum Role {
  Owner = "owner",
  Moderator = "moderator",
  Vip = "vip",
  User = "user",
}

interface PermissionsTable {
  [username: string]: string;
}

const PERMISSIONS_TABLE: PermissionsTable = {};
