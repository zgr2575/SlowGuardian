/*global __uv$config*/
try {
  importScripts('/a/bundle.js');
  importScripts('/a/config.js');
  
  // Ensure config is available before creating service worker
  if (typeof __uv$config !== 'undefined') {
    const sw = new UVServiceWorker(__uv$config);
    
    self.addEventListener('fetch', (event) => {
      event.respondWith(sw.fetch(event));
    });
    
    self.addEventListener('message', (event) => {
      if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
      }
    });
    
    self.addEventListener('install', () => {
      console.log('UV Service worker installing...');
      self.skipWaiting();
    });
    
    self.addEventListener('activate', (event) => {
      console.log('UV Service worker activating...');
      event.waitUntil(self.clients.claim());
    });
    
    console.log('✅ UV Service worker loaded successfully');
  } else {
    console.error('❌ UV config not available');
  }
} catch (error) {
  console.error('❌ UV Service worker failed to load:', error);
}