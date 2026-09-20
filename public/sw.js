// One worker for both engines: Ultraviolet owns /uv/service/, Scramjet owns
// /scram/service/. Everything else falls through to the network untouched.
importScripts("/uv/uv.bundle.js", "/uv/uv.config.js", "/uv/uv.sw.js");
importScripts("/scram/scramjet.all.js");

const uv = new UVServiceWorker();
const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

// skipWaiting + claim are required, not cosmetic: a freshly installed worker does not
// control the page that registered it, so the very first proxied request would bypass
// the worker and a static host would answer it with index.html.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);

async function handle(event) {
  if (uv.route(event)) return uv.fetch(event);

  try {
    await scramjet.loadConfig();
    if (scramjet.route(event)) return scramjet.fetch(event);
  } catch {
    // Scramjet has not been initialised by any page yet, so nothing of ours to route.
  }

  return fetch(event.request);
}

self.addEventListener("fetch", (event) => event.respondWith(handle(event)));
