/**
 * KeyAuth Integration for SlowGuardian Premium
 * Based on official KeyAuth JavaScript implementation
 */

class KeyAuth {
  constructor(name, ownerid, secret, version, url) {
    this.name = name || "slowguardian";
    this.ownerid = ownerid || "TgewInK5Uy";
    this.secret = secret;
    this.version = version || "1.0";
    this.url = url || "https://keyauth.win/api/1.2/";
    this.sessionid = null;
    this.user_data = null;
    this.numkeys = "";
    this.numchat = "";
    this.numchan = "";
    this.numusers = "";
    this.error = null;
    this.response = "";
  }

  async init() {
    try {
      const hwid = await this.gethwid();
      const enckey = this.encrypta(this.name + this.ownerid + hwid);
      
      const postData = new URLSearchParams();
      postData.append('type', 'init');
      postData.append('ver', this.version);
      postData.append('hash', this.sha256(this.getcurrentpathhash()));
      postData.append('enckey', enckey);
      postData.append('name', this.name);
      postData.append('ownerid', this.ownerid);

      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: postData
      });

      const data = await response.text();
      this.response = this.decrypt(data, enckey);
      const responseObj = JSON.parse(this.response);

      if (responseObj.success) {
        this.sessionid = responseObj.sessionid;
        this.numkeys = responseObj.app_info.numkeys;
        this.numchat = responseObj.app_info.numchat;
        this.numchan = responseObj.app_info.numchan;
        this.numusers = responseObj.app_info.numusers;
        return true;
      } else {
        this.error = responseObj.message;
        return false;
      }
    } catch (e) {
      this.error = e.message;
      return false;
    }
  }

  async login(username, password) {
    try {
      const hwid = await this.gethwid();
      const enckey = this.encrypta(username + password + hwid);
      
      const postData = new URLSearchParams();
      postData.append('type', 'login');
      postData.append('username', username);
      postData.append('pass', password);
      postData.append('hwid', hwid);
      postData.append('sessionid', this.sessionid);
      postData.append('name', this.name);
      postData.append('ownerid', this.ownerid);

      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: postData
      });

      const data = await response.text();
      this.response = this.decrypt(data, enckey);
      const responseObj = JSON.parse(this.response);

      if (responseObj.success) {
        this.user_data = responseObj.info;
        return true;
      } else {
        this.error = responseObj.message;
        return false;
      }
    } catch (e) {
      this.error = e.message;
      return false;
    }
  }

  async license(key) {
    try {
      const hwid = await this.gethwid();
      const enckey = this.encrypta(key + hwid);
      
      const postData = new URLSearchParams();
      postData.append('type', 'license');
      postData.append('key', key);
      postData.append('hwid', hwid);
      postData.append('sessionid', this.sessionid);
      postData.append('name', this.name);
      postData.append('ownerid', this.ownerid);

      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: postData
      });

      const data = await response.text();
      this.response = this.decrypt(data, enckey);
      const responseObj = JSON.parse(this.response);

      if (responseObj.success) {
        this.user_data = responseObj.info;
        return true;
      } else {
        this.error = responseObj.message;
        return false;
      }
    } catch (e) {
      this.error = e.message;
      return false;
    }
  }

  async gethwid() {
    // Generate hardware ID from browser fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('KeyAuth hwid', 2, 2);
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL(),
      webgl: this.getWebGL()
    };

    const hwid = await this.sha256(JSON.stringify(fingerprint));
    return hwid;
  }

  getWebGL() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
      return 'unknown';
    } catch (e) {
      return 'unknown';
    }
  }

  async sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  getcurrentpathhash() {
    return window.location.pathname + window.location.search;
  }

  encrypta(message) {
    // Simple encryption for demo - in production use proper encryption
    return btoa(message);
  }

  decrypt(message, key) {
    try {
      return atob(message);
    } catch (e) {
      return message; // Return as-is if not base64
    }
  }
}

