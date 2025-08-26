/**
 * Routes setup for SlowGuardian
 * Configures all application routes
 */

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logger = new Logger("Routes");

/**
 * Setup application routes
 */
export function setupRoutes(app, config) {
  logger.info("Setting up application routes...");

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      version: config.version,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API endpoints
  setupApiRoutes(app, config);

  // Frontend routes
  if (config.routes) {
    setupFrontendRoutes(app);
  }

  logger.info("Application routes configured");
}

/**
 * Setup API routes
 */
function setupApiRoutes(app, config) {
  // Server information endpoint
  app.get("/api/info", (req, res) => {
    const memoryUsage = process.memoryUsage();
    
    res.json({
      server: "SlowGuardian",
      version: config.version,
      uptime: process.uptime(),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      },
      environment: config.debug ? "development" : "production",
      features: {
        authentication: config.challenge,
        plugins: config.plugins,
        localAssets: config.local,
      },
    });
  });

  // Legacy data endpoint (backward compatibility)
  app.get("/d/data", (req, res) => {
    logger.info("Legacy data endpoint accessed");
    
    const memoryUsage = process.memoryUsage();
    const serverData = [
      `server: SlowGuardian v${config.version}`,
      `version: ${config.version}`,
      `uptime: ${process.uptime()}s`,
      `memory: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      `environment: ${config.debug ? "development" : "production"}`,
    ].join(" | ");

    res.send(serverData);
  });

  // External content proxy (if enabled)
  if (config.local) {
    app.get("/e/*", async (req, res) => {
      try {
        const path = req.params[0];
        const baseUrls = [
          "https://raw.githubusercontent.com/v-5x/x/fixy",
          "https://raw.githubusercontent.com/ypxa/y/main",
          "https://raw.githubusercontent.com/ypxa/w/master",
        ];

        await fetchExternalContent(req, res, baseUrls, path);
      } catch (error) {
        logger.error("External content fetch error:", error);
        res.status(500).json({ error: "Failed to fetch external content" });
      }
    });
  }
}

/**
 * Setup frontend routes
 */
function setupFrontendRoutes(app) {
  const staticDir = join(__dirname, "../../static");
  
  const routes = [
    { path: "/", file: "index-v9.html" }, // Use new v9 UI
    { path: "/ap", file: "apps.html" },
    { path: "/apps", file: "apps.html" }, // Alternative route
    { path: "/g", file: "games.html" },
    { path: "/games", file: "games.html" }, // Alternative route
    { path: "/s", file: "settings.html" },
    { path: "/settings", file: "settings.html" }, // Alternative route
    { path: "/p", file: "go.html" },
    { path: "/proxy", file: "go.html" }, // Alternative route
    { path: "/li", file: "login.html" },
    { path: "/login", file: "login.html" }, // Alternative route
    { path: "/tos", file: "tos.html" },
    { path: "/terms", file: "tos.html" }, // Alternative route
    // Legacy routes for backward compatibility
    { path: "/v8", file: "index.html" }, // Original v8 UI
  ];

  routes.forEach((route) => {
    app.get(route.path, (req, res) => {
      res.sendFile(join(staticDir, route.file), (err) => {
        if (err) {
          logger.error(`Error serving ${route.file}:`, err);
          res.status(404).send("Page not found");
        }
      });
    });
  });
}

/**
 * Fetch external content with fallback URLs
 */
async function fetchExternalContent(req, res, baseUrls, path) {
  const { default: fetch } = await import("node-fetch");
  
  for (const baseUrl of baseUrls) {
    try {
      const url = `${baseUrl}/${path}`;
      logger.debug(`Fetching external content: ${url}`);
      
      const response = await fetch(url, {
        timeout: 10000,
        headers: {
          "User-Agent": "SlowGuardian/9.0.0",
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType) {
          res.set("Content-Type", contentType);
        }
        
        response.body.pipe(res);
        return;
      }
    } catch (error) {
      logger.debug(`Failed to fetch from ${baseUrl}: ${error.message}`);
    }
  }

  res.status(404).json({ error: "External content not found" });
}