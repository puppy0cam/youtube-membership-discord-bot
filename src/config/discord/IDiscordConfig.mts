import type { IBotConfig } from "./bot/IBotConfig.mjs";
import type { IOwnerConfig } from "./owner/IOwnerConfig.mjs";

export interface IDiscordConfig {

  readonly bot: IBotConfig;

  readonly owner: IOwnerConfig;

}
