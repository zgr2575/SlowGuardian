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
  // Skip auth enforcement in CI environments, Vercel, or when explicitly disabled
  if (process.env.CI || process.env.SKIP_AUTH === 'true' || process.env.VERCEL) {
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
  
  // For production deployments, only require auth if MongoDB is properly configured and connected
  try {
    if (dbConnection.isReady() && process.env.MONGODB_URI && process.env.MONGODB_URI !== "mongodb://localhost:27017") {
      return true;
    }
  } catch (error) {
    logger.warn("Database connection check failed, disabling auth enforcement:", error.message);
    return false;
  }
  
  // Default to no auth enforcement for simpler deployments
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

    // Allow static assets (styles, scripts, images, fonts) so the login page can load correctly
    // This prevents redirecting asset requests to /login.html which causes MIME type errors in the browser
    const isStaticAsset =
      url.startsWith('/assets/') ||
      url === '/favicon.png' ||
      url === '/robots.txt' ||
      url === '/sitemap.xml' ||
      /\.(css|js|mjs|map|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot)$/i.test(url);
    if (isStaticAsset) {
      return next();
    }
    
    // Allow service worker to load
    if (url === '/sw.js' || url === '/sw-new.js') {
      return next();
    }
    
    // Allow health checks and auth pages (login/signup)
    if (
      url === '/health' ||
      url.startsWith('/api/auth/') ||
      url === '/login.html' || url.startsWith('/login.html?') || url === '/li' || url.startsWith('/li?') ||
      url === '/signup.html' || url.startsWith('/signup.html?') || url === '/su' || url.startsWith('/su?')
    ) {
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
      const hasAuth = Boolean(token || sessionCookie || authCookie);

      // If requesting root and we have auth, allow access (don't redirect)
      if (pathname === '/' && hasAuth) {
        return next();
      }
      
      // If we're already on login/signup page or redirect contains them, don't redirect again
      if (
        pathname === '/login.html' || pathname.startsWith('/login.html') ||
        pathname === '/signup.html' || pathname.startsWith('/signup.html') ||
        (parsedUrl.searchParams.get('redirect') &&
          (parsedUrl.searchParams.get('redirect').includes('/login.html') ||
           parsedUrl.searchParams.get('redirect').includes('/signup.html')))
      ) {
        logger.debug(`Preventing redirect loop for: ${req.url}`);
        return next();
      }
      
      // Also prevent if the current request is already a redirect chain to login
  if (req.url.includes('%2Flogin.html') || req.url.includes('/login.html') || req.url.includes('/signup.html')) {
        logger.debug(`Preventing complex redirect loop for: ${req.url}`);
        return next();
      }
      
  const redirectTarget = parsedUrl.pathname === '/' ? '/' : req.url;
  const redirectUrl = '/login.html?redirect=' + encodeURIComponent(redirectTarget);
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