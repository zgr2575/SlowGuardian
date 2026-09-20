import { ensureServiceWorker } from "./sw.js";
import { setRelay } from "./transport.js";

export { proxiedUrl, decodeProxied, getScramjet, ENGINES } from "./engine.js";
export { setRelay, relayEndpoints } from "./transport.js";
export { ProxyUnsupportedError } from "./sw.js";

let swReady = null;
let currentRelay = null;

// Safe to call before every load; the worker is registered once and the transport
// is only swapped when the relay setting actually changed.
export async function initProxy(relay) {
  swReady ??= ensureServiceWorker();
  await swReady;
  if (currentRelay !== relay) {
    await setRelay(relay);
    currentRelay = relay;
  }
}

export function resetProxy() {
  swReady = null;
  currentRelay = null;
}
