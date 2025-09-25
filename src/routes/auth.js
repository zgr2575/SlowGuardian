/**
 * Authentication Routes for SlowGuardian
 * Handles user registration, login, logout, and premium activation
 */

import { Router } from "express";
import { ObjectId } from "mongodb";
import User from "../models/User.js";
import sessionManager from "../auth/sessionManager.js";
import {
  validateRegistration,
  validateLogin,
  validatePremiumKey,
  handleValidationErrors,
  authenticateToken,
  requireAdmin,
} from "../auth/middleware.js";
import { Logger } from "../utils/logger.js";

const router = Router();
const logger = new Logger("AuthRoutes");

/**
 * User Registration
 */
router.post("/register", validateRegistration, handleValidationErrors, async (req, res) => {
  try {
  const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findByUsername(username) || await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User already exists with this username or email",
      });
    }

    // Create new user
    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
    });

    await user.save();

    // Create session for new user
    const session = await sessionManager.createSession(user);

    logger.info(`New user registered: ${username}`);

    // Set auth cookie so server recognizes authenticated user on subsequent page loads
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Codespaces uses HTTPS; ensure cookie is sent
      sameSite: 'None', // allow across navigations reliably
      path: '/',
      expires: new Date(session.expiresAt),
    };
    res.cookie('sg_auth', session.token, cookieOptions);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: user.toJSON(),
      token: session.token,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration failed",
      details: error.message,
    });
  }
});

/**
 * User Login
 */
router.post("/login", validateLogin, handleValidationErrors, async (req, res) => {
  try {
  const { usernameOrEmail, password, rememberMe } = req.body;

    // Authenticate user
    const authResult = await User.authenticate(usernameOrEmail, password);
    
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        error: authResult.error,
      });
    }

    // Create session
    const session = await sessionManager.createSession(authResult.user);

    // Extend session if "remember me" is checked
    if (rememberMe) {
      await sessionManager.extendSession(session.sessionId, 30 * 24 * 60 * 60 * 1000); // 30 days
    }

    logger.info(`User logged in: ${authResult.user.username}`);

    // Set auth cookie so server recognizes authenticated user on subsequent page loads
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/',
      // If rememberMe, persist for 30 days; otherwise session cookie via no maxAge (but we'll set to expiresAt for consistency)
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined,
      expires: new Date(session.expiresAt),
    };
    res.cookie('sg_auth', session.token, cookieOptions);

    res.json({
      success: true,
      message: "Login successful",
      user: authResult.user.toJSON(),
      token: session.token,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
});

/**
 * User Logout
 */
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const sessionId = req.user.sessionId;
    
    await sessionManager.destroySession(sessionId);

    logger.info(`User logged out: ${req.user.username}`);

  // Clear auth cookie
  res.clearCookie('sg_auth', { path: '/', sameSite: 'None', secure: true });
  // Clear legacy premium cookies to avoid stale UI state
  res.clearCookie('premium-active', { path: '/', sameSite: 'Lax' });
  res.clearCookie('premium-key', { path: '/', sameSite: 'Lax' });

  res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    logger.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Logout failed",
    });
  }
});

/**
 * Logout from all devices
 */
router.post("/logout-all", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const destroyedCount = await sessionManager.destroyUserSessions(userId);

    logger.info(`User logged out from all devices: ${req.user.username}`);

  // Clear auth cookie
  res.clearCookie('sg_auth', { path: '/', sameSite: 'None', secure: true });
  // Clear legacy premium cookies to avoid stale UI state
  res.clearCookie('premium-active', { path: '/', sameSite: 'Lax' });
  res.clearCookie('premium-key', { path: '/', sameSite: 'Lax' });

  res.json({
      success: true,
      message: `Logged out from ${destroyedCount} devices`,
    });
  } catch (error) {
    logger.error("Logout all error:", error);
    res.status(500).json({
      success: false,
      error: "Logout failed",
    });
  }
});

/**
 * Get current user profile
 */
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
    });
  }
});

/**
 * Update user profile
 */
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const { firstName, lastName, preferences } = req.body;

    if (firstName !== undefined) {
      user.firstName = firstName;
    }
    if (lastName !== undefined) {
      user.lastName = lastName;
    }
    if (preferences !== undefined) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    logger.info(`Profile updated: ${user.username}`);

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
});

