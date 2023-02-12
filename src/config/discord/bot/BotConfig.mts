import { BaseConfig } from "../../BaseConfig.mjs";
import { IBotConfig } from "./IBotConfig.mjs";

export class BotConfig extends BaseConfig implements IBotConfig {

  public readonly id: string;

  public readonly public_key: string;

  public readonly redirect_uri: string;

  public readonly secret: string;

  public readonly token: string;

  public constructor(json: IBotConfig) {

    super();

    if (typeof json !== "object" || json === null) {
      throw new Error("BotConfig must be an object.");
    }

    const {
      id,
      public_key,
      redirect_uri,
      secret,
      token,
    } = json;

    if (typeof id !== "string") {
      throw new Error("BotConfig.id must be a string.");
    }
    if (id.length < 17) {
      throw new Error("BotConfig.id must be at least 17 characters long.");
    }
    if (!id.match(/^[0-9]{17,}$/)) {
      throw new Error("BotConfig.id must be a number.");
    }
    this.id = id;

    if (typeof public_key !== "string") {
      throw new Error("BotConfig.public_key must be a string.");
    }
    if (public_key.length !== 64) {
      throw new Error("BotConfig.public_key must be 64 characters long.");
    }
    if (!public_key.match(/^[0-9a-f]{64}$/)) {
      throw new Error("BotConfig.public_key must be a hexadecimal string.");
    }
    this.public_key = public_key;

    if (typeof redirect_uri !== "string") {
      throw new Error("BotConfig.redirect_uri must be a string.");
    }
    new URL(redirect_uri);
    this.redirect_uri = redirect_uri;

    if (typeof secret !== "string") {
      throw new Error("BotConfig.secret must be a string.");
    }
    if (secret.length !== 32) {
      throw new Error("BotConfig.secret must be 32 characters long.");
    }
    this.secret = secret;

    if (typeof token !== "string") {
      throw new Error("BotConfig.token must be a string.");
    }
    const [b64_id] = token.split(".");
    if (Buffer.from(b64_id, 'base64').toString() !== id) {
      throw new Error("BotConfig.token does not belong to the same application as BotConfig.id.");
    }
    this.token = token;

  }

}

Object.freeze(BotConfig.prototype);
Object.freeze(BotConfig);
