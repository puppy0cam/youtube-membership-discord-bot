import { readFile } from "node:fs/promises";
import { Config } from "./config/Config.mjs";
import { createShieldedProxy } from "./config/_/createShieldedProxy.mjs";

const data = await readFile("config.json", "utf-8");

const json = JSON.parse(data);

export default createShieldedProxy(Object.freeze(new Config(json)));
