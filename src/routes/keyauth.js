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

    const result = await keyauth.login(username, password);

    if (result.success) {
      // Create session token
      const sessionToken = Buffer.from(
        JSON.stringify({
          username: result.user.username,
          loginTime: Date.now(),
          expires: result.user.expires,
        })
      ).toString("base64");

      // Log the login
      await keyauth.log(username, "Logged into SlowGuardian");

      res.json({
        success: true,
        token: sessionToken,
        user: result.user,
        message: "Login successful",
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

    res.json({
      success: true,
      valid: true,
      session: {
        username: sessionData.username,
        loginTime: sessionData.loginTime,
        expires: sessionData.expires,
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

export default router;
