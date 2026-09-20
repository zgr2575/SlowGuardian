// One worker for both engines: Ultraviolet owns /uv/service/, Scramjet owns
// /scram/service/. Everything else falls through to the network untouched.
importScripts("/uv/uv.bundle.js", "/uv/uv.config.js", "/uv/uv.sw.js");
importScripts("/scram/scramjet.all.js");

const SCRAM_PREFIX = "/scram/service/";

const uv = new UVServiceWorker();

// Built on first use, never at startup. ScramjetServiceWorker's constructor opens the
// "$scramjet" IndexedDB at version 1 with no upgrade callback, which CREATES the
// database with no object stores if it does not exist yet. The page's controller then
// opens the same version, its upgrade never runs, and writing the config fails with
// "One of the specified object stores was not found". Building it only once a
// /scram/service/ request arrives guarantees the controller set the database up first.
let scramjet = null;

async function scramjetFor(event) {
  if (!event.request.url.startsWith(location.origin + SCRAM_PREFIX))
    return null;
  if (!scramjet) {
    const { ScramjetServiceWorker } = $scramjetLoadWorker();
    scramjet = new ScramjetServiceWorker();
  }
  await scramjet.loadConfig();
  return scramjet;
}

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
    const engine = await scramjetFor(event);
    if (engine && engine.route(event)) return engine.fetch(event);
  } catch (error) {
    console.error(
      "[SlowGuardian] scramjet could not handle",
      event.request.url,
      error,
    );
  }

  return fetch(event.request);
}

self.addEventListener("fetch", (event) => event.respondWith(handle(event)));
