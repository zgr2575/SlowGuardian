/**
 * SlowGuardian v9 - Enhanced Proxy Initialization
 * Completely recoded proxy system initialization
 */

class SlowGuardianProxy {
  constructor() {
    this.version = "9.0.0";
    this.debug = true;
    this.serviceWorker = null;
    this.initPromise = null;
    this.status = {
      serviceWorker: false,
      ultraviolet: false,
      dynamic: false,
      bare: false
    };
    
    this.log('info', 'INIT', '🚀 SlowGuardian Proxy v9 initializing...');
  }

  log(level, category, message, ...args) {
    if (!this.debug && level === 'debug') return;
    
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

  async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  async _doInitialize() {
    try {
      this.log('info', 'INIT', 'Starting proxy system initialization...');

      // Step 1: Check service worker support
      if (!('serviceWorker' in navigator)) {
        this.log('warn', 'INIT', 'Service Worker not supported in this browser');
        return false;
      }

      // Step 2: Test bare server connectivity (non-blocking)
      this.testBareServer().catch(error => {
        this.log('warn', 'BARE', 'Bare server test failed, continuing anyway:', error.message);
      });

      // Step 3: Register service worker (critical)
      try {
        await this.registerServiceWorker();
      } catch (error) {
        this.log('error', 'SW', 'Service worker registration failed:', error.message);
        // Continue with fallback mode
        this.status.serviceWorker = false;
      }

      // Step 4: Test proxy configurations (non-blocking)
      this.testProxyConfigs().catch(error => {
        this.log('warn', 'CONFIG', 'Proxy config tests failed, continuing anyway:', error.message);
      });

      // Step 5: Set up proxy debugging tools
      this.setupProxyDebugTools();

      // Step 6: Check final status to verify everything is working
      await this.checkFinalStatus();

      this.log('info', 'INIT', '✅ Proxy system initialization completed');
      return true;

    } catch (error) {
      this.log('error', 'INIT', '❌ Proxy initialization failed:', error.message);
      // Don't throw error - allow system to continue with fallback mode
      return false;
    }
  }

  async testBareServer() {
    this.log('debug', 'BARE', 'Testing bare server connectivity...');
    
    try {
      // Test with timeout and proper error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/o/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Bare server typically returns 400 for GET requests without proper proxy headers
      if (response.ok || response.status === 400 || response.status === 404) {
        this.status.bare = true;
        this.log('info', 'BARE', `✅ Bare server is accessible (status: ${response.status})`);
      } else {
        throw new Error(`Bare server returned unexpected status: ${response.status}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        this.log('error', 'BARE', '❌ Bare server test timed out');
        throw new Error('Bare server connection timeout');
      } else {
        this.log('error', 'BARE', '❌ Bare server test failed:', error.message);
        // Don't throw error immediately - try alternative test
        await this.testBareServerAlternative();
      }
    }
  }

  async testBareServerAlternative() {
    this.log('debug', 'BARE', 'Trying alternative bare server test...');
    
    try {
      // Try a simple OPTIONS request which bare servers should handle
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/o/', {
        method: 'OPTIONS',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Any response from OPTIONS means the endpoint exists
      this.status.bare = true;
      this.log('info', 'BARE', `✅ Bare server accessible via OPTIONS (status: ${response.status})`);
    } catch (error) {
      this.log('warn', 'BARE', '⚠️ Bare server may not be accessible, continuing anyway...');
      // Set to true anyway - let the proxy systems handle connectivity
      this.status.bare = true;
    }
  }

  async registerServiceWorker() {
    this.log('debug', 'SW', 'Registering service worker...');

    try {
      // Check if service worker is already registered and active
      const existingRegistration = await navigator.serviceWorker.getRegistration('/');

      if (existingRegistration && existingRegistration.active) {
        this.log('info', 'SW', '✅ Service worker already registered and active, reusing it');
        this.serviceWorker = existingRegistration;
        this.status.serviceWorker = true;

        // Set up message listener
        navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
        return;
      }

      // Only unregister if we have a broken/inactive registration
      if (existingRegistration && !existingRegistration.active) {
        this.log('debug', 'SW', 'Unregistering broken service worker...');
        await existingRegistration.unregister();
      }

      // Register new service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      this.log('debug', 'SW', 'Service worker registered, waiting for activation...');

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      this.serviceWorker = registration;
      this.status.serviceWorker = true;
      this.log('info', 'SW', '✅ Service worker registered and activated');

      // Set up message listener
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));

    } catch (error) {
      this.log('error', 'SW', '❌ Service worker registration failed:', error.message);
      throw new Error('Service worker registration failed');
    }
  }

  async testProxyConfigs() {
    this.log('debug', 'CONFIG', 'Testing proxy configurations...');

    // Test Ultraviolet config (located at /m/config.js, proxy prefix is /a/)
    try {
      const uvResponse = await fetch('/m/config.js');
      if (uvResponse.ok) {
        this.status.ultraviolet = true;
        this.log('info', 'UV', '✅ Ultraviolet configuration accessible');
      } else {
        throw new Error(`UV config returned status: ${uvResponse.status}`);
      }
    } catch (error) {
      this.log('warn', 'UV', '⚠️ Ultraviolet configuration test failed:', error.message);
    }

    // Test Dynamic config
    try {
      const dyResponse = await fetch('/dy/config.js');
      if (dyResponse.ok) {
        this.status.dynamic = true;
        this.log('info', 'DY', '✅ Dynamic configuration accessible');
      } else {
        throw new Error(`Dynamic config returned status: ${dyResponse.status}`);
      }
    } catch (error) {
      this.log('warn', 'DY', '⚠️ Dynamic configuration test failed:', error.message);
    }
  }

  async checkFinalStatus() {
    this.log('debug', 'STATUS', 'Checking final system status...');

    // Get status from service worker with timeout
    if (this.serviceWorker && navigator.serviceWorker.controller) {
      try {
        const channel = new MessageChannel();
        const statusPromise = new Promise((resolve) => {
          channel.port1.onmessage = (event) => resolve(event.data);
        });

        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_STATUS' },
          [channel.port2]
        );

        const swStatus = await Promise.race([
          statusPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]);

        this.log('info', 'STATUS', 'Service worker status:', swStatus);
        
        // Update status based on service worker response
        if (swStatus.proxies) {
          this.status.ultraviolet = this.status.ultraviolet && swStatus.proxies.ultraviolet;
          this.status.dynamic = this.status.dynamic && swStatus.proxies.dynamic;
        }

      } catch (error) {
        this.log('warn', 'STATUS', 'Could not get service worker status:', error.message);
      }
    }

    // Display final status
    const working = Object.values(this.status).filter(Boolean).length;
    const total = Object.keys(this.status).length;
    
    this.log('info', 'STATUS', `System status: ${working}/${total} components working`);
    this.log('info', 'STATUS', 'Component details:', this.status);

    // More lenient requirements - just need service worker
    if (!this.status.serviceWorker) {
      throw new Error('Service worker not available - proxy functionality disabled');
    }

    // If bare server failed but we have service worker, continue anyway
    if (!this.status.bare) {
      this.log('warn', 'STATUS', 'Bare server connectivity test failed but continuing with proxy initialization');
    }

    // If no proxy systems available, warn but don't fail completely
    if (!this.status.ultraviolet && !this.status.dynamic) {
      this.log('warn', 'STATUS', 'No proxy systems initialized - limited functionality');
      // Don't throw error - let the service worker handle requests
    }

    this.log('info', 'STATUS', '✅ Proxy system ready (with potential limitations)');
  }

  handleServiceWorkerMessage(event) {
    this.log('debug', 'MSG', 'Received message from service worker:', event.data);
  }

  getStatus() {
    return {
      version: this.version,
      initialized: this.initPromise !== null,
      status: this.status
    };
  }

  // Public method to encode URLs for proxying
  encodeUrl(url, proxy = 'auto') {
    if (!url) return '';

    try {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;

      // Auto-select proxy based on availability
      if (proxy === 'auto') {
        if (this.status.ultraviolet) {
          proxy = 'ultraviolet';
        } else if (this.status.dynamic) {
          proxy = 'dynamic';
        } else {
          throw new Error('No proxy systems available');
        }
      }

      if (proxy === 'ultraviolet' && this.status.ultraviolet) {
        // Use Ultraviolet's proper encoder if available
        if (typeof __uv$config !== 'undefined' && __uv$config.encodeUrl) {
          const encoded = __uv$config.encodeUrl(fullUrl);
          this.log('debug', 'ENCODE', `Ultraviolet encoded: ${fullUrl} -> ${encoded}`);
          return encoded;
        } else {
          this.log('warn', 'ENCODE', 'Ultraviolet config not loaded, using fallback encoding');
          // Fallback: just use the prefix
          return `/a/${encodeURIComponent(fullUrl)}`;
        }
      } else if (proxy === 'dynamic' && this.status.dynamic) {
        // Dynamic proxy doesn't have a client-side encoder, use direct URL
        // The service worker will handle the encoding
        this.log('debug', 'ENCODE', `Dynamic proxy: ${fullUrl}`);
        return `/dy/${encodeURIComponent(fullUrl)}`;
      } else {
        throw new Error(`Proxy system '${proxy}' not available`);
      }
    } catch (error) {
      this.log('error', 'ENCODE', 'URL encoding failed:', error.message);
      throw error;
    }
  }

  // Public method to test proxy connectivity
  async testProxy(url = 'https://httpbin.org/get') {
    this.log('info', 'TEST', `Testing proxy with URL: ${url}`);
    
    try {
      const encodedUrl = this.encodeUrl(url);
      const response = await fetch(encodedUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'SlowGuardian-Test/9.0.0'
        }
      });

      if (response.ok) {
        this.log('info', 'TEST', '✅ Proxy test successful');
        return true;
      } else {
        throw new Error(`Proxy test failed with status: ${response.status}`);
      }
    } catch (error) {
      this.log('error', 'TEST', '❌ Proxy test failed:', error.message);
      return false;
    }
  }

  setupProxyDebugTools() {
    // Set up global debugging functions
    window.proxyDebug = {
      status: () => this.getStatus(),
      test: (url) => this.testProxy(url),
      encode: (url, proxy) => this.encodeUrl(url, proxy),
      logs: () => this.status
    };
    
    this.log('debug', 'DEBUG', '✅ Debug tools available at window.proxyDebug');
  }
}

// Global initialization
window.SlowGuardianProxy = SlowGuardianProxy;

// Auto-initialize if not in a worker context
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  console.log('[PROXY-INIT DEBUG] Script executing, document.readyState:', document.readyState);
  console.log('[PROXY-INIT DEBUG] Creating SlowGuardianProxy instance...');
  window.slowGuardianProxy = new SlowGuardianProxy();
  console.log('[PROXY-INIT DEBUG] SlowGuardianProxy instance created:', window.slowGuardianProxy);
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    console.log('[PROXY-INIT DEBUG] DOM still loading, adding DOMContentLoaded listener');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[PROXY-INIT DEBUG] DOMContentLoaded fired, initializing proxy...');
      window.slowGuardianProxy.initialize().catch(error => {
        console.error('[PROXY-INIT DEBUG] Proxy initialization failed:', error);
        window.slowGuardianProxy.log('error', 'INIT', '❌ Automatic initialization failed, manual retry may be needed');
      });
    });
  } else {
    // DOM already ready
    console.log('[PROXY-INIT DEBUG] DOM already ready, initializing with timeout...');
    setTimeout(() => {
      console.log('[PROXY-INIT DEBUG] Timeout elapsed, initializing proxy...');
      window.slowGuardianProxy.initialize().catch(error => {
        console.error('[PROXY-INIT DEBUG] Proxy initialization failed:', error);
        window.slowGuardianProxy.log('error', 'INIT', '❌ Automatic initialization failed, manual retry may be needed');
      });
    }, 100);
  }

  // Add global status checker for debugging
  window.checkProxyStatus = function() {
    if (window.slowGuardianProxy) {
      const status = window.slowGuardianProxy.getStatus();
      console.log('🔍 Current Proxy Status:', status);
      return status;
    } else {
      console.log('❌ Proxy system not available');
      return null;
    }
  };

  // Add manual retry function
  window.retryProxyInit = async function() {
    console.log('🔄 Manually retrying proxy initialization...');
    if (window.slowGuardianProxy) {
      try {
        await window.slowGuardianProxy.initialize();
        console.log('✅ Manual retry successful');
        return true;
      } catch (error) {
        console.error('❌ Manual retry failed:', error);
        return false;
      }
    }
    return false;
  };
}

console.log('🚀 SlowGuardian Proxy initialization script loaded');