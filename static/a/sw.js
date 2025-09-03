// Import Ultraviolet bundle and config first
importScripts("/a/bundle.js");
importScripts("/a/config.js");

// Initialize Ultraviolet service worker
const uv = new UVServiceWorker();

// Install event
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate event  
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch event for proxy handling
self.addEventListener("fetch", (event) => {
  if (event.request.url.startsWith(location.origin + __uv$config.prefix)) {
    event.respondWith(uv.fetch(event));
  }
});
