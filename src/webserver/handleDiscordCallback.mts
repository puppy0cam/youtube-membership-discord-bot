import type { ServerResponse } from "http";
import config from "../config.mjs";
import { database } from "../database/database.mjs";

export async function handleDiscordCallback(url: URL, response: ServerResponse): Promise<void> {
  const code = url.searchParams.get("code");
  if (!code) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Bad Request");
    return;
  }
  const query = new URLSearchParams();
  query.append("client_id", config.discord.bot.id);
  query.append("client_secret", config.discord.bot.secret);
  query.append("grant_type", "authorization_code");
  query.append("code", code);
  query.append("redirect_uri", config.discord.bot.redirect_uri);
  const dataResponse = await fetch("https://discord.com/api/v10/oauth2/token", {
    method: "POST",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: query.toString(),
  });
  if (!dataResponse.ok) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Bad Request");
    return;
  }
  const data = await dataResponse.json();
  const { access_token, refresh_token, expires_in, scope, token_type } = data;
  const scopes = scope.split(" ");
  if (!scopes.includes("role_connections.write") || !scopes.includes("connections")) {
    const query = new URLSearchParams();
    query.append("token", access_token);
    query.append("token_type_hint", "access_token");
    fetch("https://discord.com/api/v10/oauth2/token/revoke", {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${config.discord.bot.id}:${config.discord.bot.secret}`).toString("base64")}`,
      },
      body: query.toString(),
    });
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Bad Request");
    return;
  }
  const expires_at = new Date(Date.now() + expires_in * 1000);
  await database.query<{ id: string; }>(`
    INSERT INTO
      "pyro_yt_member_handler"."discord_auth"
      ("expires_at", "access_token", "token_type", "refresh_token", "scope", "current_state")
    VALUES
      ($1, $2, $3, $4, $5, $6)
    ON CONFLICT ON CONSTRAINT "discord_auth_access_token_key" DO NOTHING
    ;
  `, [expires_at, access_token, token_type, refresh_token, scope, "{}"]);
  response.writeHead(200);
  response.end("Successfully authenticated with Discord. You can close this window now. Note that we are still sorting things out on the YouTube end so you won't be able to claim your roles yet.");
}
