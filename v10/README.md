# SlowGuardian V10 — Phase 1 Proxy Core

Scramjet-over-Wisp proxy core: a single service worker, `wisp-js` handling the
WebSocket upgrade, `bare-mux` + `epoxy-transport` as the client transport, and
COOP/COEP cross-origin isolation. Backend is Express on a raw `node:http` server;
the frontend for this phase is a minimal dark test page (the Astro UI lands in
Phase 2).

## Layout

```
v10/
  package.json         # pinned proxy stack + envalid/pino
  src/
    config.js          # envalid, fail-fast (PORT/HOST/NODE_ENV)
    logger.js          # pino; pino-pretty only in dev
    server.js          # express + http upgrade -> wisp-js, COOP/COEP, graceful shutdown
  public/
    index.html         # minimal test page (URL input + Go + iframe)
    boot.js            # register SW, set epoxy transport -> /wisp/, navigate
    sw.js              # Scramjet service worker
```

The Scramjet / bare-mux / epoxy browser bundles are NOT copied into `public/` —
`server.js` serves them straight out of `node_modules` via each package's own
path helper (`/scram/`, `/baremux/`, `/epoxy/`), so the served bytes always match
the installed version.

## Install & run

```bash
cd v10
npm install
npm run dev      # NODE_ENV=development, pretty logs, --watch
# or
npm start        # plain node src/server.js
```

Then open http://localhost:8080, type a URL (default `https://example.com`),
and click **Go**. The live site renders inside the proxied iframe.

Config via env (all optional): `PORT` (default 8080), `HOST` (default 0.0.0.0),
`NODE_ENV` (development|production|test). Invalid values fail fast at boot.

> Secure-context note: service workers / SharedWorker / WASM require a secure
> context. `http://localhost` and `http://127.0.0.1` count as secure, so local
> dev needs no HTTPS. Any non-loopback host must be served over real HTTPS.

## Phase 1 exit criteria

From a clean browser you can:
1. Enter a URL and proxy a **live** site through **one** service worker (scope `/`).
2. `wisp-js` handles the WebSocket **upgrade** at `/wisp/` (everything else on the
   upgrade event is `socket.destroy()`'d).
3. **COOP** (`same-origin`) + **COEP** (`require-corp`) are set on every response.
4. A bad proxied URL **never** crashes the server — `uncaughtException` /
   `unhandledRejection` are logged, not `process.exit()`'d.

## Verify

- Headers: `curl -sI http://localhost:8080/ | grep -i cross-origin` shows both
  `Cross-Origin-Opener-Policy: same-origin` and
  `Cross-Origin-Embedder-Policy: require-corp`.
- Assets: `/scram/scramjet.all.js`, `/scram/scramjet.wasm.wasm`,
  `/baremux/worker.js`, `/epoxy/index.mjs` all return 200.
- Wisp upgrade: a WebSocket to `ws://localhost:8080/wisp/` upgrades (101) and
  stays open; a WebSocket to any other path is dropped immediately.
- End-to-end: the browser test page renders `https://example.com` ("Example
  Domain") inside `#sj-frame`.

See the project test plan for the automated wisp-handshake check and the
Playwright smoke test.
