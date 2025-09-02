/**
 * Multi-Proxy System for SlowGuardian
 * Supports multiple proxy backends for improved reliability and stealth
 */

class MultiProxySystem {
  constructor() {
    this.proxies = {
      ultraviolet: {
        name: 'Ultraviolet',
        prefix: '/a/',
        enabled: true,
        primary: true,
        stealth: true
      },
      dynamic: {
        name: 'Dynamic',
        prefix: '/dy/',
        enabled: true,
        primary: false,
        stealth: true
      },
      rammerhead: {
        name: 'Rammerhead',
        prefix: '/rh/',
        enabled: false,
        primary: false,
        stealth: true
      },
      epoxy: {
        name: 'Epoxy',
        prefix: '/ep/',
        enabled: false,
        primary: false,
        stealth: true
      },
      libcurl: {
        name: 'LibCurl',
        prefix: '/lc/',
        enabled: false,
        primary: false,
        stealth: true
      }
    };
    
    this.failoverQueue = [];
    this.currentProxy = 'ultraviolet';
    this.lastFailures = new Map();
    this.maxRetries = 3;
    
    this.init();
  }
  
  init() {
    console.log('🔄 Multi-Proxy System initializing...');
    
    // Check which proxies are available
    this.detectAvailableProxies();
    
    // Set up automatic failover
    this.setupFailoverSystem();
    
    // Load user preferences
    this.loadProxyPreferences();
    
    console.log('✅ Multi-Proxy System ready');
  }
  
  detectAvailableProxies() {
    // Check if proxy service workers are available
    const checks = [
      { name: 'ultraviolet', path: '/a/sw.js' },
      { name: 'dynamic', path: '/dy/worker.js' },
      { name: 'rammerhead', path: '/rh/sw.js' },
      { name: 'epoxy', path: '/ep/sw.js' },
      { name: 'libcurl', path: '/lc/sw.js' }
    ];
    
    checks.forEach(check => {
      fetch(check.path, { method: 'HEAD' })
        .then(response => {
          this.proxies[check.name].enabled = response.ok;
          if (response.ok) {
            console.log(`✅ ${check.name} proxy available`);
          }
        })
        .catch(() => {
          this.proxies[check.name].enabled = false;
          console.log(`❌ ${check.name} proxy unavailable`);
        });
    });
  }
  
  setupFailoverSystem() {
    // Build failover queue from enabled proxies
    this.failoverQueue = Object.keys(this.proxies)
      .filter(key => this.proxies[key].enabled)
      .sort((a, b) => {
        // Primary proxies first, then by stealth capability
        if (this.proxies[a].primary && !this.proxies[b].primary) return -1;
        if (!this.proxies[a].primary && this.proxies[b].primary) return 1;
        if (this.proxies[a].stealth && !this.proxies[b].stealth) return -1;
        if (!this.proxies[a].stealth && this.proxies[b].stealth) return 1;
        return 0;
      });
      
    console.log('🎯 Failover queue:', this.failoverQueue);
  }
  
  loadProxyPreferences() {
    const savedProxy = localStorage.getItem('preferred-proxy');
    if (savedProxy && this.proxies[savedProxy] && this.proxies[savedProxy].enabled) {
      this.currentProxy = savedProxy;
    }
    
    const stealthMode = localStorage.getItem('stealth-mode') === 'true';
    if (stealthMode) {
      this.enableStealthMode();
    }
  }
  
  enableStealthMode() {
    console.log('🔒 Stealth mode enabled');
    
    // Prefer stealth-capable proxies
    this.failoverQueue = this.failoverQueue.filter(proxy => this.proxies[proxy].stealth);
    
    // Apply stealth configurations
    this.applyStealthConfigurations();
  }
  
  applyStealthConfigurations() {
    // Randomize proxy selection to avoid patterns
    if (Math.random() > 0.7) {
      const stealthProxies = this.failoverQueue.filter(p => this.proxies[p].stealth);
      if (stealthProxies.length > 1) {
        this.currentProxy = stealthProxies[Math.floor(Math.random() * stealthProxies.length)];
      }
    }
    
    // Apply custom headers and configurations
    this.injectStealthHeaders();
  }
  
