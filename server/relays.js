import { createBareServer } from "@tomphttp/bare-server-node";
import { server as wisp, logging } from "@mercuryworkshop/wisp-js/server";

// wisp logs every connection at info level; that is noise in a serverless log.
logging.set_level(
  process.env.SG_WISP_LOG === "info" ? logging.INFO : logging.WARN,
);

export const BARE_PATH = "/api/bare/";
export const WISP_PATH = "/api/wisp/";

/**
 * Builds the two relays the proxy engines talk to. The same factory is used by the
 * Vite dev server, the standalone server and the Vercel functions so all three behave
 * identically.
 *
 * `allowLoopback` is only ever on for the test suite, which proxies a local fixture.
 */
export function createRelays({
  allowLoopback = process.env.NODE_ENV === "test",
} = {}) {
  const bare = createBareServer(BARE_PATH, {
    logErrors: process.env.SG_BARE_LOG === "1",
    blockLocal: !allowLoopback,
    legacySupport: false,
    // bare-server-node defaults to 10 keep-alive requests per IP per minute. A single
    // page easily makes ten times that, and behind a CDN every visitor can share one
    // IP, so the default turns into "Too Many Connections" on the first real site.
    connectionLimiter: {
      maxConnectionsPerIP: 1_000_000,
      windowDuration: 1,
      blockDuration: 0,
    },
  });

  Object.assign(wisp.options, {
    allow_loopback_ips: allowLoopback,
    allow_private_ips: false,
    allow_udp_streams: false,
  });

  return {
    /** Returns true when the request was a bare request and has been handled. */
    handleRequest(req, res) {
      if (!bare.shouldRoute(req)) return false;
      bare.routeRequest(req, res);
      return true;
    },

    /** Returns true when the upgrade belonged to one of the relays. */
    handleUpgrade(req, socket, head) {
      if (bare.shouldRoute(req)) {
        bare.routeUpgrade(req, socket, head);
        return true;
      }
      if (req.url?.startsWith(WISP_PATH)) {
        wisp.routeRequest(req, socket, head);
        return true;
      }
      return false;
    },

    close() {
      bare.close();
    },
  };
}
