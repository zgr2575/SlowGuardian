import http from "node:http";
import { createRelays } from "../server/relays.js";

const relays = createRelays();

const server = http.createServer((req, res) => {
  if (relays.handleRequest(req, res)) return;
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: "not a relay path", url: req.url }));
});

server.on("upgrade", (req, socket, head) => {
  if (!relays.handleUpgrade(req, socket, head)) socket.destroy();
});

export default server;
