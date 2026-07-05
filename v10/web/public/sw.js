// public/sw.js — registered at scope "/". Canonical Scramjet-App service worker.
// Copied verbatim from the verified Phase 1 client (v10/public/sw.js); Astro
// copies /public to the dist root untouched, so this stays at "/sw.js".

importScripts("/scram/scramjet.all.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

async function handleRequest(event) {
  await scramjet.loadConfig();
  if (scramjet.route(event)) {
    return scramjet.fetch(event);
  }
  return fetch(event.request);
}

self.addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});
