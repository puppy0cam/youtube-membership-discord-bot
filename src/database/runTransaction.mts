import { database } from "./database.mjs";
import type { PoolClient } from "./pg_module.mjs";

export async function runTransaction<T>(callback: (db: PoolClient) => Promise<T>): Promise<T> {
  const db = await database.connect();
  try {
    await db.query("BEGIN;");
    const result = await callback(db);
    await db.query("COMMIT;");
    db.release();
    return result;
  } catch (error) {
    try {
      await db.query("ROLLBACK;");
    } catch { }
    db.release(error as Error);
    throw error;
  }
}
