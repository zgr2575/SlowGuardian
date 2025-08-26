/**
 * Logging middleware for SlowGuardian
 * Handles request/response logging
 */

import { Logger } from "../utils/logger.js";

const logger = new Logger("HTTP");

/**
 * Setup logging middleware
 */
export function setupLogging(app) {
  // Request logging
  app.use((req, res, next) => {
    const startTime = Date.now();
    
    // Log request
    if (logger.level >= 2) { // info level
      logger.info(`${req.method} ${req.url} - ${req.ip}`);
    }
    
    // Capture response end
    const originalEnd = res.end;
    res.end = function(...args) {
      const duration = Date.now() - startTime;
      
      if (logger.level >= 2) { // info level
        logger.info(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
      }
      
      originalEnd.apply(this, args);
    };
    
    next();
  });
  
  logger.info("Logging middleware configured");
}