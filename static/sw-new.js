/**
 * SlowGuardian v9 - Enhanced Service Worker
 * Completely recoded proxy system for maximum reliability
 */

console.log("🚀 SlowGuardian Service Worker v9 initializing...");

// Global configuration
const SW_VERSION = "9.0.0";
const CACHE_NAME = `slowguardian-v${SW_VERSION}`;
const DEBUG = true;

// Proxy configurations
const PROXY_CONFIGS = {
  ultraviolet: {
    prefix: "/a/",
    bare: "/o/",
    bundle: "/a/bundle.js",
    config: "/a/config.js",
    client: "/a/client.js",
    handler: "/a/handler.js",
    sw: "/a/sw.js"
  },
  dynamic: {
    prefix: "/dy/",
    bare: "/o/",
    worker: "/dy/worker.js",
    config: "/dy/config.js",
    client: "/dy/client.js",
    handler: "/dy/handler.js"
  }
};

// State tracking
let proxyInitialized = {
  ultraviolet: false,
  dynamic: false
};

let proxyInstances = {
  uv: null,
  dynamic: null
};

/**
 * Enhanced logging with timestamp and categories
 */
function log(level, category, message, ...args) {
  if (!DEBUG && level === 'debug') return;
  
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;
  
  switch (level) {
    case 'error':
      console.error(prefix, message, ...args);
      break;
    case 'warn':
      console.warn(prefix, message, ...args);
      break;
    case 'info':
      console.info(prefix, message, ...args);
      break;
    case 'debug':
      console.log(prefix, message, ...args);
      break;
    default:
      console.log(prefix, message, ...args);
  }
}

/**
 * Initialize proxy systems with error handling
 */
