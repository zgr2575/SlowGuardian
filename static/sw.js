// Enhanced service worker with comprehensive proxy support
try {
  importScripts("/dy/config.js");
  importScripts("/dy/worker.js");
  importScripts("/m/bundle.js");  
  importScripts("/m/config.js");
} catch (error) {
  console.error("Failed to import scripts:", error);
}

let uv, dynamic;

try {
  // Initialize UV service worker only if Ultraviolet is available
  if (typeof UVServiceWorker !== 'undefined') {
    uv = new UVServiceWorker();
  }
} catch (error) {
  console.warn("Ultraviolet not available:", error);
}

try {
  // Initialize Dynamic only if available
  if (typeof Dynamic !== 'undefined') {
    dynamic = new Dynamic();
    self.dynamic = dynamic;
  }
} catch (error) {
  console.warn("Dynamic not available:", error);
}

// Enhanced fetch event handler with better error handling
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async function () {
      try {
        const url = new URL(event.request.url);

        // Handle Dynamic proxy requests (/a/q/) if available
        if (dynamic && await dynamic.route(event)) {
          return await dynamic.fetch(event);
        }

        // Handle Ultraviolet proxy requests (/a/) if available
        if (uv && event.request.url.startsWith(location.origin + "/a/")) {
          return await uv.fetch(event);
        }

        // Handle bare server requests (/o/)
        if (event.request.url.startsWith(location.origin + "/o/")) {
          return await fetch(event.request);
        }

        // Default: pass through to network
        return await fetch(event.request);
      } catch (error) {
        // Only log critical navigation errors, not routine fetch failures
        if (
          event.request.mode === "navigate" ||
          error.message.includes("register")
        ) {
          console.error("Service worker fetch error:", error);
        }

        // Fallback for failed requests
        if (event.request.mode === "navigate") {
          return Response.redirect("/", 302);
        }

        return new Response("Service Worker Error", {
          status: 500,
          statusText: "Internal Server Error",
        });
      }
    })()
  );
});

// Install event handler
self.addEventListener("install", (event) => {
  console.log("Service worker installing...");
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event handler
self.addEventListener("activate", (event) => {
  console.log("Service worker activating...");
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// Message event handler for communication with main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
