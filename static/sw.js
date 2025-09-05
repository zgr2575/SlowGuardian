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

// Feature flag: preferred proxy. Set `self.__preferred_proxy = 'scramjet'` before SW registers to try Scramjet.
// Default to 'ultraviolet' to keep legacy behavior stable; can be overridden by embedding `self.__preferred_proxy`.
const PREFERRED_PROXY = (typeof self.__preferred_proxy !== 'undefined') ? self.__preferred_proxy : 'ultraviolet';

// Scramjet beta feature gate (default: disabled). To enable for quick testing,
// set `self.__scram_beta = { enabled:true, pct:1 }` before registering the SW
// (pct is percentage rollout 0-100). Premium-only: requires cookie `sg_premium=1`.
self.__scram_beta = (typeof self.__scram_beta !== 'undefined') ? self.__scram_beta : { enabled: false, pct: 0 };

// Helper: parse cookie header string into an object
function parseCookies(cookieHeader) {
  const out = {};
  try {
    if (!cookieHeader) return out;
    cookieHeader.split(';').forEach(part => {
      const idx = part.indexOf('=');
      if (idx === -1) return;
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx+1).trim();
      out[k] = decodeURIComponent(v);
    });
  } catch (e) {}
  return out;
}

// Determine whether this request is eligible for Scramjet beta routing
function isScramjetAllowed(request) {
  try {
    if (!self.__scram_beta || !self.__scram_beta.enabled) return false;

    // Premium-only: check cookie header for sg_premium=1
    const cookieHeader = request.headers && request.headers.get ? request.headers.get('cookie') : null;
    const cookies = parseCookies(cookieHeader);
    
    // Strict premium requirement - must have premium cookie set to "1"
    if (cookies['sg_premium'] !== '1') {
      log('debug', 'BETA', 'Scramjet access denied - premium subscription required');
      return false;
    }

    // Explicit opt-in via query param or cookie
    try {
      const url = new URL(request.url);
      if (url.searchParams.get('sg_beta') === 'scramjet') {
        log('debug', 'BETA', 'Scramjet enabled via query param');
        return true;
      }
    } catch (e) {}

    if (cookies['sg_beta'] === 'scramjet') {
      log('debug', 'BETA', 'Scramjet enabled via cookie');
      return true;
    }

    // Percentage-based rollout (only for premium users)
    const pct = Number(self.__scram_beta.pct || 0);
    if (pct >= 100) return true;
    if (pct <= 0) return false;
    
    const allowed = (Math.random() * 100) < pct;
    if (allowed) {
      log('debug', 'BETA', `Scramjet enabled via rollout (${pct}%)`);
    }
    return allowed;
  } catch (e) {
    log('error', 'BETA', 'Error checking Scramjet eligibility:', e && e.message);
    return false;
  }
}

// If the preferred proxy is scramjet, attempt to preload its official runtime bundle from /scram/.
if (PREFERRED_PROXY === 'scramjet') {
  try {
  // recommended import order: BareMux, BareMux transport, scramjet bundle
  try { importScripts('/baremux/worker.js'); console.info('[SW] BareMux worker preloaded'); } catch (e) {}
  try { importScripts('/baremux/transport.js'); console.info('[SW] BareMux transport preloaded'); } catch (e) {}

  importScripts('/scram/scramjet.all.js');
  console.info('[SW] Scramjet bundle preloaded (preferred)');
  } catch (e) {
    console.warn('[SW] Failed to preload Scramjet bundle:', e && e.message ? e.message : e);
  }
}

/**
 * Enhanced logging with timestamp and categories
 */
