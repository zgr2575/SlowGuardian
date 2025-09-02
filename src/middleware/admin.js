/**
 * Admin Middleware - Developer Mode Features
 * Handles user sessions, blocking, and administrative controls
 */

import { Logger } from "../utils/logger.js";

const logger = new Logger("Admin");

// In-memory storage for development (in production, use a proper database)
class AdminStore {
  constructor() {
    this.sessions = new Map(); // userId -> session info
    this.users = new Map(); // userId -> user data
    this.blockedSites = new Map(); // userId -> Set of blocked domains
    this.globalPause = false;
    this.globalPausePassword = null;
    this.adminCredentials = new Map(); // adminId -> { username, password }

    // Initialize with default admin if none exists
    this.initializeDefaultAdmin();
  }

  initializeDefaultAdmin() {
    // Use config settings for default admin if available
    if (
      global.config &&
      global.config.developerMode &&
      global.config.developerMode.defaultAdminCredentials
    ) {
      const { username, password } =
        global.config.developerMode.defaultAdminCredentials;
      this.adminCredentials.set("admin", {
        username,
        password,
        role: "super_admin",
      });
    } else {
      // Fallback default admin account (should be changed in production)
      this.adminCredentials.set("admin", {
        username: "admin",
        password: "SlowGuardian2024!", // Change this in production
        role: "super_admin",
      });
    }
  }

  // Session Management
  addSession(sessionId, userData) {
    this.sessions.set(sessionId, {
      ...userData,
      lastSeen: new Date(),
      isOnline: true,
    });

    // Also store user data
    this.users.set(userData.userId, userData);
    logger.info(`User session added: ${userData.userId}`);
  }

  updateSession(sessionId, updates) {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates, { lastSeen: new Date() });
      this.sessions.set(sessionId, session);
    }
  }

  removeSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isOnline = false;
      this.sessions.set(sessionId, session);
      logger.info(`User session removed: ${session.userId}`);
    }
  }

  getOnlineUsers() {
    const onlineUsers = [];
    for (const [sessionId, session] of this.sessions) {
      if (
        session.isOnline &&
        Date.now() - session.lastSeen.getTime() < 5 * 60 * 1000
      ) {
        // 5 minutes timeout
        onlineUsers.push({
          sessionId,
          userId: session.userId,
          username: session.username || "Anonymous",
          ip: session.primaryIP || session.ip, // Prioritize primaryIP for IP-based tracking
          originalIP: session.ipInfo?.originalIP || session.ip,
          forwardedFor: session.ipInfo?.forwardedFor,
          realIP: session.ipInfo?.realIP,
          cfConnectingIP: session.ipInfo?.cfConnectingIP,
          userAgent: session.userAgent,
          lastSeen: session.lastSeen,
          joinedAt: session.joinedAt,
        });
      }
    }
    return onlineUsers;
  }

  // User Management
  blockUser(userId, reason = "Blocked by admin") {
    const user = this.users.get(userId);
    if (user) {
      user.isBlocked = true;
      user.blockReason = reason;
      user.blockedAt = new Date();
      this.users.set(userId, user);
      logger.info(`User blocked: ${userId} - ${reason}`);
      return true;
    }
    return false;
  }

  unblockUser(userId) {
    const user = this.users.get(userId);
    if (user) {
      user.isBlocked = false;
      delete user.blockReason;
      delete user.blockedAt;
      this.users.set(userId, user);
      logger.info(`User unblocked: ${userId}`);
      return true;
    }
    return false;
  }

  isUserBlocked(userId) {
    const user = this.users.get(userId);
    return user && user.isBlocked;
  }

  // Website Blocking
  blockSiteForUser(userId, domain) {
    if (!this.blockedSites.has(userId)) {
      this.blockedSites.set(userId, new Set());
    }
    this.blockedSites.get(userId).add(domain);
    logger.info(`Site blocked for user ${userId}: ${domain}`);
  }

  unblockSiteForUser(userId, domain) {
    if (this.blockedSites.has(userId)) {
      this.blockedSites.get(userId).delete(domain);
      logger.info(`Site unblocked for user ${userId}: ${domain}`);
    }
  }

  isSiteBlockedForUser(userId, domain) {
    if (!this.blockedSites.has(userId)) return false;
    return this.blockedSites.get(userId).has(domain);
  }

  getBlockedSitesForUser(userId) {
    return this.blockedSites.get(userId)
      ? Array.from(this.blockedSites.get(userId))
      : [];
  }

  // Global Pause
  pauseGlobally(password) {
    this.globalPause = true;
    this.globalPausePassword = password;
    logger.info("Global pause activated");
  }

  unpauseGlobally() {
    this.globalPause = false;
    this.globalPausePassword = null;
    logger.info("Global pause deactivated");
  }

  isGloballyPaused() {
    return this.globalPause;
  }

  verifyPausePassword(password) {
    return this.globalPausePassword === password;
  }

  // Admin Authentication
  verifyAdmin(username, password) {
    for (const [adminId, creds] of this.adminCredentials) {
      if (creds.username === username && creds.password === password) {
        return { adminId, role: creds.role };
      }
    }
    return null;
  }

  addAdmin(username, password, role = "admin") {
    const adminId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.adminCredentials.set(adminId, { username, password, role });
    logger.info(`Admin account created: ${username}`);
    return adminId;
  }

  removeAdmin(adminId) {
    if (this.adminCredentials.delete(adminId)) {
      logger.info(`Admin account removed: ${adminId}`);
      return true;
    }
    return false;
  }

  getAdmins() {
    const admins = [];
    for (const [adminId, creds] of this.adminCredentials) {
      admins.push({
        adminId,
        username: creds.username,
        role: creds.role,
      });
    }
    return admins;
  }
}

