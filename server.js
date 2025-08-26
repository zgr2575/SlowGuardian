/**
 * SlowGuardian v9 - Main Server Entry Point
 * A modern, secure, and extensible web proxy with plugin system
 */

import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import helmet from "helmet";
import cors from "cors";
import { createBareServer } from "@tomphttp/bare-server-node";
import config from "./config.js";

// Utils and middleware
import { setupSecurity } from "./src/middleware/security.js";
import { setupAuth } from "./src/middleware/auth.js";
import { setupLogging } from "./src/middleware/logging.js";
import { setupRoutes } from "./src/routes/index.js";
import { setupErrorHandling } from "./src/middleware/error.js";
import { PluginManager } from "./src/plugins/manager.js";
import { Logger } from "./src/utils/logger.js";

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = config.port;
const logger = new Logger("Server");

/**
 * Initialize SlowGuardian server
 */
async function createSlowGuardianServer() {
  logger.info(`Starting SlowGuardian v${config.version}...`);

  // Create Express app and HTTP server
  const app = express();
  const server = createServer();
  
  // Create bare server for proxy functionality
  const bareServer = createBareServer(config.bare.path);

  // Security middleware (must be first)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "blob:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https:", "wss:", "blob:"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https:", "blob:"],
        frameSrc: ["'self'", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.use(cors({
    origin: true,
    credentials: true,
  }));

  // Basic middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Custom middleware
  setupLogging(app);
  setupSecurity(app, config);
  setupAuth(app, config);

  // Static file serving
  if (config.routes && config.local) {
    app.use(express.static(join(__dirname, "static"), {
      maxAge: "1d",
      etag: true,
    }));
  }

  // Initialize plugin system
  const pluginManager = new PluginManager(app, config);
  if (config.plugins) {
    await pluginManager.loadPlugins();
  }

  // Application routes
  if (config.routes) {
    setupRoutes(app, config);
  }

  // Error handling (must be last)
  setupErrorHandling(app);

  // HTTP server request handling
  server.on("request", (req, res) => {
    // Route bare server requests to proxy
    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    } else {
      app(req, res);
    }
  });

  // WebSocket upgrade handling
  server.on("upgrade", (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeUpgrade(req, socket, head);
    } else {
      socket.end();
    }
  });

  // Graceful shutdown handling
  process.on("SIGTERM", () => {
    logger.info("Received SIGTERM, shutting down gracefully...");
    server.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    logger.info("Received SIGINT, shutting down gracefully...");
    server.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
  });

  // Error handling
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
  });

  return { app, server, pluginManager };
}

/**
 * Start the server
 */
async function startServer() {
  try {
    const { server } = await createSlowGuardianServer();
    
    server.listen(PORT, () => {
      logger.info(`🚀 SlowGuardian v${config.version} is running on port ${PORT}`);
      logger.info(`📝 Environment: ${config.debug ? "development" : "production"}`);
      logger.info(`🔐 Authentication: ${config.challenge ? "enabled" : "disabled"}`);
      logger.info(`🔌 Plugins: ${config.plugins ? "enabled" : "disabled"}`);
      logger.info(`📡 Server ready at http://localhost:${PORT}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error("Server error:", error);
      }
      process.exit(1);
    });

  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { createSlowGuardianServer, startServer };