/**
 * Modern Authentication Middleware for SlowGuardian
 * Handles MongoDB-based authentication and session management
 */

import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import sessionManager from "../auth/sessionManager.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger("AuthMiddleware");

/**
 * Rate limiting for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: process.env.NODE_ENV === 'production' || process.env.AUTH_RATE_LIMIT === 'true' ? 50 : Number.MAX_SAFE_INTEGER,
  message: { error: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  // Only rate-limit POST /api/auth/login and /api/auth/register
  skip: (req) => {
    const isProdOrForced = process.env.NODE_ENV === 'production' || process.env.AUTH_RATE_LIMIT === 'true';
    if (!isProdOrForced) return true; // disabled outside production unless forced
    const p = (req.baseUrl || '') + (req.path || '');
    const isAuthLogin = req.method === 'POST' && p.endsWith('/login');
    const isAuthRegister = req.method === 'POST' && p.endsWith('/register');
    return !(isAuthLogin || isAuthRegister);
  },
});

/**
 * Rate limiting for general API endpoints
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Validation rules for registration
 */
export const validateRegistration = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Username can only contain letters, numbers, underscores, and hyphens"),
  
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  
  body("firstName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("First name must be less than 50 characters"),
  
  body("lastName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Last name must be less than 50 characters"),
];

/**
 * Validation rules for login
 */
export const validateLogin = [
  body("usernameOrEmail")
    .trim()
    .notEmpty()
    .withMessage("Username or email is required"),
  
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

/**
 * Validation rules for premium key activation
 */
export const validatePremiumKey = [
  body("premiumKey")
    .trim()
    .notEmpty()
    .withMessage("Premium key is required")
    .isLength({ min: 6 })
    .withMessage("Premium key must be at least 6 characters"),
];

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

/**
 * Authentication middleware - verifies JWT tokens
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access token required",
      });
    }

    const validation = await sessionManager.validateSession(token);
    
    if (!validation.isValid) {
      return res.status(401).json({
        success: false,
        error: validation.error || "Invalid token",
      });
    }

    // Attach user info to request
    req.user = validation.session;
    
    // Update session metadata
    await sessionManager.updateSessionMetadata(validation.session.sessionId, {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    next();
  } catch (error) {
    logger.error("Token authentication error:", error);
    return res.status(500).json({
      success: false,
      error: "Authentication failed",
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const validation = await sessionManager.validateSession(token);
      if (validation.isValid) {
        req.user = validation.session;
        
        // Update session metadata
        await sessionManager.updateSessionMetadata(validation.session.sessionId, {
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Require premium access
 */
export const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  if (!req.user.isPremium) {
    return res.status(403).json({
      success: false,
      error: "Premium access required",
    });
  }

  next();
};

/**
 * Require admin access
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Admin access required",
    });
  }

  next();
};

/**
 * Check if user owns resource or is admin
 */
export const requireOwnershipOrAdmin = (userIdField = "userId") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (req.user.role === "admin" || req.user.userId.toString() === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: "Access denied",
    });
  };
};

/**
 * Setup enhanced authentication middleware
 */
export function setupEnhancedAuth(app) {
  logger.info("Setting up enhanced MongoDB authentication...");

  // Apply rate limiting to auth endpoints
  app.use("/api/auth", authRateLimit);
  app.use("/api", apiRateLimit);

  // Security headers for authentication
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });

  logger.info("Enhanced authentication middleware configured");
}

/**
 * Legacy authentication check for backward compatibility
 */
export const legacyAuthCheck = (req, res, next) => {
  // Check for old-style basic auth if no JWT token provided
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Basic ")) {
    // Handle legacy basic auth
    try {
      const credentials = Buffer.from(authHeader.split(" ")[1], "base64").toString();
      const [username, password] = credentials.split(":");

      // For legacy compatibility, we'll accept certain hardcoded credentials
      const config = global.config || {};
      if (config.users && config.users[username] === password) {
        req.user = {
          username,
          role: "user",
          isLegacy: true,
        };
        return next();
      }
    } catch (error) {
      logger.error("Legacy auth error:", error);
    }

    return res.status(401).json({
      success: false,
      error: "Invalid credentials",
    });
  }

  next();
};