/**
 * Activate Premium with Key
 */
router.post("/activate-premium", authenticateToken, validatePremiumKey, handleValidationErrors, async (req, res) => {
  try {
    const { premiumKey } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check for valid premium keys
    const validKeys = {
      "TESTPREM": { months: 1, type: "test" },
      "PREMIUM1M": { months: 1, type: "monthly" },
      "PREMIUM1Y": { months: 12, type: "yearly" },
      // Add more keys as needed
    };

    const keyInfo = validKeys[premiumKey.toUpperCase()];
    if (!keyInfo) {
      return res.status(400).json({
        success: false,
        error: "Invalid premium key",
      });
    }

    // Activate premium
    const result = await user.activatePremium(premiumKey, keyInfo.months);

    // Update all active sessions for this user to reflect premium immediately
    try {
      const collection = (await import("../database/connection.js")).default.getCollection("sessions");
      await collection.updateMany(
        { userId: new ObjectId(user._id) },
        { $set: { isPremium: true, lastActivity: new Date() } }
      );
    } catch (e) {
      logger.warn("Failed to update sessions for premium flag:", e.message);
    }

    logger.info(`Premium activated for user: ${user.username} with key: ${premiumKey}`);

    res.json({
      success: true,
      message: "Premium activated successfully!",
      premiumStatus: user.premiumStatus,
      keyType: keyInfo.type,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    logger.error("Premium activation error:", error);
    
    if (error.message.includes("already used")) {
      return res.status(409).json({
        success: false,
        error: "Premium key has already been used",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to activate premium",
    });
  }
});

/**
 * Check Premium Status
 */
router.get("/premium-status", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const isActive = user.isActivePremium();
    
    res.json({
      success: true,
      isPremium: isActive,
      premiumStatus: user.premiumStatus,
    });
  } catch (error) {
    logger.error("Premium status check error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check premium status",
    });
  }
});

/**
 * Change Password
 */
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 8 characters long",
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    // Update password
    user.password = await user.hashPassword(newPassword);
    await user.save();

    // Destroy all sessions except current one
    await sessionManager.destroyUserSessions(req.user.userId);
    await sessionManager.createSession(user); // Create new session

    logger.info(`Password changed for user: ${user.username}`);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    logger.error("Password change error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to change password",
    });
  }
});

/**
 * Get user sessions
 */
router.get("/sessions", authenticateToken, async (req, res) => {
  try {
    const sessions = await sessionManager.getUserSessions(req.user.userId);

    res.json({
      success: true,
      sessions: sessions.map(session => ({
        sessionId: session._id,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        isCurrent: session._id.toString() === req.user.sessionId.toString(),
      })),
    });
  } catch (error) {
    logger.error("Sessions fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch sessions",
    });
  }
});

/**
 * Destroy specific session
 */
router.delete("/sessions/:sessionId", authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Don't allow destroying current session this way
    if (sessionId === req.user.sessionId.toString()) {
      return res.status(400).json({
        success: false,
        error: "Cannot destroy current session. Use logout instead.",
      });
    }

    const destroyed = await sessionManager.destroySession(sessionId);

    if (destroyed) {
      res.json({
        success: true,
        message: "Session destroyed successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }
  } catch (error) {
    logger.error("Session destroy error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to destroy session",
    });
  }
});

/**
 * Validate token endpoint
 */
router.post("/validate", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Token is required",
      });
    }

    const validation = await sessionManager.validateSession(token);

    // If valid, set the auth cookie so subsequent page loads are recognized by the server
    if (validation.isValid && validation.session) {
      res.cookie('sg_auth', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
      });
    }

    res.json({
      success: validation.isValid,
      valid: validation.isValid,
      session: validation.session || null,
      error: validation.error || null,
    });
  } catch (error) {
    logger.error("Token validation error:", error);
    res.status(500).json({
      success: false,
      error: "Token validation failed",
    });
  }
});

/**
 * Admin Routes
 */

/**
 * Get all users (admin only)
 */
router.get("/admin/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const users = await User.findAll(limit, skip);
    const totalUsers = await User.count();

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    logger.error("Admin users fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
});

/**
 * Get session statistics (admin only)
 */
router.get("/admin/session-stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await sessionManager.getSessionStats();

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error("Session stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch session statistics",
    });
  }
});

export default router;