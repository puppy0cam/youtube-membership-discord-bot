import { BaseConfig } from "./BaseConfig.mjs";
import { DatabaseConfig } from "./database/DatabaseConfig.mjs";
import { DiscordConfig } from "./discord/DiscordConfig.mjs";
import { GoogleConfig } from "./google/GoogleConfig.mjs";
import type { IConfig } from "./IConfig.mjs";
import { createShieldedProxy } from "./_/createShieldedProxy.mjs";

export class Config extends BaseConfig implements IConfig {

  public readonly database: DatabaseConfig;

  public readonly discord: DiscordConfig;

  public readonly google: GoogleConfig;

  public constructor(json: IConfig) {

    super();

    if (typeof json !== "object" || json === null) {
      throw new Error("Config must be an object.");
    }

    const {
      database,
      discord,
      google,
    } = json;

    if (typeof database !== "object" || database === null) {
      throw new Error("Config.database must be an object.");
    }
    this.database = createShieldedProxy(Object.freeze(new DatabaseConfig(database)));

    if (typeof discord !== "object" || discord === null) {
      throw new Error("Config.discord must be an object.");
    }
    this.discord = createShieldedProxy(Object.freeze(new DiscordConfig(discord)));

    if (typeof google !== "object" || google === null) {
      throw new Error("Config.google must be an object.");
    }
    this.google = createShieldedProxy(Object.freeze(new GoogleConfig(google)));

  }

}

Object.freeze(Config.prototype);
Object.freeze(Config);