async function initializeProxies() {
  log('info', 'INIT', 'Starting proxy system initialization...');

  // Initialize Ultraviolet
  try {
    log('debug', 'UV', 'Loading Ultraviolet scripts...');
    
    // Import scripts with better error handling
    try {
      await Promise.race([
        new Promise((resolve, reject) => {
          try {
            importScripts("/a/bundle.js");
            resolve();
          } catch (error) {
            reject(error);
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout loading bundle.js')), 10000))
      ]);
    } catch (error) {
      throw new Error(`Failed to load bundle.js: ${error.message}`);
    }
    
    try {
      await Promise.race([
        new Promise((resolve, reject) => {
          try {
            importScripts("/a/config.js");
            resolve();
          } catch (error) {
            reject(error);
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout loading config.js')), 10000))
      ]);
    } catch (error) {
      throw new Error(`Failed to load config.js: ${error.message}`);
    }

    // Wait a moment for scripts to initialize
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify UV is available
    if (typeof UVServiceWorker !== 'undefined' && typeof self.__uv$config !== 'undefined') {
      proxyInstances.uv = new UVServiceWorker();
      proxyInitialized.ultraviolet = true;
      log('info', 'UV', '✅ Ultraviolet proxy initialized successfully');
    } else {
      throw new Error('UVServiceWorker or config not available after script loading');
    }
  } catch (error) {
    log('error', 'UV', '❌ Failed to initialize Ultraviolet:', error.message);
    proxyInitialized.ultraviolet = false;
  }

  // Initialize Dynamic
  try {
    log('debug', 'DY', 'Loading Dynamic scripts...');
    
    try {
      await Promise.race([
        new Promise((resolve, reject) => {
          try {
            importScripts("/dy/config.js");
            resolve();
          } catch (error) {
            reject(error);
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout loading config.js')), 10000))
      ]);
    } catch (error) {
      throw new Error(`Failed to load Dynamic config.js: ${error.message}`);
    }
    
    try {
      await Promise.race([
        new Promise((resolve, reject) => {
          try {
            importScripts("/dy/worker.js");
            resolve();
          } catch (error) {
            reject(error);
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout loading worker.js')), 10000))
      ]);
    } catch (error) {
      throw new Error(`Failed to load Dynamic worker.js: ${error.message}`);
    }

    // Wait a moment for scripts to initialize
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify Dynamic is available
    if (typeof Dynamic !== 'undefined' && typeof self.__dynamic$config !== 'undefined') {
      proxyInstances.dynamic = new Dynamic();
      self.dynamic = proxyInstances.dynamic;
      proxyInitialized.dynamic = true;
      log('info', 'DY', '✅ Dynamic proxy initialized successfully');
    } else {
      throw new Error('Dynamic or config not available after script loading');
    }
  } catch (error) {
    log('error', 'DY', '❌ Failed to initialize Dynamic:', error.message);
    proxyInitialized.dynamic = false;
  }

  // Summary
  const initialized = Object.values(proxyInitialized).filter(Boolean).length;
  const total = Object.keys(proxyInitialized).length;
  log('info', 'INIT', `Proxy initialization complete: ${initialized}/${total} systems active`);
  
  if (initialized === 0) {
    log('error', 'INIT', '⚠️ No proxy systems initialized - service may not function');
  }
}

/**
 * Enhanced request routing with fallbacks
 */
function routeRequest(event) {
  const { request } = event;
  const url = new URL(request.url);
  
  log('debug', 'ROUTE', `Routing request: ${url.pathname}`);

  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) {
    log('debug', 'ROUTE', 'Skipping non-HTTP request');
    return null;
  }

  // Skip extension requests
  if (url.protocol.startsWith('chrome-extension:') || url.protocol.startsWith('moz-extension:')) {
    log('debug', 'ROUTE', 'Skipping extension request');
    return null;
  }

  // Route to Ultraviolet
  if (url.pathname.startsWith(PROXY_CONFIGS.ultraviolet.prefix)) {
    if (proxyInitialized.ultraviolet && proxyInstances.uv) {
      log('debug', 'UV', `Routing to Ultraviolet: ${url.pathname}`);
      try {
        return proxyInstances.uv.fetch(event);
      } catch (error) {
        log('error', 'UV', 'Ultraviolet routing failed:', error.message);
        return createErrorResponse('Ultraviolet proxy error', error.message);
      }
    } else {
      log('warn', 'UV', 'Ultraviolet not initialized, cannot route request');
      return createErrorResponse('Ultraviolet Unavailable', 'Proxy system not initialized');
    }
  }

  // Route to Dynamic
  if (url.pathname.startsWith(PROXY_CONFIGS.dynamic.prefix)) {
    if (proxyInitialized.dynamic && proxyInstances.dynamic) {
      log('debug', 'DY', `Routing to Dynamic: ${url.pathname}`);
      try {
        return proxyInstances.dynamic.fetch(event);
      } catch (error) {
        log('error', 'DY', 'Dynamic routing failed:', error.message);
        return createErrorResponse('Dynamic proxy error', error.message);
      }
    } else {
      log('warn', 'DY', 'Dynamic not initialized, cannot route request');
      return createErrorResponse('Dynamic Unavailable', 'Proxy system not initialized');
    }
  }

  // Not a proxy request
  return null;
}

/**
 * Create user-friendly error response
 */
function createErrorResponse(title, message) {
  const errorHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SlowGuardian - ${title}</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          color: white;
          margin: 0;
          padding: 20px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .error-container {
          text-align: center;
          max-width: 500px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .error-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .error-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 16px;
          color: #ff6b6b;
        }
        .error-message {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 30px;
          opacity: 0.9;
        }
        .retry-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .retry-btn:hover {
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <div class="error-icon">🚫</div>
        <div class="error-title">${title}</div>
        <div class="error-message">${message}</div>
        <button class="retry-btn" onclick="window.location.reload()">
          🔄 Retry
        </button>
      </div>
    </body>
    </html>
  `;

  return new Response(errorHTML, {
    status: 500,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}

/**
 * Service Worker Event Handlers
 */

// Install event
self.addEventListener('install', (event) => {
  log('info', 'SW', '🔧 Service Worker installing...');
  
  event.waitUntil(
    (async () => {
      try {
        await initializeProxies();
        await self.skipWaiting();
        log('info', 'SW', '✅ Service Worker installed successfully');
      } catch (error) {
        log('error', 'SW', '❌ Service Worker installation failed:', error.message);
      }
    })()
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  log('info', 'SW', '🟢 Service Worker activating...');
  
  event.waitUntil(
    (async () => {
      try {
        await self.clients.claim();
        
        // Clean up old caches
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME && name.startsWith('slowguardian-'))
            .map(name => caches.delete(name))
        );
        
        log('info', 'SW', '✅ Service Worker activated successfully');
      } catch (error) {
        log('error', 'SW', '❌ Service Worker activation failed:', error.message);
      }
    })()
  );
});

// Fetch event with enhanced error handling
self.addEventListener('fetch', (event) => {
  try {
    const proxyResponse = routeRequest(event);
    
    if (proxyResponse) {
      // This is a proxy request
      event.respondWith(
        (async () => {
          try {
            const response = await proxyResponse;
            log('debug', 'FETCH', `Proxy response: ${response.status} for ${event.request.url}`);
            return response;
          } catch (error) {
            log('error', 'FETCH', `Proxy fetch failed for ${event.request.url}:`, error.message);
            return createErrorResponse('Network Error', `Failed to load: ${error.message}`);
          }
        })()
      );
    } else {
      // Let regular requests pass through
      log('debug', 'FETCH', `Passing through: ${event.request.url}`);
    }
  } catch (error) {
    log('error', 'FETCH', 'Fetch event handler error:', error.message);
    event.respondWith(createErrorResponse('Service Worker Error', error.message));
  }
});

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  log('debug', 'MSG', 'Received message:', event.data);
  
  if (event.data && event.data.type === 'GET_STATUS') {
    event.ports[0].postMessage({
      version: SW_VERSION,
      proxies: proxyInitialized,
      timestamp: Date.now()
    });
  }
});

// Error event
self.addEventListener('error', (event) => {
  log('error', 'SW', 'Service Worker error:', event.error);
});

// Unhandled rejection
self.addEventListener('unhandledrejection', (event) => {
  log('error', 'SW', 'Unhandled promise rejection:', event.reason);
});

log('info', 'SW', '🚀 Service Worker script loaded and ready');