  injectStealthHeaders() {
    // Override fetch to add stealth headers
    const originalFetch = window.fetch;
    window.fetch = function(input, init = {}) {
      init.headers = {
        ...init.headers,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Dest': 'document'
      };
      return originalFetch(input, init);
    };
  }
  
  encodeUrl(url, proxy = null) {
    const selectedProxy = proxy || this.currentProxy;
    const proxyConfig = this.proxies[selectedProxy];
    
    if (!proxyConfig || !proxyConfig.enabled) {
      return this.failover(url);
    }
    
    switch (selectedProxy) {
      case 'ultraviolet':
        return this.encodeForUV(url);
      case 'dynamic':
        return this.encodeForDynamic(url);
      case 'rammerhead':
        return this.encodeForRammerhead(url);
      case 'epoxy':
        return this.encodeForEpoxy(url);
      case 'libcurl':
        return this.encodeForLibCurl(url);
      default:
        return this.encodeForUV(url); // Fallback
    }
  }
  
  encodeForUV(url) {
    // Use enhanced stealth encoding
    const encoded = btoa(encodeURIComponent(url))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    return `/a/${encoded}`;
  }
  
  encodeForDynamic(url) {
    const encoded = btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return `/dy/q/${encoded}`;
  }
  
  encodeForRammerhead(url) {
    // Rammerhead uses session-based encoding
    const sessionId = this.getRammerheadSession();
    return `/rh/${sessionId}/${btoa(url)}`;
  }
  
  encodeForEpoxy(url) {
    return `/ep/${encodeURIComponent(url)}`;
  }
  
  encodeForLibCurl(url) {
    return `/lc/${encodeURIComponent(url)}`;
  }
  
  getRammerheadSession() {
    let session = sessionStorage.getItem('rh-session');
    if (!session) {
      session = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('rh-session', session);
    }
    return session;
  }
  
  failover(url) {
    console.log(`🔄 Initiating failover for ${this.currentProxy}`);
    
    // Mark current proxy as failed
    this.markProxyFailed(this.currentProxy);
    
    // Find next available proxy
    const nextProxy = this.getNextAvailableProxy();
    if (nextProxy) {
      console.log(`🎯 Switching to ${nextProxy}`);
      this.currentProxy = nextProxy;
      return this.encodeUrl(url, nextProxy);
    }
    
    // No proxies available
    console.error('❌ All proxies failed');
    return null;
  }
  
  markProxyFailed(proxy) {
    const now = Date.now();
    const failures = this.lastFailures.get(proxy) || [];
    failures.push(now);
    
    // Keep only recent failures (last 5 minutes)
    const recentFailures = failures.filter(time => now - time < 300000);
    this.lastFailures.set(proxy, recentFailures);
    
    // Disable proxy if too many recent failures
    if (recentFailures.length >= this.maxRetries) {
      this.proxies[proxy].enabled = false;
      console.warn(`⚠️ Proxy ${proxy} disabled due to repeated failures`);
    }
  }
  
  getNextAvailableProxy() {
    const available = this.failoverQueue.filter(proxy => 
      this.proxies[proxy].enabled && proxy !== this.currentProxy
    );
    
    return available.length > 0 ? available[0] : null;
  }
  
  getProxyStatus() {
    return {
      current: this.currentProxy,
      available: this.failoverQueue.filter(p => this.proxies[p].enabled),
      failed: Array.from(this.lastFailures.keys()),
      proxies: this.proxies
    };
  }
  
  setPreferredProxy(proxy) {
    if (this.proxies[proxy] && this.proxies[proxy].enabled) {
      this.currentProxy = proxy;
      localStorage.setItem('preferred-proxy', proxy);
      console.log(`✅ Preferred proxy set to ${proxy}`);
    }
  }
}

// Initialize the multi-proxy system
window.multiProxy = new MultiProxySystem();

// Export for modules
if (typeof module !== 'undefined') {
  module.exports = MultiProxySystem;
}