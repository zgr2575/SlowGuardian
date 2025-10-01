importScripts("/dy/config.js");
importScripts("/dy/worker.js");
importScripts("/m/bundle.js");
importScripts("/m/config.js");
importScripts(__uv$config.sw || "/m/sw.js");

const uv = new UVServiceWorker();
const dynamic = new Dynamic();

let userKey = new URL(location).searchParams.get("userkey");
self.dynamic = dynamic;

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // Don't intercept external requests at all - let browser handle them naturally
  // This allows external scripts (Enzuzo, AdSense, Analytics) to load without service worker interference
  if (url.origin !== location.origin) {
    return; // Don't call event.respondWith() - let browser handle it
  }

  event.respondWith(
    (async function () {
      if (await dynamic.route(event)) {
        return await dynamic.fetch(event);
      }

      if (event.request.url.startsWith(location.origin + "/a/")) {
        return await uv.fetch(event);
      }

      return await fetch(event.request);
    })(),
  );
});
