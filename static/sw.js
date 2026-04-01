// Load scripts in correct order to prevent timing issues
// First load configs that don't depend on libraries
importScripts("/dy/config.js");

// Then load the libraries
importScripts("/m/bundle.js");
importScripts("/dy/worker.js");

// Now load config that depends on Ultraviolet library
importScripts("/m/config.js");

// Finally load the service worker implementation
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
      // Handle Dynamic proxy
      if (await dynamic.route(event)) {
        return await dynamic.fetch(event);
      }

      // Handle Ultraviolet proxy (all users) - /a/ prefix
      if (event.request.url.startsWith(location.origin + "/a/")) {
        return await uv.fetch(event);
      }

      return await fetch(event.request);
    })(),
  );
});
