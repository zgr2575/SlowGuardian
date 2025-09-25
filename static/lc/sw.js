// LibCurl Transport Service Worker v1.5.0
// Native curl-based proxy backend

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Only handle requests for this proxy scope
  if (event.request.url.includes('/lc/')) {
    event.respondWith(handleLibCurlRequest(event.request));
  }
});

async function handleLibCurlRequest(request) {
  try {
    // Basic proxy functionality for LibCurl Transport
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Extract target URL from LibCurl encoded path
    const encoded = pathname.replace('/lc/', '');
    if (!encoded) {
      return new Response('Invalid LibCurl URL', { status: 400 });
    }
    
    // For now, return a basic response indicating the proxy is registered
    // Full LibCurl implementation would require the complete library
    return new Response(`LibCurl Transport proxy registered for: ${encoded}`, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response('LibCurl Transport proxy error', { status: 500 });
  }
}