function log(level, category, message, ...args) {
  if (!DEBUG && level === 'debug') return;
  
  // Maintain an in-memory circular log buffer for debug endpoint
  try {
    if (typeof self.__sw_logs === 'undefined') {
      self.__sw_logs = [];
      self.__sw_logs_max = 200;
    }

    const timestamp = new Date().toISOString();
    const entry = { timestamp, level, category, message: String(message), args };
    self.__sw_logs.push(entry);
    if (self.__sw_logs.length > self.__sw_logs_max) self.__sw_logs.shift();
  } catch (e) {
    // avoid throwing from logger
  }

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
    // If user prefers Scramjet, use the adapter as a UV-compatible implementation.
    if (PREFERRED_PROXY === 'scramjet') {
      log('debug', 'UV', 'Preferred proxy is scramjet — attempting to initialize official ScramjetServiceWorker...');

      // If the official bundle exposed the factory, use it directly
      try {
        if (typeof self.$scramjetLoadWorker === 'function') {
          const workerFactory = self.$scramjetLoadWorker;
          const { ScramjetServiceWorker } = workerFactory();
          proxyInstances.uv = new ScramjetServiceWorker();
          proxyInitialized.ultraviolet = true; // we keep the UV label for compatibility
          log('info', 'UV', '✅ Official ScramjetServiceWorker initialized and mapped to UV proxy');
        } else if (typeof self.ScramjetServiceWorker !== 'undefined') {
          proxyInstances.uv = new self.ScramjetServiceWorker();
          proxyInitialized.ultraviolet = true;
          log('info', 'UV', '✅ ScramjetServiceWorker (global) initialized and mapped to UV proxy');
        } else if (typeof self.ScramjetAdapter !== 'undefined') {
          // Fallback to the local adapter shim if official runtime is not present
          proxyInstances.uv = new self.ScramjetAdapter({ prefix: PROXY_CONFIGS.ultraviolet.prefix });
          proxyInitialized.ultraviolet = true;
          log('info', 'UV', '✅ ScramjetAdapter initialized as UV-compatible proxy (fallback)');
        } else {
          throw new Error('No Scramjet runtime or adapter available');
        }
      } catch (e) {
        throw e;
      }
    } else {
      log('debug', 'UV', 'Loading Ultraviolet scripts...');

      // Enhanced import guards to prevent redefinition errors
      try {
        // Guard against multiple UV bundle imports
        if (typeof UVServiceWorker === 'undefined') {
          try {
            log('debug', 'UV', 'Importing UV bundle...');
            importScripts(PROXY_CONFIGS.ultraviolet.bundle || '/a/bundle.js');
            log('debug', 'UV', 'UV bundle imported successfully');
          } catch (e) { 
            log('warn', 'UV', 'Failed to import UV bundle (ignored):', e && e.message); 
          }
        } else {
          log('debug', 'UV', 'UVServiceWorker already defined; skipping bundle import');
        }

        // Guard against multiple config imports  
        if (typeof self.__uv$config === 'undefined') {
          try {
            log('debug', 'UV', 'Importing UV config...');
            importScripts(PROXY_CONFIGS.ultraviolet.config || '/a/config.js');
            log('debug', 'UV', 'UV config imported successfully');
          } catch (e) { 
            log('warn', 'UV', 'Failed to import UV config (ignored):', e && e.message); 
          }
        } else {
          log('debug', 'UV', '__uv$config already present; skipping config import');
        }
      } catch (e) {
        log('warn', 'UV', 'UV import phase encountered error (continuing):', e && e.message);
      }

      // Wait longer for imported scripts and configs to be ready
      await new Promise(r => setTimeout(r, 150));

      // Verify UV is available
      if (typeof UVServiceWorker !== 'undefined' && typeof self.__uv$config !== 'undefined') {
        try {
          proxyInstances.uv = new UVServiceWorker(self.__uv$config);
          proxyInitialized.ultraviolet = true;
          log('info', 'UV', '✅ Ultraviolet proxy initialized successfully');
        } catch (e) {
          throw new Error('Failed to construct UVServiceWorker: ' + (e && e.message));
        }
      } else {
        throw new Error('UVServiceWorker or config not available');
      }
    }
  } catch (error) {
    log('error', 'UV', '❌ Failed to initialize Ultraviolet:', error.message);
    proxyInitialized.ultraviolet = false;
  }

  // Initialize Dynamic
  try {
    log('debug', 'DY', 'Loading Dynamic scripts...');

    // Enhanced import guards to prevent property redefinition errors
    try {
      // Guard against multiple config imports
      if (typeof self.__dynamic$config === 'undefined') {
        try { 
          log('debug', 'DY', 'Importing Dynamic config...');
          importScripts(PROXY_CONFIGS.dynamic.config || '/dy/config.js'); 
          log('debug','DY','Dynamic config imported successfully'); 
        } catch(e){ 
          log('warn','DY','Failed to import dynamic config (ignored):', e && e.message); 
        }
      } else {
        log('debug','DY','__dynamic$config already present; skipping import');
      }

      // Guard against multiple worker imports
      if (typeof Dynamic === 'undefined') {
        try { 
          log('debug', 'DY', 'Importing Dynamic worker...');
          importScripts(PROXY_CONFIGS.dynamic.worker || '/dy/worker.js'); 
          log('debug','DY','Dynamic worker imported successfully'); 
        } catch(e){ 
          log('warn','DY','Failed to import dynamic worker (ignored):', e && e.message); 
        }
      } else {
        log('debug','DY','Dynamic global already present; skipping worker import');
      }
    } catch(e){ 
      log('warn','DY','Dynamic import phase encountered error (continuing):', e && e.message); 
    }

    // Wait longer for imported scripts to be ready
    await new Promise(r => setTimeout(r, 150));

    // Verify Dynamic is available
    if (typeof Dynamic !== 'undefined' && typeof self.__dynamic$config !== 'undefined') {
      try {
        proxyInstances.dynamic = new Dynamic(self.__dynamic$config);
        self.dynamic = proxyInstances.dynamic;
        proxyInitialized.dynamic = true;
        log('info', 'DY', '✅ Dynamic proxy initialized successfully');
      } catch(e) {
        throw new Error('Failed to construct Dynamic: ' + (e && e.message));
      }
    } else {
      throw new Error('Dynamic or config not available');
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
  // Prefer using runtime.route() when available. This lets Dynamic or Scramjet
  // claim requests even when they use legacy path prefixes.
  // Scramjet beta: if allowed for this request, prefer scramjet routing
  try {
    if (isScramjetAllowed(request)) {
      log('info', 'BETA', `Scramjet beta allowed for ${url.pathname}`);
      // create or reuse scramjet instance
      try {
        if (!proxyInstances.scramjet) {
          if (typeof self.$scramjetLoadWorker === 'function') {
            const { ScramjetServiceWorker } = self.$scramjetLoadWorker();
            proxyInstances.scramjet = new ScramjetServiceWorker();
          } else if (typeof self.ScramjetServiceWorker !== 'undefined') {
            proxyInstances.scramjet = new self.ScramjetServiceWorker();
          } else if (typeof self.ScramjetAdapter !== 'undefined') {
            proxyInstances.scramjet = new self.ScramjetAdapter({ prefix: PROXY_CONFIGS.ultraviolet.prefix });
          }
        }
      } catch (e) { log('warn', 'BETA', 'Failed to initialize scramjet instance:', e && e.message); }

      if (proxyInstances.scramjet && typeof proxyInstances.scramjet.route === 'function' && proxyInstances.scramjet.route({ request })) {
        const reqId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
        log('debug', 'BETA', `Routing to Scramjet beta: ${url.pathname} [req:${reqId}]`);
        try { if (typeof self.__sw_activeRequests === 'undefined') self.__sw_activeRequests = {}; self.__sw_activeRequests[reqId] = { url: url.pathname, proxy: 'scramjet', beta:true, start: Date.now() }; } catch(e){}
        const newHeaders = new Headers(event.request.headers || {});
        newHeaders.set('x-sg-reqid', reqId);
        newHeaders.set('x-sg-beta', 'scramjet');
        const wrappedRequest = new Request(event.request, { headers: newHeaders });

        return (async () => {
          try {
            const response = await proxyInstances.scramjet.fetch({ request: wrappedRequest });
            try { log('info', 'TRACE', `req:${reqId} Scramjet response ${response && response.status} for ${url.pathname}`); } catch (e) {}
            return response;
          } catch (error) {
            log('error', 'BETA', `Scramjet routing failed [req:${reqId}]:`, error && error.message ? error.message : error);
            return createErrorResponse('Scramjet proxy error', String(error && error.message ? error.message : error));
          } finally {
            try { const meta = self.__sw_activeRequests && self.__sw_activeRequests[reqId]; if (meta) { meta.end = Date.now(); meta.duration = meta.end - meta.start; } } catch (e) {}
          }
        })();
      }
    }
  } catch (e) {
    log('warn', 'BETA', 'isScramjetAllowed() check failed:', e && e.message);
  }
  try {
    // If UV runtime exposes a route() function, ask it first
    if (proxyInstances.uv && typeof proxyInstances.uv.route === 'function') {
      if (proxyInstances.uv.route({ request })) {
        // handle as UV
        if (proxyInitialized.ultraviolet) {
          const reqId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
          log('debug', 'UV', `Routing to Ultraviolet via runtime.route(): ${url.pathname} [req:${reqId}]`);

          try {
            if (typeof self.__sw_activeRequests === 'undefined') self.__sw_activeRequests = {};
            self.__sw_activeRequests[reqId] = { url: url.pathname, proxy: 'ultraviolet', start: Date.now() };
          } catch (e) {}

          const newHeaders = new Headers(event.request.headers || {});
          newHeaders.set('x-sg-reqid', reqId);
          const wrappedRequest = new Request(event.request, { headers: newHeaders });

          return (async () => {
            try {
              const response = await proxyInstances.uv.fetch({ request: wrappedRequest });
              try { log('info', 'TRACE', `req:${reqId} UV response ${response && response.status} for ${url.pathname}`); } catch (e) {}
              return response;
            } catch (error) {
              log('error', 'UV', `Ultraviolet routing failed [req:${reqId}]:`, error && error.message ? error.message : error);
              return createErrorResponse('Ultraviolet proxy error', String(error && error.message ? error.message : error));
            } finally {
              try { const meta = self.__sw_activeRequests && self.__sw_activeRequests[reqId]; if (meta) { meta.end = Date.now(); meta.duration = meta.end - meta.start; } } catch (e) {}
            }
          })();
        }
      }
    }
  } catch (e) {
    log('warn', 'ROUTE', 'uv.route() check failed:', e && e.message);
  }

  // If Dynamic runtime exposes a route() function, ask it next
  try {
    if (proxyInstances.dynamic && typeof proxyInstances.dynamic.route === 'function') {
      if (proxyInstances.dynamic.route({ request })) {
        if (proxyInitialized.dynamic) {
          const reqId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
          log('debug', 'DY', `Routing to Dynamic via runtime.route(): ${url.pathname} [req:${reqId}]`);
          try { if (typeof self.__sw_activeRequests === 'undefined') self.__sw_activeRequests = {}; self.__sw_activeRequests[reqId] = { url: url.pathname, proxy: 'dynamic', start: Date.now() }; } catch (e) {}
          const newHeaders = new Headers(event.request.headers || {});
          newHeaders.set('x-sg-reqid', reqId);
          const wrappedRequest = new Request(event.request, { headers: newHeaders });

          return (async () => {
            try {
              const response = await proxyInstances.dynamic.fetch({ request: wrappedRequest });
              try { log('info', 'TRACE', `req:${reqId} Dynamic response ${response && response.status} for ${url.pathname}`); } catch (e) {}
              return response;
            } catch (error) {
              log('error', 'DY', `Dynamic routing failed [req:${reqId}]:`, error && error.message ? error.message : error);
              return createErrorResponse('Dynamic proxy error', String(error && error.message ? error.message : error));
            } finally {
              try { const meta = self.__sw_activeRequests && self.__sw_activeRequests[reqId]; if (meta) { meta.end = Date.now(); meta.duration = meta.end - meta.start; } } catch (e) {}
            }
          })();
        }
      }
    }
  } catch (e) {
    log('warn', 'ROUTE', 'dynamic.route() check failed:', e && e.message);
  }

  // Route to Ultraviolet by prefix as a fallback
  if (url.pathname.startsWith(PROXY_CONFIGS.ultraviolet.prefix)) {
    if (proxyInitialized.ultraviolet && proxyInstances.uv) {
      // Create request id and wrap the request so we can trace it through logs
      const reqId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
      log('debug', 'UV', `Routing to Ultraviolet: ${url.pathname} [req:${reqId}]`);

      try {
        // Track active requests
        try {
          if (typeof self.__sw_activeRequests === 'undefined') self.__sw_activeRequests = {};
          self.__sw_activeRequests[reqId] = { url: url.pathname, proxy: 'ultraviolet', start: Date.now() };
        } catch (e) { /* ignore */ }

        // clone headers and add request id
        const newHeaders = new Headers(event.request.headers || {});
        newHeaders.set('x-sg-reqid', reqId);
        const wrappedRequest = new Request(event.request, { headers: newHeaders });

        // Call UV fetch with wrapped request and log lifecycle
        return (async () => {
          try {
            const response = await proxyInstances.uv.fetch({ request: wrappedRequest });
            try {
              log('info', 'TRACE', `req:${reqId} UV response ${response && response.status} for ${url.pathname}`);
            } catch (e) {}
            return response;
          } catch (error) {
            log('error', 'UV', `Ultraviolet routing failed [req:${reqId}]:`, error && error.message ? error.message : error);
            return createErrorResponse('Ultraviolet proxy error', String(error && error.message ? error.message : error));
          } finally {
            try {
              const meta = self.__sw_activeRequests && self.__sw_activeRequests[reqId];
              if (meta) {
                meta.end = Date.now();
                meta.duration = meta.end - meta.start;
              }
            } catch (e) {}
          }
        })();
      } catch (error) {
        log('error', 'UV', 'Ultraviolet routing setup failed:', error && error.message ? error.message : error);
        return createErrorResponse('Ultraviolet Unavailable', 'Proxy routing failed to initialize');
      }
    } else {
      log('warn', 'UV', 'Ultraviolet not initialized, cannot route request');
      return createErrorResponse('Ultraviolet Unavailable', 'Proxy system not initialized');
    }
  }

  // Route to Dynamic
  if (url.pathname.startsWith(PROXY_CONFIGS.dynamic.prefix)) {
    if (proxyInitialized.dynamic && proxyInstances.dynamic) {
      const reqId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
      log('debug', 'DY', `Routing to Dynamic: ${url.pathname} [req:${reqId}]`);

      try {
        try {
          if (typeof self.__sw_activeRequests === 'undefined') self.__sw_activeRequests = {};
          self.__sw_activeRequests[reqId] = { url: url.pathname, proxy: 'dynamic', start: Date.now() };
        } catch (e) { /* ignore */ }

        const newHeaders = new Headers(event.request.headers || {});
        newHeaders.set('x-sg-reqid', reqId);
        const wrappedRequest = new Request(event.request, { headers: newHeaders });

        return (async () => {
          try {
            const response = await proxyInstances.dynamic.fetch({ request: wrappedRequest });
            try {
              log('info', 'TRACE', `req:${reqId} Dynamic response ${response && response.status} for ${url.pathname}`);
            } catch (e) {}
            return response;
          } catch (error) {
            log('error', 'DY', `Dynamic routing failed [req:${reqId}]:`, error && error.message ? error.message : error);
            return createErrorResponse('Dynamic proxy error', String(error && error.message ? error.message : error));
          } finally {
            try {
              const meta = self.__sw_activeRequests && self.__sw_activeRequests[reqId];
              if (meta) {
                meta.end = Date.now();
                meta.duration = meta.end - meta.start;
              }
            } catch (e) {}
          }
        })();
      } catch (error) {
        log('error', 'DY', 'Dynamic routing setup failed:', error && error.message ? error.message : error);
        return createErrorResponse('Dynamic Unavailable', 'Proxy routing failed to initialize');
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
    // Debug endpoints
    const reqUrl = new URL(event.request.url);
    if (reqUrl.pathname === '/__sw-logs') {
      event.respondWith(new Response(JSON.stringify({
        version: SW_VERSION,
  proxies: proxyInitialized,
        logs: (self.__sw_logs || []).slice(-100)
      }, null, 2), { headers: { 'Content-Type': 'application/json' } }));
      return;
    }

    if (reqUrl.pathname === '/__sw-debug') {
      event.respondWith(new Response(JSON.stringify({
        version: SW_VERSION,
        proxies: proxyInitialized,
        instances: {
          uv: !!proxyInstances.uv,
          dynamic: !!proxyInstances.dynamic,
          scramjet: (typeof self.$scramjetLoadWorker === 'function' || typeof self.ScramjetServiceWorker !== 'undefined')
        }
      }, null, 2), { headers: { 'Content-Type': 'application/json' } }));
      return;
    }

    if (reqUrl.pathname === '/__sw-active') {
      event.respondWith(new Response(JSON.stringify({
        active: self.__sw_activeRequests || {}
      }, null, 2), { headers: { 'Content-Type': 'application/json' } }));
      return;
    }

    // Probe endpoint: diagnostic dry-run to see which proxy would handle a path
    if (reqUrl.pathname === '/__sw-probe') {
      try {
        const target = reqUrl.searchParams.get('path') || reqUrl.searchParams.get('url') || '/';
        const absolute = new URL(target, self.location.origin).href;
        const probeReq = new Request(absolute);

        const result = {
          requestedPath: target,
          absolute,
          proxies: {
            ultraviolet: !!proxyInstances.uv,
            dynamic: !!proxyInstances.dynamic,
            scramjet: !!proxyInstances.scramjet || (typeof self.$scramjetLoadWorker === 'function' || typeof self.ScramjetServiceWorker !== 'undefined')
          },
          routing: {},
          logs: (self.__sw_logs || []).slice(-50)
        };

        // Check scramjet route() presence and result (dry-run)
        try {
          if (proxyInstances.scramjet && typeof proxyInstances.scramjet.route === 'function') {
            result.routing.scramjet_route = Boolean(proxyInstances.scramjet.route({ request: probeReq }));
          } else if (typeof self.Scramjet !== 'undefined' && typeof self.Scramjet.createProxy === 'function') {
            // shim presence - create a temp proxy to check
            try {
              const tmp = self.Scramjet.createProxy({ prefix: PROXY_CONFIGS.ultraviolet.prefix });
              result.routing.scramjet_route = typeof tmp.route === 'function' ? Boolean(tmp.route({ request: probeReq })) : null;
            } catch (e) { result.routing.scramjet_route_error = String(e && e.message || e); }
          } else {
            result.routing.scramjet_route = null;
          }
        } catch (e) { result.routing.scramjet_route_error = String(e && e.message || e); }

        // Check UV proxy route() if available
        try {
          if (proxyInstances.uv && typeof proxyInstances.uv.route === 'function') {
            result.routing.uv_route = Boolean(proxyInstances.uv.route({ request: probeReq }));
          } else {
            result.routing.uv_route = null;
          }
        } catch (e) { result.routing.uv_route_error = String(e && e.message || e); }

        // Check Dynamic proxy route() if available
        try {
          if (proxyInstances.dynamic && typeof proxyInstances.dynamic.route === 'function') {
            result.routing.dynamic_route = Boolean(proxyInstances.dynamic.route({ request: probeReq }));
          } else {
            result.routing.dynamic_route = null;
          }
        } catch (e) { result.routing.dynamic_route_error = String(e && e.message || e); }

        event.respondWith(new Response(JSON.stringify(result, null, 2), { headers: { 'Content-Type': 'application/json' } }));
      } catch (e) {
        event.respondWith(new Response(JSON.stringify({ error: String(e && e.message || e) }, null, 2), { headers: { 'Content-Type': 'application/json' }, status: 500 }));
      }
      return;
    }

    const proxyResponse = routeRequest(event);
    // Fast-path passthrough proxy: if the request carries a ?url= query param and
    // matches a known proxy prefix, perform a direct upstream fetch. This gives a
    // reliable fallback during migration while the full runtime/features are hardened.
    try {
      const q = new URL(event.request.url).searchParams.get('url');
      if (q) {
        const p = reqUrl.pathname;
        if (p.startsWith(PROXY_CONFIGS.ultraviolet.prefix) || p.startsWith('/scramjet/') || p.startsWith(PROXY_CONFIGS.dynamic.prefix)) {
          event.respondWith((async () => {
            const target = q;
            const reqId = `passthrough-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;
            
            log('info', 'FAST-PROXY', `[${reqId}] Starting passthrough proxy to ${target} for ${p}`);
            
            // Enhanced timeout + abort support to avoid hanging the worker
            const controller = new AbortController();
            const timeoutMs = 10000; // 10s timeout for passthrough (increased)
            const timeoutHandle = setTimeout(() => {
              log('warn', 'FAST-PROXY', `[${reqId}] Request timed out after ${timeoutMs}ms`);
              controller.abort();
            }, timeoutMs);

            let upstream;
            try {
              upstream = await fetch(target, {
                method: event.request.method,
                headers: { 
                  'User-Agent': 'SlowGuardian-Proxy/9.0',
                  'X-Requested-With': 'SlowGuardian'
                },
                redirect: 'follow',
                credentials: 'omit',
                signal: controller.signal
              });
              clearTimeout(timeoutHandle);
              log('debug', 'FAST-PROXY', `[${reqId}] Upstream responded with ${upstream.status}`);
            } catch (err) {
              clearTimeout(timeoutHandle);
              // Clear and specific error reporting
              const reason = err && err.name === 'AbortError' ? 'timeout' : (err && err.message ? err.message : String(err));
              log('error', 'FAST-PROXY', `[${reqId}] Passthrough fetch failed: ${reason}`);
              return createErrorResponse('Passthrough Proxy Error', `Failed to reach upstream server: ${reason}`);
            }

            try {
              const body = await upstream.arrayBuffer().catch(() => null);
              const headers = new Headers(upstream.headers || {});
              headers.set('x-sg-passthrough', '1');
              headers.set('x-sg-reqid', reqId);
              
              // Log status for debugging
              if (!upstream.ok) {
                log('warn', 'FAST-PROXY', `[${reqId}] Upstream returned non-OK status ${upstream.status} for ${target}`);
              } else {
                log('debug', 'FAST-PROXY', `[${reqId}] Successfully proxied ${target}`);
              }
              
              return new Response(body, { status: upstream.status, statusText: upstream.statusText, headers });
            } catch (err) {
              log('error', 'FAST-PROXY', `[${reqId}] Failed to build passthrough response:`, err && err.message);
              return createErrorResponse('Passthrough Response Error', `Failed to process upstream response: ${String(err && err.message || err)}`);
            }
          })());
          return;
        }
      }
    } catch (e) {
      log('error', 'FAST-PROXY', 'Passthrough proxy setup failed:', e && e.message);
    }

    // If scramjet is available as a first-class runtime, route with it directly for best fidelity
    try {
      if ((typeof self.$scramjetLoadWorker === 'function' || typeof self.ScramjetServiceWorker !== 'undefined') && PREFERRED_PROXY === 'scramjet') {
        try {
          // create or reuse a scramjet instance mapped to proxyInstances.scramjet
          if (!proxyInstances.scramjet) {
            if (typeof self.$scramjetLoadWorker === 'function') {
              const { ScramjetServiceWorker } = self.$scramjetLoadWorker();
              proxyInstances.scramjet = new ScramjetServiceWorker();
            } else {
              proxyInstances.scramjet = new self.ScramjetServiceWorker();
            }
          }

          // If scramjet wants to handle this fetch event, use it
          if (proxyInstances.scramjet && typeof proxyInstances.scramjet.route === 'function' && proxyInstances.scramjet.route({ request: event.request })) {
            event.respondWith((async () => {
              try {
                await proxyInstances.scramjet.loadConfig?.();
              } catch (e) {}
              return proxyInstances.scramjet.fetch ? proxyInstances.scramjet.fetch({ request: event.request, clientId: event.clientId }) : fetch(event.request);
            })());
            return;
          }
        } catch (e) {
          log('warn', 'SW', 'Scramjet fast-path failed, falling back to legacy routing', e && e.message);
        }
      }
    } catch (e) {
      // non-fatal
    }
    
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
  
  try {
    if (event.data && event.data.type === 'GET_STATUS') {
      const msg = {
        version: SW_VERSION,
        proxies: proxyInitialized,
        timestamp: Date.now()
      };

      // Support either MessageChannel port or direct source.postMessage
      if (event.ports && event.ports[0]) {
        try { event.ports[0].postMessage(msg); } catch (e) { log('warn', 'MSG', 'Failed to postMessage to port', e && e.message); }
      } else if (event.source && typeof event.source.postMessage === 'function') {
        try { event.source.postMessage(msg); } catch (e) { log('warn', 'MSG', 'Failed to postMessage to source', e && e.message); }
      } else {
        log('warn', 'MSG', 'No reply port available for GET_STATUS');
      }
    }
  } catch (e) {
    log('error', 'MSG', 'Message handler error', e && e.message);
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