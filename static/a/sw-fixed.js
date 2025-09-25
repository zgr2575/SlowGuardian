/*global __uv$config*/
importScripts('/a/bundle.js');
importScripts('/a/config.js');

const sw = new UVServiceWorker(__uv$config);

self.addEventListener('fetch', (event) => {
  event.respondWith(sw.fetch(event));
});

self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});