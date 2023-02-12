import { BaseConfig } from "../BaseConfig.mjs";
import { createShieldedProxy } from "../_/createShieldedProxy.mjs";
import { BotConfig } from "./bot/BotConfig.mjs";
import type { IDiscordConfig } from "./IDiscordConfig.mjs";
import { OwnerConfig } from "./owner/OwnerConfig.mjs";

export class DiscordConfig extends BaseConfig implements IDiscordConfig {

  public readonly bot: BotConfig;

  public readonly owner: OwnerConfig;

  public constructor(json: IDiscordConfig) {

    super();

    if (typeof json !== "object" || json === null) {
      throw new Error("DiscordConfig must be an object.");
    }

    const {
      bot,
      owner,
    } = json;

    if (typeof bot !== "object" || bot === null) {
      throw new Error("DiscordConfig.bot must be an object.");
    }
    this.bot = createShieldedProxy(Object.freeze(new BotConfig(bot)));

    if (typeof owner !== "object" || owner === null) {
      throw new Error("DiscordConfig.owner must be an object.");
    }
    this.owner = createShieldedProxy(Object.freeze(new OwnerConfig(owner)));

  }

}

Object.freeze(DiscordConfig.prototype);
Object.freeze(DiscordConfig);
