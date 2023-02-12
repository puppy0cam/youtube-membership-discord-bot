import { google, youtube_v3 } from "googleapis";
import type { ServerResponse } from "http";
import config from "../config.mjs";
import { database } from "../database/database.mjs";

export async function handleGoogleCallback(url: URL, response: ServerResponse): Promise<void> {
  const code = url.searchParams.get("code");
  if (!code) {
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
  const scoped = google_token.scope?.split(" ") ?? [];
  if (!scoped.includes("https://www.googleapis.com/auth/youtube.readonly") || !scoped.includes("https://www.googleapis.com/auth/youtube.channel-memberships.creator")) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Bad Request - Missing Scoped");
    await oauth2Client.revokeCredentials();
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
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("No YouTube Channel");
    await oauth2Client.revokeCredentials();
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
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("No YouTube channels detected");
    await oauth2Client.revokeCredentials();
    return;
  }
  if (!yt_channel.id) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("No YouTube channel ID detected");
    await oauth2Client.revokeCredentials();
    return;
  }
  if (yt_channel.id !== config.google.youtube_channel_id) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("You have not authorised the correct YouTube channel");
    await oauth2Client.revokeCredentials();
    return;
  }
  const {
    access_token,
    expiry_date,
    id_token,
    refresh_token,
    scope,
    token_type,
  } = oauth2Client.credentials;
  const expiry_date_date = expiry_date == null ? null : new Date(expiry_date);
  await database.query(`
    INSERT INTO "pyro_yt_member_handler"."youtube_auth" ("channel_id", "refresh_token", "expiry_date", "access_token", "token_type", "id_token", "scope") VALUES
    ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT ON CONSTRAINT "youtube_auth_pkey" DO UPDATE SET "refresh_token" = EXCLUDED."refresh_token", "expiry_date" = EXCLUDED."expiry_date", "access_token" = EXCLUDED."access_token", "token_type" = EXCLUDED."token_type", "id_token" = EXCLUDED."id_token", "scope" = EXCLUDED."scope"
    ;
  `, [
    yt_channel.id,
    refresh_token,
    expiry_date_date,
    access_token,
    token_type,
    id_token,
    scope,
  ]);
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Successfully authenticated to YouTube.");
}
