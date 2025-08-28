/**
 * Admin API Routes - Developer Mode Features
 * Provides administrative endpoints for user management and site control
 */

import { Router } from "express";
import { adminAuth, adminStore } from "../middleware/admin.js";
import { Logger } from "../utils/logger.js";

const router = Router();
const logger = new Logger("AdminAPI");

// Admin authentication endpoint
router.post("/auth", (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const admin = adminStore.verifyAdmin(username, password);
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create a basic auth token
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    
    res.json({
      success: true,
      token,
      admin: {
        id: admin.adminId,
        role: admin.role
      }
    });
  } catch (error) {
    logger.error("Admin auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Global pause/unpause endpoints
router.post("/pause", adminAuth, (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: "Pause password required" });
    }

    adminStore.pauseGlobally(password);
    
    res.json({
      success: true,
      message: "Site globally paused",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Global pause error:", error);
    res.status(500).json({ error: "Failed to pause site" });
  }
});

router.post("/unpause", (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: "Password required" });
    }

    if (!adminStore.verifyPausePassword(password)) {
      return res.status(401).json({ error: "Invalid pause password" });
    }

    adminStore.unpauseGlobally();
    
    // Redirect to home page after successful unpause
    res.redirect('/');
  } catch (error) {
    logger.error("Global unpause error:", error);
    res.status(500).json({ error: "Failed to unpause site" });
  }
});

router.get("/pause/status", adminAuth, (req, res) => {
  res.json({
    isPaused: adminStore.isGloballyPaused(),
    timestamp: new Date().toISOString()
  });
});

// User session management
router.get("/sessions", adminAuth, (req, res) => {
  try {
    const onlineUsers = adminStore.getOnlineUsers();
    
    res.json({
      success: true,
      users: onlineUsers,
      count: onlineUsers.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Get sessions error:", error);
    res.status(500).json({ error: "Failed to get user sessions" });
  }
});

// User management
router.post("/users/:userId/block", adminAuth, (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const success = adminStore.blockUser(userId, reason);
    
    if (success) {
      res.json({
        success: true,
        message: `User ${userId} blocked`,
        reason
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    logger.error("Block user error:", error);
    res.status(500).json({ error: "Failed to block user" });
  }
});

router.post("/users/:userId/unblock", adminAuth, (req, res) => {
  try {
    const { userId } = req.params;
    
    const success = adminStore.unblockUser(userId);
    
    if (success) {
      res.json({
        success: true,
        message: `User ${userId} unblocked`
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    logger.error("Unblock user error:", error);
    res.status(500).json({ error: "Failed to unblock user" });
  }
});

// Website blocking for specific users
router.get("/users/:userId/blocked-sites", adminAuth, (req, res) => {
  try {
    const { userId } = req.params;
    const blockedSites = adminStore.getBlockedSitesForUser(userId);
    
    res.json({
      success: true,
      userId,
      blockedSites,
      count: blockedSites.length
    });
  } catch (error) {
    logger.error("Get blocked sites error:", error);
    res.status(500).json({ error: "Failed to get blocked sites" });
  }
});

router.post("/users/:userId/block-site", adminAuth, (req, res) => {
  try {
    const { userId } = req.params;
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({ error: "Domain required" });
    }

    adminStore.blockSiteForUser(userId, domain);
    
    res.json({
      success: true,
      message: `Domain ${domain} blocked for user ${userId}`,
      userId,
      domain
    });
  } catch (error) {
    logger.error("Block site error:", error);
    res.status(500).json({ error: "Failed to block site" });
  }
});

router.post("/users/:userId/unblock-site", adminAuth, (req, res) => {
  try {
    const { userId } = req.params;
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({ error: "Domain required" });
    }

    adminStore.unblockSiteForUser(userId, domain);
    
    res.json({
      success: true,
      message: `Domain ${domain} unblocked for user ${userId}`,
      userId,
      domain
    });
  } catch (error) {
    logger.error("Unblock site error:", error);
    res.status(500).json({ error: "Failed to unblock site" });
  }
});

// Account management
router.get("/accounts", adminAuth, (req, res) => {
  try {
    const admins = adminStore.getAdmins();
    
    res.json({
      success: true,
      admins,
      count: admins.length
    });
  } catch (error) {
    logger.error("Get accounts error:", error);
    res.status(500).json({ error: "Failed to get admin accounts" });
  }
});

router.post("/accounts", adminAuth, (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // Check if requesting admin has super_admin role for creating admins
    if (req.admin.role !== 'super_admin' && role === 'super_admin') {
      return res.status(403).json({ error: "Insufficient permissions to create super admin" });
    }

    const adminId = adminStore.addAdmin(username, password, role || 'admin');
    
    res.json({
      success: true,
      message: "Admin account created",
      adminId,
      username,
      role: role || 'admin'
    });
  } catch (error) {
    logger.error("Create account error:", error);
    res.status(500).json({ error: "Failed to create admin account" });
  }
});

router.delete("/accounts/:adminId", adminAuth, (req, res) => {
  try {
    const { adminId } = req.params;
    
    // Prevent deleting own account
    if (adminId === req.admin.adminId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    // Check permissions for super admin deletion
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const success = adminStore.removeAdmin(adminId);
    
    if (success) {
      res.json({
        success: true,
        message: "Admin account deleted",
        adminId
      });
    } else {
      res.status(404).json({ error: "Admin account not found" });
    }
  } catch (error) {
    logger.error("Delete account error:", error);
    res.status(500).json({ error: "Failed to delete admin account" });
  }
});

// System statistics
router.get("/stats", adminAuth, (req, res) => {
  try {
    const onlineUsers = adminStore.getOnlineUsers();
    const admins = adminStore.getAdmins();
    const memoryUsage = process.memoryUsage();
    
    res.json({
      success: true,
      onlineUsers: onlineUsers.length,
      activeSessions: onlineUsers.length, // Same as online users for now
      blockedUsers: 0, // TODO: Implement user blocking tracking
      uptime: process.uptime(),
      memoryUsageMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      totalRequests: adminStore.getTotalRequests?.() || 0,
      totalAdmins: admins.length,
      isPaused: adminStore.isGloballyPaused(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Get stats error:", error);
    res.status(500).json({ error: "Failed to get system statistics" });
  }
});

export default router;