// Epoxy Transport Service Worker v2.1.28
// Mercury Workshop's optimized proxy backend

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Only handle requests for this proxy scope
  if (event.request.url.includes('/ep/')) {
    event.respondWith(handleEpoxyRequest(event.request));
  }
});

async function handleEpoxyRequest(request) {
  try {
    // Basic proxy functionality for Epoxy Transport
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Extract target URL from Epoxy encoded path
    const encoded = pathname.replace('/ep/', '');
    if (!encoded) {
      return new Response('Invalid Epoxy URL', { status: 400 });
    }
    
    // For now, return a basic response indicating the proxy is registered
    // Full Epoxy implementation would require the complete library
    return new Response(`Epoxy Transport proxy registered for: ${encoded}`, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response('Epoxy Transport proxy error', { status: 500 });
  }
}