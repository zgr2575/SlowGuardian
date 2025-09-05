/**
 * Startup Authentication Middleware
 * Requires authentication on startup for application access
 */

import { Logger } from "../utils/logger.js";
import dbConnection from "../database/connection.js";

const logger = new Logger("StartupAuth");

/**
 * Check if authentication should be enforced
 */
function shouldEnforceAuth() {
  // Skip auth enforcement in CI environments
  if (process.env.CI || process.env.SKIP_AUTH === 'true') {
    return false;
  }
  
  // Skip auth in development if explicitly disabled
  if (process.env.NODE_ENV === 'development' && process.env.REQUIRE_AUTH !== 'true') {
    return false;
  }
  
  // Require auth if specific environment variable is set
  if (process.env.REQUIRE_AUTH === 'true') {
    return true;
  }
  
  // Require auth if MongoDB is available and actually connected (indicates production-like setup)
  try {
    if (dbConnection.isReady()) {
      return true;
    }
  } catch (error) {
    logger.warn("Database connection check failed, disabling auth enforcement:", error.message);
    return false;
  }
  
  return false;
}

/**
 * Create authentication gate middleware
 */
export function createAuthGate() {
  const enforceAuth = shouldEnforceAuth();
  
  if (!enforceAuth) {
    logger.info("Authentication enforcement disabled for this environment");
    return (req, res, next) => next(); // Pass through
  }
  
  logger.info("Authentication enforcement enabled - login required for application access");
  
  return (req, res, next) => {
    const url = req.url;
    const method = req.method;
    
    // Allow proxy endpoints to function without auth
    if (url.startsWith('/o/') || url.startsWith('/a/') || url.startsWith('/dy/') || url.startsWith('/scramjet/')) {
      return next();
    }
    
    // Allow service worker to load
    if (url === '/sw.js' || url === '/sw-new.js') {
      return next();
    }
    
    // Allow health checks and login page  
    if (url === '/health' || url.startsWith('/api/auth/') || url === '/login.html' || url.startsWith('/login.html?')) {
      return next();
    }
    
    // Allow API version endpoints
    if (url === '/api/version' || url === '/version' || url === '/version.json') {
      return next();
    }
    
    // Check for authentication
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    // Check for session cookies or JWT tokens
    const sessionCookie = req.cookies && req.cookies.session;
    const authCookie = req.cookies && req.cookies.sg_auth;
    
    if (token || sessionCookie || authCookie) {
      // Authentication present, allow access
      return next();
    }
    
    // No authentication found
    if (url.startsWith('/api/')) {
      // API endpoints should return JSON error
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "Please login to access this resource"
      });
    }
    
    // Redirect web requests to login page (prevent infinite loops)
    if (method === 'GET' && req.accepts('html')) {
      // Enhanced redirect loop prevention
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const pathname = parsedUrl.pathname;
      
      // If we're already on login page or redirect contains login page, don't redirect again
      if (pathname === '/login.html' || pathname.startsWith('/login.html') || 
          (parsedUrl.searchParams.get('redirect') && 
           parsedUrl.searchParams.get('redirect').includes('/login.html'))) {
        logger.debug(`Preventing redirect loop for: ${req.url}`);
        return next();
      }
      
      // Also prevent if the current request is already a redirect chain to login
      if (req.url.includes('%2Flogin.html') || req.url.includes('/login.html')) {
        logger.debug(`Preventing complex redirect loop for: ${req.url}`);
        return next();
      }
      
      const redirectUrl = '/login.html?redirect=' + encodeURIComponent(req.url);
      logger.debug(`Redirecting unauthenticated request: ${req.url} -> ${redirectUrl}`);
      return res.redirect(redirectUrl);
    }
    
    // For other requests, return 401
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      message: "Please login to access this resource"
    });
  };
}

/**
 * Setup startup authentication
 */
export function setupStartupAuth(app) {
  const authGate = createAuthGate();
  
  // Apply auth gate to all routes (before other middleware)
  app.use(authGate);
  
  logger.info("Startup authentication configured");
}