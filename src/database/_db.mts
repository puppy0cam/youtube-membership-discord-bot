import config from "../config.mjs";
import { Pool } from "./pg_module.mjs";

export const _db = new Pool({
  allowExitOnIdle: true,
  application_name: "Ticketeer Discord",
  database: config.database.database,
  host: config.database.host,
  password: config.database.password,
  port: config.database.port,
  user: config.database.user,
});
