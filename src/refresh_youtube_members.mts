import type { PoolClient } from "pg";
import { runTransaction } from "./database/runTransaction.mjs";

interface IYouTubeMembershipData {
  channel_id: string;
  total_duration: number;
  current_streak: number;
}

async function getMembershipsFromYouTube(): Promise<IYouTubeMembershipData[]> {
  // until we can get access to the endpoint, we'll just return a dummy value.
  await new Promise(resolve => setTimeout(resolve, Math.ceil(Math.random() * 3000)));
  return [
    {
      channel_id: "UCUPo_Hdvc2xEg-VcMQWhC3g",
      total_duration: 3,
      current_streak: 3,
    },
    {
      channel_id: "UCgltqC_ijQjIrEDlKw3S8aw",
      total_duration: 6,
      current_streak: 1,
    },
    {
      channel_id: "UCNBM2vDTAj660VYaEUSuAsQ",
      total_duration: 6,
      current_streak: 2,
    },
  ];
}

async function run(database: PoolClient) {
  await database.query(`LOCK TABLE "pyro_yt_member_handler"."youtube_membership" IN ROW EXCLUSIVE MODE;`);
  const [
    results,
  ] = await Promise.all([
    getMembershipsFromYouTube(),
    database.query(`UPDATE "pyro_yt_member_handler"."youtube_membership" SET "current_streak" = 0 WHERE "current_streak" > 0;`),
  ]);
  while (results.length) {
    const set = results.splice(0, 100);
    await database.query(`
      INSERT INTO "pyro_yt_member_handler"."youtube_membership" ("channel_id", "total_duration", "current_streak")
      VALUES ${set.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(", ")}
      ON CONFLICT ON CONSTRAINT "youtube_membership_pkey" DO UPDATE SET "total_duration" = EXCLUDED."total_duration", "current_streak" = EXCLUDED."current_streak"
      ;
    `, set.flatMap(({ channel_id, total_duration, current_streak }) => [channel_id, total_duration, current_streak]));
  }
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