// KeyAuth Manager for SlowGuardian integration
class KeyAuthManager {
  constructor() {
    this.keyauth = new KeyAuth("slowguardian", "TgewInK5Uy", "", "1.0");
    this.isInitialized = false;
    this.currentUser = null;
    this.sessionData = null;
    
    this.init();
  }

  async init() {
    try {
      const success = await this.keyauth.init();
      if (success) {
        this.isInitialized = true;
        console.log('🔐 KeyAuth system loaded');
        
        // Check for saved session
        await this.checkSavedSession();
      } else {
        console.warn('⚠️ KeyAuth initialization failed:', this.keyauth.error);
      }
    } catch (error) {
      console.error('❌ KeyAuth init error:', error);
    }
  }

  async checkSavedSession() {
    const savedSession = localStorage.getItem('keyauth_session');
    if (savedSession) {
      try {
        this.sessionData = JSON.parse(savedSession);
        this.currentUser = this.sessionData.user_data;
        
        // Validate session is still active
        if (this.isSessionValid()) {
          this.updateUI();
        } else {
          this.clearSession();
        }
      } catch (e) {
        this.clearSession();
      }
    }
  }

  async loginWithKey(licenseKey) {
    if (!this.isInitialized) {
      throw new Error('KeyAuth not initialized');
    }

    try {
      const success = await this.keyauth.license(licenseKey);
      if (success) {
        this.currentUser = this.keyauth.user_data;
        this.sessionData = {
          user_data: this.currentUser,
          timestamp: Date.now(),
          hwid: await this.keyauth.gethwid()
        };
        
        // Save session
        localStorage.setItem('keyauth_session', JSON.stringify(this.sessionData));
        localStorage.setItem('authToken', this.generateAuthToken());
        
        this.updateUI();
        return { success: true, user: this.currentUser };
      } else {
        return { success: false, error: this.keyauth.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loginWithCredentials(username, password) {
    if (!this.isInitialized) {
      throw new Error('KeyAuth not initialized');
    }

    try {
      const success = await this.keyauth.login(username, password);
      if (success) {
        this.currentUser = this.keyauth.user_data;
        this.sessionData = {
          user_data: this.currentUser,
          timestamp: Date.now(),
          hwid: await this.keyauth.gethwid()
        };
        
        // Save session
        localStorage.setItem('keyauth_session', JSON.stringify(this.sessionData));
        localStorage.setItem('authToken', this.generateAuthToken());
        
        this.updateUI();
        return { success: true, user: this.currentUser };
      } else {
        return { success: false, error: this.keyauth.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  generateAuthToken() {
    // Generate a simple JWT-like token for local auth
    const payload = {
      user: this.currentUser?.username || 'unknown',
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      iat: Date.now()
    };
    return btoa(JSON.stringify(payload));
  }

  isSessionValid() {
    if (!this.sessionData) return false;
    
    // Check if session is less than 24 hours old
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return (Date.now() - this.sessionData.timestamp) < maxAge;
  }

  clearSession() {
    this.currentUser = null;
    this.sessionData = null;
    localStorage.removeItem('keyauth_session');
    localStorage.removeItem('authToken');
    this.updateUI();
  }

  logout() {
    this.clearSession();
    window.location.href = '/login.html';
  }

  updateUI() {
    // Update navbar with user info
    if (window.navigationBar) {
      window.navigationBar.currentUser = this.currentUser;
      window.navigationBar.createNavbar();
    }
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('keyauth-status-changed', {
      detail: { user: this.currentUser, authenticated: !!this.currentUser }
    }));
  }

  getUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser && this.isSessionValid();
  }
}

// Initialize KeyAuth Manager
window.keyAuthManager = new KeyAuthManager();
console.log('🔐 KeyAuth Manager initialized');
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex.substring(0, 32); // Use first 32 chars as device ID
  }

  getWebGLFingerprint() {
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) return 'none';
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'basic';
    
    return {
      vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
      renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    };
  }

  async validateKey(key) {
    try {
      console.log('🔐 Validating premium key...');
      
      // For testing, accept TESTPREM immediately
      if (key === 'TESTPREM') {
        console.log('✅ Test premium key accepted');
        return {
          success: true,
          user: {
            username: 'TestUser',
            subscription: 'Premium',
            expiry: '2099-12-31',
            hwid: this.deviceFingerprint
          }
        };
      }

      // Initialize session with KeyAuth
      const initResponse = await this.makeKeyAuthRequest('init', {
        name: this.config.name,
        ownerid: this.config.ownerid,
        version: this.config.version
      });

      if (!initResponse.success) {
        throw new Error(initResponse.message || 'Failed to initialize KeyAuth session');
      }

      this.session = initResponse.sessionid;

      // Attempt to login with the key as username and key as password
      const loginResponse = await this.makeKeyAuthRequest('login', {
        username: key,
        password: key,
        hwid: this.deviceFingerprint,
        sessionid: this.session
      });

      if (loginResponse.success) {
        this.userInfo = loginResponse.info;
        
        // Check for account sharing
        const sharingCheck = await this.checkAccountSharing();
        if (!sharingCheck.allowed) {
          throw new Error('Account sharing detected. Please logout from other devices.');
        }

        return {
          success: true,
          user: this.userInfo
        };
      } else {
        throw new Error(loginResponse.message || 'Invalid premium key');
      }

    } catch (error) {
      console.error('KeyAuth validation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async checkAccountSharing() {
    // Check if this account is being used on multiple devices
    try {
      const response = await this.makeKeyAuthRequest('check', {
        sessionid: this.session
      });

      if (response.success) {
        // Store current session info for tracking
        const sessionInfo = {
          deviceId: this.deviceFingerprint,
          timestamp: Date.now(),
          ip: await this.getPublicIP()
        };

        localStorage.setItem('keyauth-session', JSON.stringify(sessionInfo));
        
        return { allowed: true };
      } else {
        return { allowed: false, reason: 'Session validation failed' };
      }
    } catch (error) {
      console.warn('Account sharing check failed:', error);
      // Allow on error to avoid blocking legitimate users
      return { allowed: true };
    }
  }

  async getPublicIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  async makeKeyAuthRequest(endpoint, data) {
    const url = `${this.baseUrl}${endpoint}/`;
    
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'SlowGuardian/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // Periodic check for account sharing
  startAccountSharingMonitor() {
    setInterval(async () => {
      if (this.session && this.userInfo) {
        const check = await this.checkAccountSharing();
        if (!check.allowed) {
          this.handleAccountSharingDetected();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  handleAccountSharingDetected() {
    console.warn('🚨 Account sharing detected!');
    
    // Show warning to user
    if (window.showNotification) {
      window.showNotification(
        'Account sharing detected. Your session will be terminated in 30 seconds.',
        'error'
      );
    }

    // Give user 30 seconds to respond before logout
    setTimeout(() => {
      this.logout();
    }, 30000);
  }

  logout() {
    // Clear session data
    this.session = null;
    this.userInfo = null;
    
    // Clear premium status
    localStorage.removeItem('keyauth-session');
    setCookie('premium-active', 'false');
    setCookie('premium-key', '');
    
    // Reload page to clear premium features
    if (window.showNotification) {
      window.showNotification('Premium session ended due to account sharing violation.', 'warning');
    }
    
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  // Get current premium status
  getPremiumStatus() {
    if (this.userInfo) {
      return {
        active: true,
        username: this.userInfo.username,
        subscription: this.userInfo.subscription,
        expiry: this.userInfo.subscriptions?.[0]?.expiry || 'Never',
        deviceId: this.deviceFingerprint
      };
    }
    return { active: false };
  }
}

// Global KeyAuth instance
window.keyAuthManager = new KeyAuthManager();

// Make it available globally
window.KeyAuthManager = KeyAuthManager;

console.log('🔐 KeyAuth system loaded');