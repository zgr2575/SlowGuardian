/**
 * Security middleware for SlowGuardian
 * Handles security headers and validation
 */

import { Logger } from "../utils/logger.js";

const logger = new Logger("Security");

/**
 * Setup security middleware
 */
export function setupSecurity(app, config) {
  logger.info("Setting up security middleware...");

  // Request size limits
  app.use((req, res, next) => {
    const contentLength = req.get("content-length");
    if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) { // 50MB limit
      return res.status(413).json({ error: "Request entity too large" });
    }
    next();
  });

  // Rate limiting headers
  app.use((req, res, next) => {
    res.set("X-Powered-By", "SlowGuardian");
    res.set("Server", `SlowGuardian/${config.version}`);
    next();
  });

  // Development security headers
  if (config.debug) {
    app.use((req, res, next) => {
      res.set("X-Debug-Mode", "true");
      next();
    });
  }

  logger.info("Security middleware configured");
}