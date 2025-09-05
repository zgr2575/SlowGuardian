/**
 * Session Management for SlowGuardian
 * Handles user sessions with MongoDB storage
 */

import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import dbConnection from "../database/connection.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger("SessionManager");

class SessionManager {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || "slowguardian-default-secret-change-in-production";
    this.sessionExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Create a new session for user
   */
  async createSession(user) {
    try {
      const collection = dbConnection.getCollection("sessions");
      
      const sessionData = {
        userId: new ObjectId(user._id),
        username: user.username,
        email: user.email,
        role: user.role,
        isPremium: user.isActivePremium(),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.sessionExpiry),
        lastActivity: new Date(),
        ipAddress: null, // Will be set by middleware
        userAgent: null, // Will be set by middleware
      };

      const result = await collection.insertOne(sessionData);
      sessionData._id = result.insertedId;

      // Generate JWT token
      const token = jwt.sign(
        {
          sessionId: sessionData._id.toString(),
          userId: user._id.toString(),
          username: user.username,
          role: user.role,
          isPremium: user.isActivePremium(),
        },
        this.jwtSecret,
        { expiresIn: "24h" }
      );

      logger.info(`Session created for user: ${user.username}`);
      
      return {
        token,
        sessionId: sessionData._id,
        expiresAt: sessionData.expiresAt,
      };
    } catch (error) {
      logger.error("Failed to create session:", error);
      throw error;
    }
  }

  /**
   * Validate session token
   */
  async validateSession(token) {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, this.jwtSecret);
      
      // Check session in database
      const collection = dbConnection.getCollection("sessions");
      const session = await collection.findOne({
        _id: new ObjectId(decoded.sessionId),
        userId: new ObjectId(decoded.userId),
      });

      if (!session) {
        return { isValid: false, error: "Session not found" };
      }

      // Check if session has expired
      if (new Date() > session.expiresAt) {
        await this.destroySession(decoded.sessionId);
        return { isValid: false, error: "Session expired" };
      }

      // Update last activity
      await collection.updateOne(
        { _id: new ObjectId(decoded.sessionId) },
        { $set: { lastActivity: new Date() } }
      );

      return {
        isValid: true,
        session: {
          sessionId: session._id,
          userId: session.userId,
          username: session.username,
          email: session.email,
          role: session.role,
          isPremium: session.isPremium,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity,
        },
      };
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return { isValid: false, error: "Invalid token" };
      }
      if (error.name === "TokenExpiredError") {
        return { isValid: false, error: "Token expired" };
      }
      
      logger.error("Session validation error:", error);
      return { isValid: false, error: "Session validation failed" };
    }
  }

  /**
   * Destroy a specific session
   */
  async destroySession(sessionId) {
    try {
      const collection = dbConnection.getCollection("sessions");
      const result = await collection.deleteOne({ _id: new ObjectId(sessionId) });
      
      if (result.deletedCount > 0) {
        logger.info(`Session destroyed: ${sessionId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error("Failed to destroy session:", error);
      return false;
    }
  }

  /**
   * Destroy all sessions for a user
   */
  async destroyUserSessions(userId) {
    try {
      const collection = dbConnection.getCollection("sessions");
      const result = await collection.deleteMany({ userId: new ObjectId(userId) });
      
      logger.info(`Destroyed ${result.deletedCount} sessions for user: ${userId}`);
      return result.deletedCount;
    } catch (error) {
      logger.error("Failed to destroy user sessions:", error);
      return 0;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions() {
    try {
      const collection = dbConnection.getCollection("sessions");
      const result = await collection.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      if (result.deletedCount > 0) {
        logger.info(`Cleaned up ${result.deletedCount} expired sessions`);
      }
      
      return result.deletedCount;
    } catch (error) {
      logger.error("Failed to cleanup expired sessions:", error);
      return 0;
    }
  }

  /**
   * Get active sessions for a user
   */
  async getUserSessions(userId) {
    try {
      const collection = dbConnection.getCollection("sessions");
      const sessions = await collection
        .find({ 
          userId: new ObjectId(userId),
          expiresAt: { $gt: new Date() }
        })
        .sort({ lastActivity: -1 })
        .toArray();

      return sessions;
    } catch (error) {
      logger.error("Failed to get user sessions:", error);
      return [];
    }
  }

  /**
   * Extend session expiry
   */
  async extendSession(sessionId, additionalTime = null) {
    try {
      const collection = dbConnection.getCollection("sessions");
      const extensionTime = additionalTime || this.sessionExpiry;
      const newExpiryTime = new Date(Date.now() + extensionTime);

      const result = await collection.updateOne(
        { _id: new ObjectId(sessionId) },
        { 
          $set: { 
            expiresAt: newExpiryTime,
            lastActivity: new Date()
          } 
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      logger.error("Failed to extend session:", error);
      return false;
    }
  }

  /**
   * Update session metadata
   */
  async updateSessionMetadata(sessionId, metadata) {
    try {
      const collection = dbConnection.getCollection("sessions");
      const result = await collection.updateOne(
        { _id: new ObjectId(sessionId) },
        { 
          $set: { 
            ...metadata,
            lastActivity: new Date()
          } 
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      logger.error("Failed to update session metadata:", error);
      return false;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats() {
    try {
      const collection = dbConnection.getCollection("sessions");
      const now = new Date();

      const [totalSessions, activeSessions, expiredSessions] = await Promise.all([
        collection.countDocuments(),
        collection.countDocuments({ expiresAt: { $gt: now } }),
        collection.countDocuments({ expiresAt: { $lt: now } }),
      ]);

      return {
        total: totalSessions,
        active: activeSessions,
        expired: expiredSessions,
      };
    } catch (error) {
      logger.error("Failed to get session stats:", error);
      return { total: 0, active: 0, expired: 0 };
    }
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

// Setup periodic cleanup of expired sessions
setInterval(() => {
  sessionManager.cleanupExpiredSessions();
}, 60 * 60 * 1000); // Run every hour

export default sessionManager;
export { SessionManager };