import { readFile } from "fs/promises";
import { relative as localRelative, sep } from "node:path";
import { join, relative, resolve, sep as targetSep } from "node:path/posix";
import { createObjectPromise, IObjectPromise } from "../util/createObjectPromise.mjs";
import { recursivelyIteratePath } from "../util/recursivelyIteratePath.mjs";
import { loadStartingComments } from "./loadStartingComments.mjs";
import { _db } from "./_db.mjs";

const migrations: {
  [key: string]: {
    dependencies: string[];
    path: string;
    dependencyPromise: IObjectPromise<unknown>;
    ownPromise: Promise<void>;
  };
} = {};

const migrationDefinitionCache = new Map<string, Promise<void>>();

function defineMigration(migrationPath: string) {
  const cache = migrationDefinitionCache.get(migrationPath);
  if (cache) return cache;
  const promise = _defineMigration(migrationPath);
  migrationDefinitionCache.set(migrationPath, promise);
  return promise;
}
async function _defineMigration(migrationPath: string) {
  const migratedPath = localRelative("./", migrationPath).split(sep).join(targetSep);
  const lines = await loadStartingComments(migrationPath);
  const dependentMigrations = [];
  for (const line of lines) {
    if (!line.startsWith("-- ")) break;
    const [key, ...values] = line.slice(3).split(": ");
    const value = values.join(": ");
    if (key === "REQUIRES") {
      const dependencyPath = relative("./", resolve(join(migratedPath, "../", value)));
      dependentMigrations.push(dependencyPath);
    }
  }
  const dependencyPromise = createObjectPromise<unknown>();
  const ownPromise = dependencyPromise.promise.then(() => activeMigration = activeMigration.then(applyMigration.bind(null, migratedPath)));
  migrations[migratedPath] = {
    dependencies: dependentMigrations,
    dependencyPromise,
    ownPromise,
    path: migratedPath,
  };
  await Promise.all(dependentMigrations.map(defineMigration));
}
let activeMigration = Promise.resolve();
for await (const migrationPath of recursivelyIteratePath("migrations")) {
  await defineMigration(migrationPath);
}
for (const key in migrations) {
  const migration = migrations[key];
  for (const i of migration.dependencies) {
    if (!(i in migrations)) {
      throw new Error(`Dependency ${i} of ${key} is not a migration`);
    }
  }
}

const connection = await _db.connect();

await connection.query(`CREATE TABLE IF NOT EXISTS "public"."puppy0migrations" (
  "id" text NOT NULL,
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "confirmed_at" timestamp(3),
  PRIMARY KEY ("id")
);`);

await connection.query(`SELECT pg_advisory_lock(3643137540997522726);`);

const applied_migrations = new Set<string>();

{
  const { rows } = await connection.query<{ id: string; created_at: Date; confirmed_at: Date | null; }>(`SELECT * FROM "public"."puppy0migrations";`);
  for (const row of rows) {
    applied_migrations.add(row.id);
    if (!row.confirmed_at) {
      throw new Error(`Unconfirmed migration detected. Please manually check whether the effects of the migration have been applied and then mark the migration as confirmed manually before attempting to run the application again. Migration ID: ${row.id}`);
    }
  }
}

async function applyMigration(name: string) {
  if (!applied_migrations.has(name)) {
    console.log(`Running migration ${name}`);
    await connection.query(`INSERT INTO "public"."puppy0migrations" ("id") VALUES ($1);`, [name]);
    const query = await readFile(name, "utf8");
    await connection.query(query);
    await connection.query(`UPDATE "public"."puppy0migrations" SET "confirmed_at" = CURRENT_TIMESTAMP WHERE "id" = $1;`, [name]);
    applied_migrations.add(name);
  }
}

const migrationPromises = [];

for (const key in migrations) {
  const migration = migrations[key];
  migration.dependencyPromise.resolve(Promise.all(migration.dependencies.map((value) => {
    return migrations[value].ownPromise;
  })));
  migrationPromises.push(migration.ownPromise);
}

await Promise.all(migrationPromises);

await connection.query(`SELECT pg_advisory_unlock(3643137540997522726);`);

connection.release();
