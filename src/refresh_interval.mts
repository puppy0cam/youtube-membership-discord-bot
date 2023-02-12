import config from "./config.mjs";
import type { PoolClient } from "./database/pg_module.mjs";
import { runTransaction } from "./database/runTransaction.mjs";

async function run(database: PoolClient) {
  await database.query(`LOCK TABLE "pyro_yt_member_handler"."discord_auth" IN ROW EXCLUSIVE MODE;`);
  await database.query(`DELETE FROM "pyro_yt_member_handler"."discord_auth" WHERE "expires_at" < NOW()`);
  const { rows } = await database.query<{
    id: string;
    access_token: string;
    token_type: string;
    refresh_token: string;
  }>(`SELECT "id", "access_token", "token_type", "refresh_token" FROM "pyro_yt_member_handler"."discord_auth" WHERE "expires_at" < NOW() + INTERVAL '1 day' ORDER BY "expires_at" ASC LIMIT 10;`);
  await Promise.all(rows.map(async (row) => {
    const query = new URLSearchParams();
    query.append("client_id", config.discord.bot.id);
    query.append("client_secret", config.discord.bot.secret);
    query.append("grant_type", "refresh_token");
    query.append("refresh_token", row.refresh_token);
    const response = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: query.toString(),
    });
    if (response.status === 429) {
      return;
    }
    if (!response.ok) {
      fetch(`https://discord.com/api/v10/users/@me/applications/${config.discord.bot.id}/role-connection`, {
        method: "PUT",
        headers: {
          "Authorization": `${row.token_type} ${row.access_token}`,
          "Content-Type": "application/json",
        },
        body: "{}",
      });
      await database.query(`DELETE FROM "pyro_yt_member_handler"."discord_auth" WHERE "id" = $1`, [row.id]);
      return;
    }
    const { access_token, token_type, expires_in, refresh_token, scope } = await response.json();
    await database.query(`
      UPDATE
        "pyro_yt_member_handler"."discord_auth"
      SET
        "access_token" = $1
       ,"token_type" = $2
       ,"expires_at" = NOW() + INTERVAL '${expires_in} seconds'
       ,"refresh_token" = $3
       ,"scope" = $4
      WHERE
        "id" = $5
      ;
    `, [access_token, token_type, refresh_token, scope, row.id]);
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
