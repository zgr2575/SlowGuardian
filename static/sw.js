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
  event.respondWith(
    (async function () {
      const url = new URL(event.request.url);
      
      // Only intercept requests that are for our origin or proxy paths
      // Let external scripts (like Enzuzo, AdSense, Analytics) pass through without interception
      if (url.origin !== location.origin) {
        return await fetch(event.request);
      }

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
