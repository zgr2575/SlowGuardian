import { BareMuxConnection } from "@mercuryworkshop/bare-mux";

// Empty means "same origin". Set VITE_RELAY_ORIGIN to move the relays off this host.
const RELAY_ORIGIN = import.meta.env?.VITE_RELAY_ORIGIN || "";

let connection = null;

export function relayEndpoints(loc = location) {
  const origin = RELAY_ORIGIN || loc.origin;
  return {
    bare: `${origin}/api/bare/`,
    wisp: `${origin.replace(/^http/, "ws")}/api/wisp/`,
  };
}

export function getConnection() {
  connection ??= new BareMuxConnection("/baremux/worker.js");
  return connection;
}

// bare-mux keeps one active transport for every tab, so the relay is a global choice.
export async function setRelay(kind) {
  const ends = relayEndpoints();
  const conn = getConnection();
  if (kind === "wisp")
    await conn.setTransport("/epoxy/index.mjs", [{ wisp: ends.wisp }]);
  else await conn.setTransport("/baremod/index.mjs", [ends.bare]);
}
