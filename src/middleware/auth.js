/**
 * Authentication middleware for SlowGuardian
 * Handles user authentication and authorization
 */

import basicAuth from "express-basic-auth";
import { Logger } from "../utils/logger.js";

const logger = new Logger("Auth");

/**
 * Setup authentication middleware
 */
export function setupAuth(app, config) {
  if (!config.challenge) {
    logger.info("Authentication disabled");
    return;
  }

  logger.info("Setting up authentication middleware...");

  if (config.envusers) {
    // Environment-based authentication (deprecated but supported)
    logger.warn("Environment-based authentication is deprecated");
    
    app.use((req, res, next) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith("Basic ")) {
        res.set("WWW-Authenticate", "Basic realm=\"SlowGuardian\"");
        return res.status(401).json({ error: "Authentication required" });
      }

      try {
        const credentials = Buffer.from(authHeader.split(" ")[1], "base64").toString();
        const [username, password] = credentials.split(":");
        
        if (config.users[username] && config.users[username] === password) {
          req.user = { username };
          return next();
        } else {
          res.set("WWW-Authenticate", "Basic realm=\"SlowGuardian\"");
          return res.status(401).json({ error: "Invalid credentials" });
        }
      } catch (error) {
        logger.error("Authentication error:", error);
        res.set("WWW-Authenticate", "Basic realm=\"SlowGuardian\"");
        return res.status(401).json({ error: "Authentication failed" });
      }
    });
  } else {
    // Standard basic authentication
    app.use(basicAuth({
      users: config.users,
      challenge: true,
      realm: "SlowGuardian",
      unauthorizedResponse: (req) => {
        logger.warn(`Unauthorized access attempt from ${req.ip}`);
        return { error: "Authentication required" };
      },
    }));
  }

  logger.info("Authentication middleware configured");
}