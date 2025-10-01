/**
 * KeyAuth API Routes for SlowGuardian
 * Handles authentication through KeyAuth service
 */

import { Router } from "express";
import { KeyAuthAPI } from "../utils/keyauth.js";
import { Logger } from "../utils/logger.js";

const router = Router();
const logger = new Logger("KeyAuthAPI");

// Initialize KeyAuth instance
let keyauth = null;

// Initialize KeyAuth if enabled
export function initializeKeyAuth(config) {
  if (config.keyauth?.enabled) {
    keyauth = new KeyAuthAPI({
      name: config.keyauth.name,
      ownerId: config.keyauth.ownerId,
      secret: config.keyauth.secret,
      version: config.keyauth.version,
    });

    // Initialize the connection
    keyauth.init().then((result) => {
      if (result.success) {
        logger.info("KeyAuth initialized successfully");
      } else {
        logger.error("Failed to initialize KeyAuth:", result.error);
      }
    });
  }
}

// Middleware to check if KeyAuth is enabled
const checkKeyAuthEnabled = (req, res, next) => {
  if (!keyauth) {
    return res.status(503).json({
      success: false,
      error: "KeyAuth authentication is not enabled",
    });
  }
  next();
};

// Login endpoint
router.post("/login", checkKeyAuthEnabled, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required",
      });
    }

    // Get client IP and User-Agent for anti-sharing protection
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'] || '';
    const deviceFingerprint = Buffer.from(`${clientIP}:${userAgent}`).toString('base64');

    const result = await keyauth.login(username, password);

    if (result.success) {
      // Account sharing protection: Check for concurrent sessions from different IPs
      const existingSessions = global.activeSessions || new Map();
      const userSessions = existingSessions.get(username) || [];
      
      // Allow maximum 2 concurrent sessions from different IPs
      const uniqueIPs = new Set(userSessions.map(session => session.ip));
      const differentIP = !userSessions.some(session => session.ip === clientIP);
      
      if (differentIP && uniqueIPs.size >= 2) {
        logger.warn(`Account sharing detected for user ${username}: ${uniqueIPs.size + 1} different IPs`);
        return res.status(429).json({
          success: false,
          error: "Account sharing detected. Maximum 2 concurrent sessions from different locations allowed.",
        });
      }

      // Create session token with anti-sharing data
      const sessionToken = Buffer.from(
        JSON.stringify({
          username: result.user.username,
          loginTime: Date.now(),
          expires: result.user.expires,
          ip: clientIP,
          deviceFingerprint,
          sessionId: Math.random().toString(36).substr(2, 9),
        })
      ).toString("base64");

      // Track active session
      const sessionData = { 
        ip: clientIP, 
        deviceFingerprint, 
        loginTime: Date.now(),
        userAgent: userAgent.substring(0, 100) // Truncate for storage
      };
      
      if (!global.activeSessions) global.activeSessions = new Map();
      const updatedSessions = userSessions.filter(s => Date.now() - s.loginTime < 24 * 60 * 60 * 1000); // Keep only last 24h
      updatedSessions.push(sessionData);
      global.activeSessions.set(username, updatedSessions);

      // Log the login with IP info
      await keyauth.log(username, `Logged into SlowGuardian from ${clientIP}`);

      res.json({
        success: true,
        token: sessionToken,
        user: result.user,
        message: "Login successful",
        sessionInfo: {
          activeSessions: updatedSessions.length,
          maxSessions: 2
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    logger.error("KeyAuth login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Register endpoint
router.post("/register", checkKeyAuthEnabled, async (req, res) => {
  try {
    const { username, password, email, license } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        error: "Username, password, and email are required",
      });
    }

    const result = await keyauth.register(username, password, email, license);

    if (result.success) {
      // Log the registration
      await keyauth.log(username, "Registered for SlowGuardian");

      res.json({
        success: true,
        message: result.message || "Registration successful",
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    logger.error("KeyAuth registration error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// License validation endpoint
router.post("/license", checkKeyAuthEnabled, async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        error: "License key is required",
      });
    }

    const result = await keyauth.license(key);

    if (result.success) {
      // Create session token for license users
      const sessionToken = Buffer.from(
        JSON.stringify({
          licenseKey: key,
          loginTime: Date.now(),
          expires: result.license.expires,
          level: result.license.level,
        })
      ).toString("base64");

      res.json({
        success: true,
        token: sessionToken,
        license: result.license,
        message: "License validated successfully",
      });
    } else {
      res.status(401).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    logger.error("KeyAuth license validation error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Validate session endpoint
router.post("/validate", checkKeyAuthEnabled, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Session token is required",
      });
    }

    // Decode and validate token
    const sessionData = JSON.parse(Buffer.from(token, "base64").toString());
    const now = Date.now();
    
    // Get current client info for validation
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'] || '';
    const currentFingerprint = Buffer.from(`${clientIP}:${userAgent}`).toString('base64');

    // Check if session has expired
    if (sessionData.expires && now > new Date(sessionData.expires).getTime()) {
      return res.status(401).json({
        success: false,
        error: "Session has expired",
      });
    }

    // Check session timeout
    const config = global.config;
    if (
      now - sessionData.loginTime >
      (config?.keyauth?.sessionTimeout || 24 * 60 * 60 * 1000)
    ) {
      return res.status(401).json({
        success: false,
        error: "Session timeout",
      });
    }

    // Account sharing protection: Verify IP and device consistency
    if (sessionData.ip && sessionData.deviceFingerprint) {
      const ipChanged = sessionData.ip !== clientIP;
      const deviceChanged = sessionData.deviceFingerprint !== currentFingerprint;
      
      // Allow some flexibility but flag suspicious activity
      if (ipChanged && deviceChanged) {
        logger.warn(`Suspicious session validation for ${sessionData.username}: IP changed from ${sessionData.ip} to ${clientIP} and device fingerprint changed`);
        
        // Invalidate session if both IP and device changed (likely account sharing)
        return res.status(401).json({
          success: false,
          error: "Session invalidated due to security concerns. Please log in again.",
        });
      }
      
      // Log IP changes for monitoring
      if (ipChanged) {
        logger.info(`IP change detected for ${sessionData.username}: ${sessionData.ip} -> ${clientIP}`);
      }
    }

    res.json({
      success: true,
      valid: true,
      session: {
        username: sessionData.username,
        loginTime: sessionData.loginTime,
        expires: sessionData.expires,
        ipMatch: sessionData.ip === clientIP,
        deviceMatch: sessionData.deviceFingerprint === currentFingerprint
      },
    });
  } catch (error) {
    logger.error("Session validation error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid session token",
    });
  }
});

// Get application info endpoint
router.get("/info", checkKeyAuthEnabled, async (req, res) => {
  try {
    const result = await keyauth.getAppInfo();

    if (result.success) {
      res.json({
        success: true,
        info: result.info,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    logger.error("KeyAuth app info error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Logout endpoint
router.post("/logout", checkKeyAuthEnabled, async (req, res) => {
  try {
    const { token } = req.body;

    if (token) {
      try {
        const sessionData = JSON.parse(Buffer.from(token, "base64").toString());
        if (sessionData.username) {
          await keyauth.log(sessionData.username, "Logged out of SlowGuardian");
          
          // Remove session from active sessions tracking
          if (global.activeSessions && sessionData.sessionId) {
            const userSessions = global.activeSessions.get(sessionData.username) || [];
            const updatedSessions = userSessions.filter(s => s.sessionId !== sessionData.sessionId);
            if (updatedSessions.length > 0) {
              global.activeSessions.set(sessionData.username, updatedSessions);
            } else {
              global.activeSessions.delete(sessionData.username);
            }
          }
        }
      } catch (error) {
        // Ignore token parsing errors for logout
      }
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error("KeyAuth logout error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Session monitoring endpoint for account sharing detection
router.get("/sessions", checkKeyAuthEnabled, async (req, res) => {
  try {
    const { token } = req.headers.authorization?.split(' ')[1] ? { token: req.headers.authorization.split(' ')[1] } : req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Session token is required",
      });
    }

    const sessionData = JSON.parse(Buffer.from(token, "base64").toString());
    const username = sessionData.username;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: "Invalid session token",
      });
    }

    // Get user's active sessions
    const activeSessions = global.activeSessions?.get(username) || [];
    const currentTime = Date.now();
    
    // Filter out expired sessions (older than 24 hours)
    const validSessions = activeSessions.filter(session => 
      currentTime - session.loginTime < 24 * 60 * 60 * 1000
    );

    // Update the stored sessions
    if (validSessions.length !== activeSessions.length) {
      if (validSessions.length > 0) {
        global.activeSessions.set(username, validSessions);
      } else {
        global.activeSessions.delete(username);
      }
    }

    // Prepare session info for response (remove sensitive data)
    const sessionInfo = validSessions.map(session => ({
      loginTime: session.loginTime,
      ip: session.ip,
      location: session.ip, // Could be enhanced with IP geolocation
      device: session.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
      browser: session.userAgent.split(' ')[0]
    }));

    res.json({
      success: true,
      username,
      totalSessions: sessionInfo.length,
      maxAllowed: 2,
      sessions: sessionInfo,
      accountSharingDetected: sessionInfo.length > 2
    });

  } catch (error) {
    logger.error("Session monitoring error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
