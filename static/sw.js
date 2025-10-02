importScripts("/dy/config.js");
importScripts("/dy/worker.js");
importScripts("/m/bundle.js");
importScripts("/m/config.js");
importScripts(__uv$config.sw || "/m/sw.js");

// Scramjet for premium users
let scramjet = null;
let scramjetLoaded = false;

try {
  importScripts("/scram/config.js");
  importScripts("/scram/scramjet.bundle.js");
  importScripts("/scram/scramjet.codecs.js");
  importScripts("/scram/scramjet.client.js");
  importScripts("/scram/scramjet.worker.js");
  scramjet = new ScramjetServiceWorker();
  scramjetLoaded = true;
  console.log("[SW] ✓ Scramjet loaded for premium users");
} catch (e) {
  console.log("[SW] ⚠ Scramjet not available, using Ultraviolet only:", e.message);
}

const uv = new UVServiceWorker();
const dynamic = new Dynamic();

let userKey = new URL(location).searchParams.get("userkey");
self.dynamic = dynamic;

// Helper function to check if user is premium
function isPremiumUser(request) {
  const cookies = request.headers.get('cookie') || '';
  return cookies.includes('sg_premium=1');
}

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

      // Handle Scramjet proxy (premium users only) - /scram/ prefix
      if (scramjetLoaded && scramjet.route(event)) {
        if (isPremiumUser(event.request)) {
          console.log("[SW] 🔓 Scramjet request for premium user");
          return await scramjet.fetch(event);
        } else {
          console.log("[SW] 🔒 Non-premium user attempted Scramjet access, redirecting to UV");
          // Redirect non-premium users trying to access Scramjet to UV
          const decodedUrl = event.request.url.replace(location.origin + "/scram/", "");
          const encodedForUV = location.origin + "/a/" + decodedUrl;
          return Response.redirect(encodedForUV, 302);
        }
      }

      // Handle Ultraviolet proxy (all users) - /a/ prefix
      if (event.request.url.startsWith(location.origin + "/a/")) {
        return await uv.fetch(event);
      }

      return await fetch(event.request);
    })(),
  );
});
