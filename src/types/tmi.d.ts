import { EventEmitter } from "events";

export interface Client extends EventEmitter {
  say: (channel: string, message: string) => Promise<string[]>;
}

export interface UserState {
  "badges-raw"?: string;
  badges?: { [name: string]: string };
  color?: string;
  "display-name"?: string;
  "emotes-raw"?: string;
  emotes?: { [id: string]: string[] };
  "message-type"?: "action" | "chat" | "whisper";
  mod?: boolean;
  "room-id"?: string;
  subscriber?: boolean;
  turbo?: boolean;
  "user-id"?: string;
  "user-type"?: string;
  username?: string;
}