// Global admin store instance
const adminStore = new AdminStore();

/**
 * Middleware to track user sessions using IP-based identification
 */
export function sessionTracker(req, res, next) {
  // Use IP address as primary session identifier for developer commands
  const clientIP =
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : "127.0.0.1");

  // Create a more robust IP-based session ID
  const userAgent = req.headers["user-agent"] || "";
  const sessionId = `ip_${clientIP}_${userAgent.slice(0, 50).replace(/[^a-zA-Z0-9]/g, "_")}`;

  // Update session with detailed IP tracking info
  const userData = {
    userId: sessionId,
    primaryIP: clientIP,
    ip: clientIP, // Keep for backward compatibility
    userAgent: userAgent,
    joinedAt: new Date(),
    // Additional IP tracking details for developer commands
    ipInfo: {
      originalIP: clientIP,
      forwardedFor: req.headers["x-forwarded-for"] || null,
      realIP: req.headers["x-real-ip"] || null,
      cfConnectingIP: req.headers["cf-connecting-ip"] || null,
    },
  };

  adminStore.addSession(sessionId, userData);

  // Add IP tracking headers to response for developer debugging
  res.setHeader("X-Session-ID", sessionId);
  res.setHeader("X-Client-IP", clientIP);

  req.sessionId = sessionId;
  req.clientIP = clientIP;
  req.adminStore = adminStore;

  next();
}

/**
 * Middleware to check if user is blocked
 */
export function blockingEnforcer(req, res, next) {
  if (req.sessionId && adminStore.isUserBlocked(req.sessionId)) {
    return res.status(403).json({
      error: "Access Denied",
      message: "Your access has been restricted by an administrator.",
      type: "user_blocked",
    });
  }
  next();
}

/**
 * Middleware to check global pause
 */
export function pauseEnforcer(req, res, next) {
  // Skip pause for admin endpoints
  if (req.path.startsWith("/api/admin")) {
    return next();
  }

  if (adminStore.isGloballyPaused()) {
    // Serve the pause page
    return res.status(503).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>This site can't be reached</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
          }
          .error-container {
            max-width: 600px;
            margin: 50px auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .error-icon {
            font-size: 48px;
            margin-bottom: 20px;
          }
          h1 {
            color: #d93025;
            font-size: 24px;
            margin-bottom: 10px;
          }
          .error-code {
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
          }
          .password-form {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 4px;
          }
          .form-input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 10px;
          }
          .btn {
            background: #1a73e8;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
          }
          .btn:hover {
            background: #1557b0;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <div class="error-icon">🛡️</div>
          <h1>SlowGuardian is temporarily paused</h1>
          <div class="error-code">ERR_MAINTENANCE_MODE</div>
          <p>The administrator has temporarily disabled access to prevent potential blocking attempts.</p>
          <p>If you are an administrator, enter the pause password below to continue:</p>
          
          <div class="password-form">
            <form method="POST" action="/api/admin/unpause">
              <input type="password" name="password" placeholder="Enter pause password" class="form-input" required>
              <button type="submit" class="btn">Continue to SlowGuardian</button>
            </form>
          </div>
        </div>
      </body>
      </html>
    `);
  }
  next();
}

/**
 * Middleware to check website blocking for specific users
 */
export function websiteBlockingEnforcer(req, res, next) {
  if (req.sessionId && req.path.startsWith("/a/")) {
    // Extract domain from proxy URL
    const encodedUrl = req.path.substring(3); // Remove '/a/'
    try {
      // Decode the UV-encoded URL to get the actual domain
      const decodedUrl = decodeURIComponent(encodedUrl);
      const domain = new URL(decodedUrl).hostname;

      if (adminStore.isSiteBlockedForUser(req.sessionId, domain)) {
        return res.status(403).json({
          error: "Website Blocked",
          message: `Access to ${domain} has been restricted for your account.`,
          type: "site_blocked",
          domain,
        });
      }
    } catch (error) {
      // If URL parsing fails, continue (don't block due to parsing errors)
      logger.warn(
        `Failed to parse proxy URL for blocking check: ${encodedUrl}`
      );
    }
  }
  next();
}

/**
 * Middleware to verify admin authentication
 */
export function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Admin authentication required" });
  }

  try {
    const token = authHeader.substring(7); // Remove 'Bearer '
    const decoded = Buffer.from(token, "base64").toString();
    const [username, password] = decoded.split(":");

    const admin = adminStore.verifyAdmin(username, password);
    if (!admin) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    req.admin = admin;
    req.adminStore = adminStore;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid authentication token" });
  }
}

export { adminStore };
