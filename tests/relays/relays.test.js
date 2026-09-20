import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import WebSocket from "ws";
import { createRelays } from "../../server/relays.js";

let server;
let port;
let relays;

before(async () => {
  relays = createRelays({ allowLoopback: true });
  server = http.createServer((req, res) => {
    if (!relays.handleRequest(req, res)) {
      res.statusCode = 404;
      res.end();
    }
  });
  server.on("upgrade", (req, socket, head) => {
    if (!relays.handleUpgrade(req, socket, head)) socket.destroy();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  port = server.address().port;
});

after(() => {
  relays.close();
  server.close();
});

test("bare manifest lists v3", async () => {
  const res = await fetch(`http://127.0.0.1:${port}/api/bare/`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(
    body.versions.includes("v3"),
    `versions were ${JSON.stringify(body.versions)}`,
  );
});

test("bare survives a burst of 200 requests without rate limiting", async () => {
  const codes = await Promise.all(
    Array.from({ length: 200 }, () =>
      fetch(`http://127.0.0.1:${port}/api/bare/`).then((r) => r.status),
    ),
  );
  const rejected = codes.filter((c) => c !== 200);
  assert.equal(
    rejected.length,
    0,
    `got ${rejected.length} non-200 responses (${rejected[0]})`,
  );
});

test("wisp accepts a websocket and sends its first packet", async () => {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/api/wisp/`);
  ws.binaryType = "arraybuffer";
  const first = await new Promise((resolve, reject) => {
    ws.once("message", (data) => resolve(new Uint8Array(data)));
    ws.once("error", reject);
    setTimeout(
      () => reject(new Error("timed out waiting for the first wisp packet")),
      5000,
    );
  });
  ws.close();
  assert.equal(first[0], 0x03, "expected a CONTINUE packet");
});

test("paths that are not relays are left alone", async () => {
  const res = await fetch(`http://127.0.0.1:${port}/games`);
  assert.equal(res.status, 404);
});
