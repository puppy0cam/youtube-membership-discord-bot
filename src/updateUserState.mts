import config from "./config.mjs";
import type { PoolClient } from "./database/pg_module.mjs";
import { runTransaction } from "./database/runTransaction.mjs";

async function run(database: PoolClient) {
  await database.query(`LOCK TABLE "pyro_yt_member_handler"."discord_auth" IN ROW EXCLUSIVE MODE;`);
  const { rows } = await database.query<{
    id: string;
    access_token: string;
    token_type: string;
    current_state: Record<string | number, any>;
  }>(`SELECT "id", "access_token", "token_type", "current_state" FROM "pyro_yt_member_handler"."discord_auth" WHERE "expires_at" > NOW() AND "last_state_update_at" <= (NOW() - INTERVAL '1 hour') ORDER BY "last_state_update_at" ASC LIMIT 10;`);
  await Promise.all(rows.map(async (row) => {
    const response = await fetch(`https://discord.com/api/v10/users/@me/connections`, {
      headers: {
        Authorization: `${row.token_type} ${row.access_token}`,
      },
    });
    if (response.status === 429) {
      return;
    }
    if (response.status === 401 || response.status === 403) {
      const query = new URLSearchParams();
      query.append("token", row.access_token);
      query.append("token_type_hint", "access_token");
      fetch("https://discord.com/api/v10/oauth2/token/revoke", {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${config.discord.bot.id}:${config.discord.bot.secret}`).toString("base64")}`,
        },
        body: query.toString(),
      });
      await database.query(`DELETE FROM "pyro_yt_member_handler"."discord_auth" WHERE "id" = $1`, [row.id]);
      return;
    }
    if (!response.ok) {
      await database.query(`UPDATE "pyro_yt_member_handler"."discord_auth" SET "last_state_update_at" = NOW() WHERE "id" = $1`, [row.id]);
      return;
    }
    const connections = await response.json();
    const youtube_channel_id_list: string[] = [];
    for (const connection of connections) {
      if (connection.type === "youtube") {
        youtube_channel_id_list.push(connection.id);
      }
    }
    if (youtube_channel_id_list.length === 0) {
      if (row.current_state.total_membership_months !== void 0 || row.current_state.membership_streak_months !== void 0) {
        fetch(`https://discord.com/api/v10/users/@me/applications/${config.discord.bot.id}/role-connection`, {
          method: "PUT",
          headers: {
            Authorization: `${row.token_type} ${row.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
          }),
        });
      }
    }
    const duration_query = await database.query<{
      total_duration: number;
      current_streak: number;
    }>(`SELECT COALESCE(MAX("total_duration"), 0) AS "total_duration", COALESCE(MAX("current_streak"), 0) AS "current_streak" FROM "pyro_yt_member_handler"."youtube_membership" WHERE "channel_id" = ANY($1)`, [youtube_channel_id_list]);
    const { total_duration, current_streak } = duration_query.rows[0];
    if (row.current_state.total_membership_months !== total_duration || row.current_state.membership_streak_months !== current_streak) {
      const result = await fetch(`https://discord.com/api/v10/users/@me/applications/${config.discord.bot.id}/role-connection`, {
        method: "PUT",
        headers: {
          Authorization: `${row.token_type} ${row.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metadata: {
            total_membership_months: total_duration,
            membership_streak_months: current_streak,
          },
        }),
      });
      if (result.ok) {
        await database.query(`UPDATE "pyro_yt_member_handler"."discord_auth" SET "current_state" = $1, "last_state_update_at" = NOW() WHERE "id" = $2`, [JSON.stringify({
          total_membership_months: total_duration,
          membership_streak_months: current_streak,
        }), row.id]);
      } else {
        console.log("Failed to update state", await result.text(), result.status, result.statusText);
      }
    } else {
      await database.query(`UPDATE "pyro_yt_member_handler"."discord_auth" SET "last_state_update_at" = NOW() WHERE "id" = $1`, [row.id]);
    }
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
  }, 5000);

}
