/**
 * SlowGuardian V10 — Phase 1 proxy core.
 *
 * Express serves the app + the Scramjet/bare-mux/epoxy browser bundles straight
 * out of node_modules; a raw node:http server owns the WebSocket 'upgrade' event
 * so wisp-js can route /wisp/ tunnels. COOP/COEP are set on every response for
 * cross-origin isolation (Scramjet WASM + epoxy SharedArrayBuffer).
 *
 * Crash-only: uncaughtException / unhandledRejection are LOGGED, never
 * process.exit()'d — a single bad proxied URL must not take the server down.
 */
import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

import { server as wisp, logging } from "@mercuryworkshop/wisp-js/server";
import { scramjetPath } from "@mercuryworkshop/scramjet/path"; // -> node_modules/@mercuryworkshop/scramjet/dist
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";   // -> .../bare-mux/dist
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";   // -> .../epoxy-transport/dist

import { config, isDev } from "./config.js";
import { logger } from "./logger.js";

const publicPath = fileURLToPath(new URL("../public/", import.meta.url));

// --- Wisp engine config -----------------------------------------------------
// NOTE: do NOT blacklist example.com here — the Phase 1 smoke test proxies it.
logging.set_level(isDev ? logging.INFO : logging.WARN);
Object.assign(wisp.options, {
  allow_udp_streams: false,
  hostname_blacklist: [],
  dns_servers: ["1.1.1.3", "1.0.0.3"],
});

const app = express();

// --- Cross-origin isolation — REQUIRED, set before anything else ------------
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.get("/healthz", (req, res) => res.json({ ok: true }));

// --- Serve proxy bundles straight from node_modules (trailing slash matters) -
app.use("/scram/", express.static(scramjetPath));   // scramjet.all.js, scramjet.sync.js, scramjet.wasm.wasm
app.use("/baremux/", express.static(baremuxPath));  // index.js, index.mjs, worker.js
app.use("/epoxy/", express.static(epoxyPath));      // index.mjs (default transport)

// --- App's own static frontend ----------------------------------------------
app.use(express.static(publicPath));

// --- Raw http server: Express for requests, wisp-js for /wisp/ upgrades ------
const server = createServer();

server.on("request", (req, res) => app(req, res));

server.on("upgrade", (req, socket, head) => {
  if (req.url.endsWith("/wisp/")) {
    wisp.routeRequest(req, socket, head);
  } else {
    socket.destroy(); // hard-drop non-wisp upgrades
  }
});

server.on("listening", () => {
  logger.info(
    { port: config.PORT, host: config.HOST, wisp: `ws://${config.HOST}:${config.PORT}/wisp/` },
    "SlowGuardian V10 proxy listening"
  );
});

server.on("error", (err) => logger.error({ err }, "http server error"));

// --- Crash-only handlers: LOG, do not exit mid-request ----------------------
process.on("uncaughtException", (err) => logger.error({ err }, "uncaughtException (kept alive)"));
process.on("unhandledRejection", (reason) => logger.error({ reason }, "unhandledRejection (kept alive)"));

// --- Graceful shutdown (intentional, only on signals) -----------------------
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "shutting down");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref(); // force-exit if close hangs
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

server.listen({ port: config.PORT, host: config.HOST });

export { app, server };
