// Enhanced service worker with comprehensive proxy support
let scriptsLoaded = {
  dynamic: false,
  ultraviolet: false
};

try {
  importScripts("/dy/config.js");
  importScripts("/dy/worker.js");
  scriptsLoaded.dynamic = true;
  console.log("✅ Dynamic proxy scripts loaded");
} catch (error) {
  console.warn("⚠️ Dynamic proxy scripts not available:", error);
}

try {
  importScripts("/a/bundle.js");  
  importScripts("/a/config.js");
  scriptsLoaded.ultraviolet = true;
  console.log("✅ Ultraviolet proxy scripts loaded");
} catch (error) {
  console.warn("⚠️ Ultraviolet proxy scripts not available:", error);
}

let uv, dynamic;

try {
  // Initialize UV service worker only if Ultraviolet is available
  if (typeof UVServiceWorker !== 'undefined' && scriptsLoaded.ultraviolet) {
    uv = new UVServiceWorker();
    console.log("✅ Ultraviolet service worker initialized");
  }
} catch (error) {
  console.warn("⚠️ Ultraviolet initialization failed:", error);
}

try {
  // Initialize Dynamic only if available
  if (typeof Dynamic !== 'undefined' && scriptsLoaded.dynamic) {
    dynamic = new Dynamic();
    self.dynamic = dynamic;
    console.log("✅ Dynamic service worker initialized");
  }
} catch (error) {
  console.warn("⚠️ Dynamic initialization failed:", error);
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
        if (url.pathname.startsWith("/dy/")) {
          if (dynamic) {
            try {
              console.log("🔄 Processing Dynamic request:", url.pathname);
              return await dynamic.fetch(event);
            } catch (err) {
              console.warn("⚠️ Dynamic proxy error:", err);
              return createErrorResponse("Dynamic proxy encountered an error. Please try again.");
            }
          } else {
            return createErrorResponse("Dynamic proxy is not available. Please refresh the page.");
          }
        }

        // Handle Ultraviolet proxy requests (/a/) if available
        if (url.pathname.startsWith("/a/")) {
          if (uv) {
            try {
              console.log("🔄 Processing Ultraviolet request:", url.pathname);
              return await uv.fetch(event);
            } catch (err) {
              console.warn("⚠️ Ultraviolet proxy error:", err);
              return createErrorResponse("Ultraviolet proxy encountered an error. Please try again.");
            }
          } else {
            return createErrorResponse("Ultraviolet proxy is not available. Please refresh the page.");
          }
        }

        // Handle bare server requests (/o/) - pass through to origin server
        if (url.pathname.startsWith("/o/")) {
          try {
            console.log("🔄 Processing bare server request:", url.pathname);
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
            console.warn("⚠️ Bare server error:", err);
            return createErrorResponse("Bare server is unavailable. Please check your connection and try again.");
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
          if (err.name === 'AbortError') {
            return createErrorResponse("Request timed out. Please try again.");
          }
          throw err;
        }
      } catch (error) {
        console.error("❌ Service worker fetch error:", error);

        // Better fallback for failed requests
        if (event.request.mode === "navigate") {
          // Return a user-friendly error page instead of redirecting
          return createNavigationErrorResponse(error.message);
        }

        // For non-navigation requests, return a simple error response
        return createErrorResponse("Unable to process request. Please refresh the page and try again.");
      }
    })()
  );
});

// Helper function to create user-friendly error responses
function createErrorResponse(message) {
  return new Response(JSON.stringify({
    error: true,
    message: message,
    timestamp: new Date().toISOString()
  }), {
    status: 503,
    statusText: "Service Unavailable",
    headers: { 'Content-Type': 'application/json' }
  });
}

// Helper function to create navigation error page
function createNavigationErrorResponse(errorMessage) {
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Connection Error - SlowGuardian</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px; 
          background: #1a1a2e; 
          color: #fff; 
        }
        .error-container { 
          max-width: 500px; 
          margin: 0 auto; 
          background: #16213e; 
          padding: 40px; 
          border-radius: 12px; 
        }
        h1 { color: #4f46e5; margin-bottom: 20px; }
        p { margin-bottom: 30px; line-height: 1.6; }
        button { 
          background: #4f46e5; 
          color: white; 
          border: none; 
          padding: 12px 24px; 
          border-radius: 8px; 
          margin: 0 10px; 
          cursor: pointer; 
          font-size: 16px;
        }
        button:hover { background: #4338ca; }
      </style>
    </head>
    <body>
      <div class="error-container">
        <h1>🔧 Connection Error</h1>
        <p><strong>Error:</strong> ${errorMessage}</p>
        <p>The proxy service encountered an issue loading the requested page.</p>
        <button onclick="history.back()">← Go Back</button>
        <button onclick="location.href='/'">🏠 Home</button>
        <button onclick="location.reload()">🔄 Retry</button>
      </div>
    </body>
    </html>
  `, {
    status: 503,
    statusText: "Service Unavailable",
    headers: { 'Content-Type': 'text/html' }
  });
}

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
