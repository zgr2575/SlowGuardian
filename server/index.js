import http from "node:http";
import { fileURLToPath } from "node:url";
import sirv from "sirv";
import { createRelays } from "./relays.js";

// The standalone server: static files plus both relays. Used for `npm start`,
// self-hosting and the end-to-end tests.
export function createAppServer({
  root = fileURLToPath(new URL("../dist", import.meta.url)),
} = {}) {
  const relays = createRelays();

  const assets = sirv(root, {
    single: true,
    etag: true,
    setHeaders(res, pathname) {
      if (pathname === "/sw.js") {
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Service-Worker-Allowed", "/");
      }
    },
  });

  const server = http.createServer((req, res) => {
    if (relays.handleRequest(req, res)) return;
    if (req.url === "/api/health") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true, version: "11.0.0" }));
      return;
    }
    assets(req, res, () => {
      res.statusCode = 404;
      res.end("Not found");
    });
  });

  server.on("upgrade", (req, socket, head) => {
    if (!relays.handleUpgrade(req, socket, head)) socket.destroy();
  });

  server.on("close", () => relays.close());
  return server;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 8080;
  createAppServer().listen(port, () => {
    console.log(`SlowGuardian listening on http://localhost:${port}`);
  });
}
