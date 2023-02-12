import type { PoolClient } from "pg";
import config from "./config.mjs";
import { runTransaction } from "./database/runTransaction.mjs";
import { google, youtube_v3 } from "googleapis";
import type { GaxiosResponse } from "gaxios";

interface IYouTubeMembershipData {
  channel_id: string;
  total_duration: number;
  current_streak: number;
}

async function *getMembershipsFromYouTube(database: PoolClient) {
  const { rows: [row] } = await database.query<{
    channel_id: string;
    refresh_token: string | null;
    expiry_date: Date | null;
    access_token: string | null;
    token_type: string | null;
    id_token: string | null;
    scope: string | null;
  }>(`SELECT "channel_id", "refresh_token", "expiry_date", "access_token", "token_type", "id_token", "scope" FROM "pyro_yt_member_handler"."youtube_auth" WHERE "expiry_date" > NOW() AND "channel_id" = $1;`, [config.google.youtube_channel_id]);
  if (row == null) {
    console.log("Not authenticated");
    return;
  }
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
  const yt = new youtube_v3.Youtube({
    auth: oauth2Client,
  });
  let next_token: string | null | undefined = void 0;
  let is_first = true;
  while (is_first || next_token != null) {
    is_first = false;
    const response = yt.members.list({
      part: ['snippet'],
      mode: 'all_current',
      maxResults: 1000,
      pageToken: next_token,
    } as any as {
      part: ['snippet'];
      mode: 'all_current';
      maxResults: 1000;
      pageToken: string;
    });
    const result = await new Promise<GaxiosResponse<youtube_v3.Schema$MemberListResponse>>((resolve, reject) => {
      response.then(resolve, reject);
    });
    const { data } = result;
    next_token = data.nextPageToken;
    console.log(data.items);
    for (const i of data.items ?? []) {
      if (i.kind !== 'youtube#member') continue;
      const {
        membershipsDetails,
        memberDetails,
      } = i.snippet!;
      if (!membershipsDetails || !memberDetails || !memberDetails.channelId) continue;
      const result: IYouTubeMembershipData = {
        channel_id: memberDetails.channelId,
        current_streak: 0,
        total_duration: 0,
      };
      if (membershipsDetails) {
        result.total_duration = membershipsDetails.membershipsDuration?.memberTotalDurationMonths ?? 0;
        const months = new Set<number>();
        for (const j of membershipsDetails.membershipsDurationAtLevels ?? (membershipsDetails as any).membershipsDurationAtLevel as youtube_v3.Schema$MembershipsDurationAtLevel[] ?? []) {
          const date = j.memberSince;
        }
      }
      yield result;
    }
  }
}

async function run(database: PoolClient) {
  await database.query(`LOCK TABLE "pyro_yt_member_handler"."youtube_membership" IN ROW EXCLUSIVE MODE;`);
  await database.query(`LOCK TABLE "pyro_yt_member_handler"."youtube_auth" IN ROW EXCLUSIVE MODE;`);
  await database.query(`UPDATE "pyro_yt_member_handler"."youtube_membership" SET "current_streak" = 0 WHERE "current_streak" > 0;`);
  for await (const i of getMembershipsFromYouTube(database)) {
    await database.query(`
      INSERT INTO "pyro_yt_member_handler"."youtube_membership" ("channel_id", "total_duration", "current_streak")
      VALUES ($1, $2, $3)
      ON CONFLICT ON CONSTRAINT "youtube_membership_pkey" DO UPDATE SET "total_duration" = EXCLUDED."total_duration", "current_streak" = EXCLUDED."current_streak"
      ;
    `, [i.channel_id, i.total_duration, i.current_streak]);
  }
}

export async function refreshYouTubeMembers() {
  await runTransaction(run);
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
  }, 3600000);

}
