import type { IncomingMessage, ServerResponse } from "http";
import { handleDiscordCallback } from "./handleDiscordCallback.mjs";

export async function onIncomingRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {

  const url = new URL(request.url!, `http://${request.headers.host || "unknown"}`);

  try {

    switch (url.pathname) {
      case "/auth/discord/callback": return await handleDiscordCallback(url, response);
      default:
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("Not Found");
    }

  } catch (e) {
    console.error(e);
    response.writeHead(500, { "Content-Type": "text/plain" });
    response.end("Internal Error");
  }

}
