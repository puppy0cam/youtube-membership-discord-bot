import { createReadStream } from "fs";

export function loadStartingComments(path: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const results: string[] = [];
    let chunks: string = "";
    const stream = createReadStream(path, { encoding: "utf8" });
    stream.on("data", (chunk) => {
      const text = chunk.toString();
      if (text.includes("\n")) {
        const lines = `${chunks}${text}`.split(/\r?\n/g);
        chunks = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("--")) {
            if (trimmed.endsWith("\r")) {
              results.push(trimmed.slice(0, -1));
            } else {
              results.push(line);
            }
          } else if (trimmed !== "") {
            try {
              stream.destroy();
              resolve(results);
            } catch (e) {
              reject(e);
            }
          }
        }
      }
    });
    stream.on("error", reject);
  });
}
