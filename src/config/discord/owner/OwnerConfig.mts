import { BaseConfig } from "../../BaseConfig.mjs";
import type { IOwnerConfig } from "./IOwnerConfig.mjs";

export class OwnerConfig extends BaseConfig implements IOwnerConfig {

  public readonly guild_id: string;

  public readonly user_id: string;

  public constructor(json: IOwnerConfig) {

    super();

    if (typeof json !== "object" || json === null) {
      throw new Error("OwnerConfig must be an object.");
    }

    const {
      guild_id,
      user_id,
    } = json;

    if (typeof guild_id !== "string") {
      throw new Error("OwnerConfig.guild_id must be a string.");
    }
    if (guild_id.length < 17) {
      throw new Error("OwnerConfig.guild_id must be at least 17 characters long.");
    }
    if (!guild_id.match(/^[0-9]{17,}$/)) {
      throw new Error("OwnerConfig.guild_id must be a number.");
    }
    this.guild_id = guild_id;

    if (typeof user_id !== "string") {
      throw new Error("OwnerConfig.user_id must be a string.");
    }
    if (user_id.length < 17) {
      throw new Error("OwnerConfig.user_id must be at least 17 characters long.");
    }
    if (!user_id.match(/^[0-9]{17,}$/)) {
      throw new Error("OwnerConfig.user_id must be a number.");
    }
    this.user_id = user_id;

  }

}

Object.freeze(OwnerConfig.prototype);
Object.freeze(OwnerConfig);
