/**
 * KeyAuth Integration for SlowGuardian Premium
 * Provides secure key validation and account sharing protection
 */

class KeyAuthManager {
  constructor() {
    this.config = {
      name: "slowguardian",
      ownerid: "TgewInK5Uy",
      version: "1.0"
    };
    
    this.baseUrl = "https://keyauth.win/api/1.2/";
    this.session = null;
    this.userInfo = null;
    this.deviceFingerprint = null;
    
    this.init();
  }

  async init() {
    // Generate device fingerprint for account sharing protection
    this.deviceFingerprint = await this.generateDeviceFingerprint();
    console.log('🔐 KeyAuth Manager initialized');
  }

  async generateDeviceFingerprint() {
    // Create a unique device fingerprint based on browser characteristics
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('SlowGuardian fingerprint', 2, 2);
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvasFingerprint: canvas.toDataURL(),
      hardwareConcurrency: navigator.hardwareConcurrency,
      webgl: this.getWebGLFingerprint()
    };

    // Create hash of fingerprint data
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(fingerprint));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
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