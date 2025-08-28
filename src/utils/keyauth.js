/**
 * KeyAuth API Integration for SlowGuardian
 * Handles authentication through KeyAuth service
 */

import fetch from 'node-fetch';
import { Logger } from './logger.js';

const logger = new Logger('KeyAuth');

class KeyAuthAPI {
  constructor(config = {}) {
    this.name = config.name || 'SlowGuardian';
    this.ownerId = config.ownerId || '';
    this.secret = config.secret || '';
    this.version = config.version || '1.0';
    this.baseUrl = 'https://keyauth.win/api/1.2/';
    this.sessionId = null;
    this.initialized = false;
  }

  /**
   * Initialize the KeyAuth application
   */
  async init() {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          type: 'init',
          name: this.name,
          ownerid: this.ownerId,
          secret: this.secret,
          ver: this.version
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.sessionId = data.sessionid;
        this.initialized = true;
        logger.info('KeyAuth initialized successfully');
        return { success: true, data };
      } else {
        logger.error('KeyAuth initialization failed:', data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      logger.error('KeyAuth initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Login user with username and password
   */
  async login(username, password) {
    if (!this.initialized) {
      const initResult = await this.init();
      if (!initResult.success) {
        return initResult;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          type: 'login',
          username: username,
          pass: password,
          sessionid: this.sessionId,
          name: this.name,
          ownerid: this.ownerId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        logger.info(`User ${username} logged in successfully`);
        return { 
          success: true, 
          user: {
            username: data.info.username,
            email: data.info.email,
            expires: data.info.subscriptions?.[0]?.expiry,
            rank: data.info.subscriptions?.[0]?.subscription,
            ip: data.info.ip,
            hwid: data.info.hwid,
            createdate: data.info.createdate,
            lastlogin: data.info.lastlogin
          }
        };
      } else {
        logger.warn(`Login failed for ${username}:`, data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      logger.error('KeyAuth login error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Register new user
   */
  async register(username, password, email, license = null) {
    if (!this.initialized) {
      const initResult = await this.init();
      if (!initResult.success) {
        return initResult;
      }
    }

    try {
      const body = new URLSearchParams({
        type: 'register',
        username: username,
        pass: password,
        email: email,
        sessionid: this.sessionId,
        name: this.name,
        ownerid: this.ownerId
      });

      if (license) {
        body.append('key', license);
      }

      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body
      });

      const data = await response.json();
      
      if (data.success) {
        logger.info(`User ${username} registered successfully`);
        return { success: true, message: 'Registration successful' };
      } else {
        logger.warn(`Registration failed for ${username}:`, data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      logger.error('KeyAuth registration error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate license key
   */
  async license(key) {
    if (!this.initialized) {
      const initResult = await this.init();
      if (!initResult.success) {
        return initResult;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          type: 'license',
          key: key,
          sessionid: this.sessionId,
          name: this.name,
          ownerid: this.ownerId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        logger.info(`License key validated successfully`);
        return { 
          success: true, 
          license: {
            key: key,
            note: data.info.note,
            level: data.info.level,
            expires: data.info.expires,
            status: data.info.status
          }
        };
      } else {
        logger.warn(`License validation failed:`, data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      logger.error('KeyAuth license validation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get application information
   */
  async getAppInfo() {
    if (!this.initialized) {
      const initResult = await this.init();
      if (!initResult.success) {
        return initResult;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          type: 'fetchOnline',
          sessionid: this.sessionId,
          name: this.name,
          ownerid: this.ownerId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return { 
          success: true, 
          info: {
            onlineUsers: data.onlineUsers || [],
            userCount: data.onlineUsers?.length || 0
          }
        };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      logger.error('KeyAuth app info error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log user activity
   */
  async log(username, action) {
    if (!this.initialized) return;

    try {
      await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          type: 'log',
          pcuser: username,
          message: action,
          sessionid: this.sessionId,
          name: this.name,
          ownerid: this.ownerId
        })
      });
    } catch (error) {
      logger.error('KeyAuth logging error:', error);
    }
  }
}

export { KeyAuthAPI };