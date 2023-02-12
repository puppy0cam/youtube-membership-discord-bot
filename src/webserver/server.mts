import { createServer } from "http";
import { onIncomingRequest } from "./onIncomingRequest.mjs";

export const server = createServer(onIncomingRequest);

server.listen(8097, '127.0.0.1');
