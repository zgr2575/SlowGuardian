/**
 * Routes setup for SlowGuardian
 * Configures all application routes
 */

import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Logger } from "../utils/logger.js";
import adminRoutes from "./admin.js";
import keyauthRoutes, { initializeKeyAuth } from "./keyauth.js";

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

  // Admin API routes
  app.use("/api/admin", adminRoutes);

  // Custom apps and settings endpoints
  setupCustomEndpoints(app, config);

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
  // Version information endpoint
  app.get("/api/version", async (req, res) => {
    try {
      const fs = await import("fs");
      const versionData = fs.readFileSync(
        join(__dirname, "../../static/version.json"),
        "utf8"
      );
      const versionInfo = JSON.parse(versionData);
      res.json(versionInfo);
    } catch (error) {
      // Fallback if version.json doesn't exist
      res.json({
        version: config.version,
        name: "slowguardian",
        buildId: "unknown",
        buildDate: new Date().toISOString(),
        git: {
          commit: "unknown",
          commitShort: "unknown",
          branch: "unknown",
          commitMessage: "unknown",
        },
        environment: config.debug ? "development" : "production",
      });
    }
  });

  // Short version endpoint
  app.get("/version", async (req, res) => {
    try {
      const fs = await import("fs");
      const versionData = fs.readFileSync(
        join(__dirname, "../../static/version.json"),
        "utf8"
      );
      const versionInfo = JSON.parse(versionData);
      res.send(`${versionInfo.version}-${versionInfo.git.commitShort}`);
    } catch (error) {
      res.send(`${config.version}-unknown`);
    }
  });

  // Configuration endpoint (for frontend)
  app.get("/api/config", (req, res) => {
    res.json({
      challenge: config.challenge,
      users: config.users || {},
      version: config.version,
      developerMode: config.developerMode || { enabled: false },
      features: {
        plugins: config.plugins,
        localAssets: config.local,
      },
    });
  });

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
    { path: "/", file: "index.html" }, // v9 UI in index.html
    { path: "/ap", file: "apps.html" },
    { path: "/apps", file: "apps.html" }, // Alternative route
    { path: "/g", file: "games.html" },
    { path: "/games", file: "games.html" }, // Alternative route
    { path: "/s", file: "settings.html" },
    { path: "/settings", file: "settings.html" }, // Alternative route
    { path: "/p", file: "go.html" },
    { path: "/proxy", file: "go.html" }, // Alternative route
    { path: "/go", file: "go.html" }, // Additional browser route
    { path: "/browser", file: "go.html" }, // Alternative browser route
    { path: "/tabs", file: "tabs.html" }, // Browser tabs system
    { path: "/t", file: "tabs.html" }, // Short alias for tabs
    { path: "/developer", file: "developer.html" }, // Developer mode
    { path: "/dev", file: "developer.html" }, // Short alias for developer mode
    { path: "/li", file: "login.html" },
    { path: "/login", file: "login.html" }, // Alternative route
    { path: "/tos", file: "tos.html" },
    { path: "/terms", file: "tos.html" }, // Alternative route
    // Legacy routes for backward compatibility
    { path: "/v8", file: "index-v8.html" }, // Original v8 UI if it exists
  ];

  routes.forEach((route) => {
    app.get(route.path, (req, res) => {
      const filePath = join(staticDir, route.file);

      res.sendFile(filePath, (err) => {
        if (err) {
          logger.error(`Error serving ${route.file} for ${route.path}:`, err);

          // Try fallback to index.html for main routes
          if (route.path === "/" && route.file !== "index.html") {
            const fallbackPath = join(staticDir, "index.html");
            res.sendFile(fallbackPath, (fallbackErr) => {
              if (fallbackErr) {
                logger.error(
                  `Fallback also failed for ${route.path}:`,
                  fallbackErr
                );
                res.status(404).send("Page not found");
              }
            });
          } else {
            res.status(404).send("Page not found");
          }
        }
      });
    });
  });

  // Wildcard routes for proxy URLs (must come after exact routes)
  app.get("/p/*", (req, res) => {
    const filePath = join(staticDir, "go.html");
    res.sendFile(filePath, (err) => {
      if (err) {
        logger.error(`Error serving go.html for /p/*:`, err);
        res.status(404).send("Page not found");
      }
    });
  });

  app.get("/proxy/*", (req, res) => {
    const filePath = join(staticDir, "go.html");
    res.sendFile(filePath, (err) => {
      if (err) {
        logger.error(`Error serving go.html for /proxy/*:`, err);
        res.status(404).send("Page not found");
      }
    });
  });

  app.get("/go/*", (req, res) => {
    const filePath = join(staticDir, "go.html");
    res.sendFile(filePath, (err) => {
      if (err) {
        logger.error(`Error serving go.html for /go/*:`, err);
        res.status(404).send("Page not found");
      }
    });
  });
}

/**
 * Setup custom endpoints for enhanced functionality
 */
function setupCustomEndpoints(app, config) {
  // URL verification endpoint
  app.get("/api/check-url", async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    try {
      const { default: fetch } = await import("node-fetch");

      // Basic URL validation
      new URL(url);

      // Try to fetch the URL with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent": "SlowGuardian/9.0.0",
        },
      });

      clearTimeout(timeoutId);

      res.json({
        accessible: response.ok,
        status: response.status,
        statusText: response.statusText,
      });
    } catch (error) {
      res.json({
        accessible: false,
        error: error.message,
      });
    }
  });

  // Proxy status endpoint
  app.get("/api/proxy-status", (req, res) => {
    res.json({
      status: "operational",
      bare: {
        path: config.bare.path,
        version: config.bare.version,
      },
      ultraviolet: {
        prefix: "/a/",
        config: "/m/config.js",
      },
      dynamic: {
        prefix: "/a/q/",
        config: "/dy/config.js",
      },
    });
  });

  // Ads tracking endpoint
  app.post("/api/ads/track", (req, res) => {
    try {
      const { event, adType, timestamp, userAgent, url } = req.body;

      // Log ad events for analytics
      console.log(`📢 [Ad Event] ${event} - ${adType} at ${timestamp}`);

      // In production, save to database or analytics service
      // For now, just log and return success

      res.json({
        success: true,
        message: "Ad event tracked successfully",
      });
    } catch (error) {
      console.error("Failed to track ad event:", error);
      res.status(500).json({
        success: false,
        message: "Failed to track ad event",
      });
    }
  });

  // User preferences endpoint
  app.post("/api/preferences", express.json(), (req, res) => {
    try {
      // This would typically save to a database
      // For now, we'll just acknowledge the request
      res.json({ success: true, message: "Preferences saved" });
    } catch (error) {
      logger.error("Failed to save preferences:", error);
      res.status(500).json({ error: "Failed to save preferences" });
    }
  });

  app.get("/api/preferences", (req, res) => {
    try {
      // This would typically load from a database
      // For now, return default preferences
      res.json({
        theme: "dark",
        searchEngine: "https://www.google.com/search?q=",
        tabCloaking: false,
        aboutBlankCloaking: false,
        particles: true,
      });
    } catch (error) {
      logger.error("Failed to load preferences:", error);
      res.status(500).json({ error: "Failed to load preferences" });
    }
  });
}
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
