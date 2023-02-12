import { google } from "googleapis";
import type { PoolClient } from "pg";
import config from "./config.mjs";
import { runTransaction } from "./database/runTransaction.mjs";

async function run(database: PoolClient) {
  await database.query(`LOCK TABLE "pyro_yt_member_handler"."youtube_auth" IN ROW EXCLUSIVE MODE;`);
  await database.query(`DELETE FROM "pyro_yt_member_handler"."youtube_auth" WHERE "expiry_date" < NOW();`);
  const { rows } = await database.query<{
    channel_id: string;
    refresh_token: string | null;
    expiry_date: Date | null;
    access_token: string | null;
    token_type: string | null;
    id_token: string | null;
    scope: string | null;
  }>(`SELECT "channel_id", "refresh_token", "expiry_date", "access_token", "token_type", "id_token", "scope" FROM "pyro_yt_member_handler"."youtube_auth" WHERE "expiry_date" < NOW() + INTERVAL '30 minutes' ORDER BY "expiry_date" ASC LIMIT 10;`);
  await Promise.all(rows.map(async (row) => {
    const oauth2Client = new google.auth.OAuth2({
      clientId: config.google.client_id,
      clientSecret: config.google.client_secret,
      redirectUri: config.google.redirect_uri,
    });
    oauth2Client.setCredentials({
      access_token: row.access_token,
      refresh_token: row.refresh_token,
      expiry_date: row.expiry_date?.valueOf(),
      id_token: row.id_token,
      scope: row.scope ?? void 0,
      token_type: row.token_type,
    });
    const refresh = await oauth2Client.refreshAccessToken();
    const {
      access_token,
      expiry_date,
      id_token,
      refresh_token,
      scope,
      token_type,
    } = refresh.credentials;
    await database.query(`
      UPDATE
        "pyro_yt_member_handler"."youtube_auth"
      SET
        "access_token" = $1,
        "expiry_date" = $2,
        "id_token" = $3,
        "refresh_token" = $4,
        "scope" = $5,
        "token_type" = $6
      WHERE
        "channel_id" = $7
      ;
    `, [
      access_token,
      expiry_date == null ? null : new Date(expiry_date),
      id_token,
      refresh_token,
      scope,
      token_type,
      row.channel_id,
    ]);
  }));
}

{

  let is_running = false;

  setInterval(async () => {
    if (is_running) return;
    try {
      is_running = true;
      await runTransaction(run);
    } catch (e) {
      console.error(e);
    } finally {
      is_running = false;
    }
  }, 60000);

}
