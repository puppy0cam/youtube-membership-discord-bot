import { BaseConfig } from "../BaseConfig.mjs";
import type { IDatabaseConfig } from "./IDatabaseConfig.mjs";

export class DatabaseConfig extends BaseConfig implements IDatabaseConfig {

  public readonly database: string;

  public readonly host: string;

  public readonly password: string;

  public readonly port: number;

  public readonly user: string;

  public constructor(json: IDatabaseConfig) {

    super();

    if (typeof json !== "object" || json === null) {
      throw new Error("DatabaseConfig must be an object.");
    }

    const {
      database,
      host,
      password,
      port,
      user,
    } = json;

    if (typeof database !== "string" || database === "") {
      throw new Error("DatabaseConfig.database must be a string.");
    }
    this.database = database;

    if (typeof host !== "string" || host === "") {
      throw new Error("DatabaseConfig.host must be a string.");
    }
    this.host = host;

    if (typeof password !== "string" || password === "") {
      throw new Error("DatabaseConfig.password must be a string.");
    }
    this.password = password;

    if (typeof port !== "number") {
      throw new Error("DatabaseConfig.port must be a number.");
    }
    if (port < 1) {
      throw new Error("DatabaseConfig.port must be at least 1.");
    }
    if (port > 65535) {
      throw new Error("DatabaseConfig.port must be at most 65535.");
    }
    this.port = port;

    if (typeof user !== "string" || user === "") {
      throw new Error("DatabaseConfig.user must be a string.");
    }
    this.user = user;

  }

}

Object.freeze(DatabaseConfig.prototype);
Object.freeze(DatabaseConfig);
