/**
 * Error handling middleware for SlowGuardian
 * Handles application errors and provides user-friendly responses
 */

import { Logger } from "../utils/logger.js";

const logger = new Logger("Error");

/**
 * Setup error handling middleware
 */
export function setupErrorHandling(app) {
  // 404 handler
  app.use("*", (req, res) => {
    logger.warn(`404 - Not found: ${req.method} ${req.originalUrl}`);

    if (req.accepts("json")) {
      res.status(404).json({
        error: "Not Found",
        message: "The requested resource was not found",
        path: req.originalUrl,
      });
    } else {
      res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>404 - Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
            h1 { color: #333; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <a href="/">Go back home</a>
        </body>
        </html>
      `);
    }
  });

  // Global error handler
  app.use((err, req, res, _next) => {
    logger.error("Application error:", err);

    // Don't expose stack traces in production
    const isDevelopment = process.env.NODE_ENV !== "production";

    const errorResponse = {
      error: "Internal Server Error",
      message: isDevelopment ? err.message : "Something went wrong",
      ...(isDevelopment && { stack: err.stack }),
    };

    if (req.accepts("json")) {
      res.status(500).json(errorResponse);
    } else {
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>500 - Internal Server Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
            h1 { color: #d32f2f; }
            p { color: #666; }
            .error { background: #ffebee; padding: 20px; margin: 20px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>500 - Internal Server Error</h1>
          <p>Something went wrong on our end.</p>
          ${isDevelopment ? `<div class="error"><pre>${err.stack}</pre></div>` : ""}
          <a href="/">Go back home</a>
        </body>
        </html>
      `);
    }
  });

  logger.info("Error handling middleware configured");
}
