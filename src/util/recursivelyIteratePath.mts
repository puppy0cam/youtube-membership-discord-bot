import { lstat, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

export async function* recursivelyIteratePath(path: string, cache: Set<string> = new Set()): AsyncGenerator<string> {
  const resolvedPath = resolve(path);
  if (cache.has(resolvedPath)) {
    return;
  }
  cache.add(resolvedPath);
  const info = await lstat(resolvedPath, {
    bigint: true,
  });
  if (info.isSymbolicLink()) {
    throw new Error("Symbolic links are not supported");
  }
  if (info.isDirectory()) {
    const files = await readdir(resolvedPath, {
      encoding: "utf8",
    });
    for (const file of files) {
      yield* recursivelyIteratePath(join(path, file), cache);
    }
    return;
  }
  if (info.isFile()) {
    yield resolvedPath;
  }
}
