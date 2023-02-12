import { BaseConfig } from "../BaseConfig.mjs";
import type { IGoogleConfig } from "./IGoogleConfig.mjs";

export class GoogleConfig extends BaseConfig implements IGoogleConfig {

  public readonly client_id: string;

  public readonly client_secret: string;

  public readonly redirect_uri: string;

  public readonly youtube_channel_id: string;

  public constructor(json: IGoogleConfig) {

    super();

    if (typeof json !== "object" || json === null) {
      throw new Error("GoogleConfig must be an object.");
    }

    const {
      client_id,
      client_secret,
      redirect_uri,
      youtube_channel_id,
    } = json;

    if (typeof client_id !== "string" || client_id === "") {
      throw new Error("GoogleConfig.client_id must be a string.");
    }
    this.client_id = client_id;

    if (typeof client_secret !== "string" || client_secret === "") {
      throw new Error("GoogleConfig.client_secret must be a string.");
    }
    this.client_secret = client_secret;

    if (typeof redirect_uri !== "string" || redirect_uri === "") {
      throw new Error("GoogleConfig.redirect_uri must be a string.");
    }
    new URL(redirect_uri);
    this.redirect_uri = redirect_uri;

    if (typeof youtube_channel_id !== "string" || youtube_channel_id === "") {
      throw new Error("GoogleConfig.youtube_channel_id must be a string.");
    }
    this.youtube_channel_id = youtube_channel_id;

  }

}

Object.freeze(GoogleConfig.prototype);
Object.freeze(GoogleConfig);
