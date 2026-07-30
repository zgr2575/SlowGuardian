// public/sw.js — registered at scope "/". Canonical Scramjet-App service worker.
//
// skipWaiting + clients.claim are REQUIRED here, not cosmetic. navigator
// .serviceWorker.ready resolves once a worker is ACTIVE, but a freshly
// installed worker does not CONTROL the page that registered it until that
// page reloads or the worker claims its clients. Without claiming, the first
// /scramjet/<url> request of a first visit bypasses the SW and hits the
// network — which on a static host silently returns index.html, so the proxy
// frame renders SlowGuardian's own home page instead of the requested site.

importScripts("/scram/scramjet.all.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

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
