import { google, youtube_v3 } from "googleapis";
import type { IncomingMessage, ServerResponse } from "http";
import { validate } from "uuid";
import config from "../config.mjs";
import { database } from "../database/database.mjs";

export async function handleGoogleCallback(url: URL, request: IncomingMessage, response: ServerResponse): Promise<void> {
  const state = url.searchParams.get("state");
  if (!state) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Bad Request");
    return;
  }
  if (!validate(state)) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Bad Request");
    return;
  }
  const code = url.searchParams.get("code");
  if (!code) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Bad Request");
    return;
  }
  const { rows: [discord] } = await database.query<{ created_at: Date; expires_at: Date; access_token: string; token_type: string; refresh_token: string; scope: string; current_state: any | null; youtube_channel_id: string | null; }>(`
    SELECT
      "created_at"
     ,"expires_at"
     ,"access_token"
     ,"token_type"
     ,"refresh_token"
     ,"scope"
     ,"current_state"
     ,"youtube_channel_id"
    FROM
      "pyro_yt_member_handler"."discord_auth"
    WHERE
      "id" = $1
    LIMIT 1
    ;
  `, [state]);
  if (!discord) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Bad Request");
    return;
  }
  if (discord.youtube_channel_id) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Bad Request");
    return;
  }
  const oauth2Client = new google.auth.OAuth2({
    clientId: config.google.client_id,
    clientSecret: config.google.client_secret,
    redirectUri: config.google.redirect_uri,
  });
  const { tokens: google_token } = await oauth2Client.getToken({
    code,
    client_id: config.google.client_id,
    redirect_uri: config.google.redirect_uri,
  });
  oauth2Client.setCredentials(google_token);
  if (!google_token.scope?.split(" ").includes("https://www.googleapis.com/auth/youtube.readonly")) {
    const query = new URLSearchParams();
    query.append("token", discord.access_token);
    query.append("token_type_hint", "access_token");
    fetch("https://discord.com/api/v10/oauth2/token/revoke", {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${config.discord.bot.id}:${config.discord.bot.secret}`).toString("base64")}`,
      },
      body: query.toString(),
    });
    await database.query(`
      DELETE FROM
        "pyro_yt_member_handler"."discord_auth"
      WHERE
        "id" = $1
      ;
    `, [state]);
    await oauth2Client.revokeCredentials();
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Bad Request");
    return;
  }
  const youtube = new youtube_v3.Youtube({
    auth: oauth2Client,
  });
  const { data: { items: yt_channels }} = await youtube.channels.list({
    part: ["id"],
    mine: true,
  });
  if (!yt_channels?.length) {
    const query = new URLSearchParams();
    query.append("token", discord.access_token);
    query.append("token_type_hint", "access_token");
    fetch("https://discord.com/api/v10/oauth2/token/revoke", {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${config.discord.bot.id}:${config.discord.bot.secret}`).toString("base64")}`,
      },
      body: query.toString(),
    });
    await database.query(`
      DELETE FROM
        "pyro_yt_member_handler"."discord_auth"
      WHERE
        "id" = $1
      ;
    `, [state]);
    await oauth2Client.revokeCredentials();
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("No YouTube");
    return;
  }
  let yt_channel;
  for (const i of yt_channels) {
    if (i.kind === "youtube#channel") {
      yt_channel = i;
      break;
    }
  }
  if (!yt_channel) {
    const query = new URLSearchParams();
    query.append("token", discord.access_token);
    query.append("token_type_hint", "access_token");
    fetch("https://discord.com/api/v10/oauth2/token/revoke", {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${config.discord.bot.id}:${config.discord.bot.secret}`).toString("base64")}`,
      },
      body: query.toString(),
    });
    await database.query(`
      DELETE FROM
        "pyro_yt_member_handler"."discord_auth"
      WHERE
        "id" = $1
      ;
    `, [state]);
    await oauth2Client.revokeCredentials();
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("No YouTube channels detected");
    return;
  }
  await database.query(`
    UPDATE
      "pyro_yt_member_handler"."discord_auth"
    SET
      "youtube_channel_id" = $1
    WHERE
      "id" = $2
    ;
  `, [yt_channel.id, state]);
  await oauth2Client.revokeCredentials();
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Successfully associated your YouTube account with your Discord account. Please note that we are still working thing out on the YouTube end to retrieve your membership information, so you currently won't be able to claim your roles until we get that sorted out.");
}
