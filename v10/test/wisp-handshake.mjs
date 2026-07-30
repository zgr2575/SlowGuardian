/**
 * Zero-dependency smoke test for the Phase 1 proxy server.
 * Start the server (`npm start`) on PORT 8080, then: `node test/wisp-handshake.mjs`
 *
 * Asserts: /wisp/ accepts a WebSocket upgrade (101) and non-wisp upgrades are
 * dropped. The full browser end-to-end proxy test arrives in Phase 4 (Playwright,
 * proxying a local fixture site so it never depends on live internet).
 */
import http from "node:http";

const PORT = process.env.PORT || 8080;

function tryUpgrade(path) {
  return new Promise((resolve) => {
    const req = http.request({
      host: "localhost",
      port: PORT,
      path,
      headers: {
        Connection: "Upgrade",
        Upgrade: "websocket",
        "Sec-WebSocket-Version": "13",
        "Sec-WebSocket-Key": "dGhlIHNhbXBsZSBub25jZQ==",
      },
    });
    let done = false;
    const fin = (v) => {
      if (!done) {
        done = true;
        resolve(v);
      }
    };
    req.on("upgrade", (res, socket) => {
      socket.destroy();
      fin("UPGRADED " + res.statusCode);
    });
    req.on("response", () => fin("NO-UPGRADE"));
    req.on("error", () => fin("SOCKET-DROPPED"));
    req.on("close", () => fin("SOCKET-DROPPED"));
    req.end();
  });
}

const wisp = await tryUpgrade("/wisp/");
const nope = await tryUpgrade("/nope/");
console.log("/wisp/ ->", wisp);
console.log("/nope/ ->", nope);

const ok = wisp === "UPGRADED 101" && nope === "SOCKET-DROPPED";
console.log(ok ? "PASS ✅" : "FAIL ❌");
process.exit(ok ? 0 : 1);
