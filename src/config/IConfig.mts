import type { IDatabaseConfig } from "./database/IDatabaseConfig.mjs";
import type { IDiscordConfig } from "./discord/IDiscordConfig.mjs";
import type { IGoogleConfig } from "./google/IGoogleConfig.mjs";

export interface IConfig {

  readonly database: IDatabaseConfig;

  readonly discord: IDiscordConfig;

  readonly google: IGoogleConfig;

}
