// Enhanced service worker with comprehensive proxy support
try {
  importScripts("/dy/config.js");
  importScripts("/dy/worker.js");
  importScripts("/m/bundle.js");  
  importScripts("/m/config.js");
} catch (error) {
  console.warn("Some proxy scripts not available:", error);
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
  // Skip non-HTTP requests and extension requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    (async function () {
      try {
        const url = new URL(event.request.url);

        // Handle Dynamic proxy requests (/dy/) if available
        if (dynamic && url.pathname.startsWith("/dy/")) {
          try {
            return await dynamic.fetch(event);
          } catch (err) {
            console.warn("Dynamic proxy error:", err);
            // Fallback to regular fetch
            return await fetch(event.request);
          }
        }

        // Handle Ultraviolet proxy requests (/a/) if available
        if (uv && url.pathname.startsWith("/a/")) {
          try {
            return await uv.fetch(event);
          } catch (err) {
            console.warn("Ultraviolet proxy error:", err);
            // Fallback to regular fetch
            return await fetch(event.request);
          }
        }

        // Handle bare server requests (/o/) - pass through to origin server
        if (url.pathname.startsWith("/o/")) {
          try {
            // Create new request to origin server for bare server
            const bareRequest = new Request(event.request.url, {
              method: event.request.method,
              headers: event.request.headers,
              body: event.request.body,
              mode: 'cors',
              credentials: 'omit'
            });
            return await fetch(bareRequest);
          } catch (err) {
            console.warn("Bare server error:", err);
            return new Response('Bare server unavailable', { status: 503 });
          }
        }

        // Default: pass through to network with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        try {
          const response = await fetch(event.request, { 
            signal: controller.signal 
          });
          clearTimeout(timeoutId);
          return response;
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      } catch (error) {
        console.error("Service worker fetch error:", error);

        // Better fallback for failed requests
        if (event.request.mode === "navigate") {
          // Instead of redirecting, return a simple error page
          return new Response(`
            <!DOCTYPE html>
            <html>
            <head><title>Connection Error</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1>Connection Error</h1>
              <p>Unable to load the requested page. Please try again.</p>
              <button onclick="history.back()">Go Back</button>
              <button onclick="location.reload()">Retry</button>
            </body>
            </html>
          `, {
            status: 503,
            statusText: "Service Unavailable",
            headers: { 'Content-Type': 'text/html' }
          });
        }

        // For non-navigation requests, return a simple error response
        return new Response("Service Worker Error", {
          status: 503,
          statusText: "Service Unavailable",
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
