// Enhanced service worker with comprehensive proxy support
let uv, dynamic;

// Safe script import with error handling
function safeImportScripts(scripts) {
  for (const script of scripts) {
    try {
      importScripts(script);
    } catch (error) {
      console.warn(`Failed to import ${script}:`, error.message);
    }
  }
}

// Import required scripts with error handling
safeImportScripts([
  "/dy/config.js",
  "/dy/worker.js", 
  "/m/bundle.js",
  "/m/config.js"
]);

// Initialize proxy systems with error handling
try {
  if (typeof UVServiceWorker !== 'undefined') {
    uv = new UVServiceWorker();
  }
} catch (error) {
  console.warn("UV initialization failed:", error);
}

try {
  if (typeof Dynamic !== 'undefined') {
    dynamic = new Dynamic();
    self.dynamic = dynamic;
  }
} catch (error) {
  console.warn("Dynamic initialization failed:", error);
}

// Enhanced fetch event handler with better error handling
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async function () {
      try {
        const url = new URL(event.request.url);

        // Handle Dynamic proxy requests (/dy/)
        if (dynamic && await dynamic.route(event)) {
          return await dynamic.fetch(event);
        }

        // Handle Ultraviolet proxy requests (/a/)
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
        // Fallback for failed requests
        if (event.request.mode === "navigate") {
          return Response.redirect("/", 302);
        }
        
        // Return a basic response for other failed requests
        return new Response("Service unavailable", { status: 503 });
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
