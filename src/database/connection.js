/**
 * MongoDB Connection Manager for SlowGuardian
 * Handles database connection, connection pooling, and error handling
 */

import { MongoClient } from "mongodb";
import { Logger } from "../utils/logger.js";

const logger = new Logger("Database");

class DatabaseConnection {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Initialize database connection
   */
  async connect(connectionString = null, dbName = "slowguardian") {
    try {
      // Use environment variable or provided connection string
      const mongoUri = connectionString || 
        process.env.MONGODB_URI || 
        process.env.MONGO_URI || 
        "mongodb://localhost:27017";

      logger.info(`Connecting to MongoDB: ${mongoUri.replace(/:[^:]*@/, ":***@")}`);

      // In CI environments or when MONGODB_SKIP is set, use mock/fallback
      if (process.env.CI || process.env.MONGODB_SKIP === 'true') {
        logger.info("CI environment detected, using mock MongoDB fallback");
        this.isConnected = false;
        return false;
      }

      this.client = new MongoClient(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 3000, // Reduced timeout for faster failures
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
      });

      await this.client.connect();
      
      // Test the connection
      await this.client.db("admin").command({ ping: 1 });
      
      this.db = this.client.db(dbName);
      this.isConnected = true;
      this.reconnectAttempts = 0;

      logger.info(`Successfully connected to MongoDB database: ${dbName}`);

      // Setup connection event listeners
      this.client.on("close", () => {
        logger.warn("MongoDB connection closed");
        this.isConnected = false;
      });

      this.client.on("error", (error) => {
        logger.error("MongoDB connection error:", error);
        this.isConnected = false;
      });

      // Create indexes for better performance
      await this.createIndexes();

      return true;
    } catch (error) {
      logger.error("Failed to connect to MongoDB:", error);
      this.isConnected = false;
      
      // In development, reduce retry attempts for faster startup
      const maxRetries = process.env.NODE_ENV === 'development' ? 1 : this.maxReconnectAttempts;
      
      // Auto-retry connection
      if (this.reconnectAttempts < maxRetries) {
        this.reconnectAttempts++;
        logger.info(`Retrying connection (${this.reconnectAttempts}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Shorter retry delay
        return this.connect(connectionString, dbName);
      }
      
      throw error;
    }
  }

  /**
   * Create database indexes for optimal performance
   */
  async createIndexes() {
    try {
      // Users collection indexes
      await this.db.collection("users").createIndex({ email: 1 }, { unique: true });
      await this.db.collection("users").createIndex({ username: 1 }, { unique: true });
      await this.db.collection("users").createIndex({ createdAt: -1 });

      // Sessions collection indexes
      await this.db.collection("sessions").createIndex({ sessionId: 1 }, { unique: true });
      await this.db.collection("sessions").createIndex({ userId: 1 });
      await this.db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

      // Premium activations collection indexes
      await this.db.collection("premium_activations").createIndex({ userId: 1 });
      await this.db.collection("premium_activations").createIndex({ premiumKey: 1 }, { unique: true });
      await this.db.collection("premium_activations").createIndex({ expiresAt: 1 });

      // Music playlists collection indexes
      await this.db.collection("playlists").createIndex({ userId: 1 });
      await this.db.collection("playlists").createIndex({ spotifyId: 1 });
      await this.db.collection("playlists").createIndex({ createdAt: -1 });

      // Spotify tokens collection indexes
      await this.db.collection("spotify_tokens").createIndex({ userId: 1 }, { unique: true });
      await this.db.collection("spotify_tokens").createIndex({ expiresAt: 1 });

      logger.info("Database indexes created successfully");
    } catch (error) {
      logger.warn("Failed to create some indexes:", error.message);
    }
  }

  /**
   * Get database instance
   */
  getDb() {
    if (!this.isConnected || !this.db) {
      throw new Error("Database not connected");
    }
    return this.db;
  }

  /**
   * Get collection
   */
  getCollection(name) {
    return this.getDb().collection(name);
  }

  /**
   * Check if database is connected
   */
  isReady() {
    return this.isConnected && this.db !== null;
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      this.db = null;
      logger.info("Database connection closed");
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: "disconnected", error: "No active connection" };
      }

      await this.client.db("admin").command({ ping: 1 });
      return { status: "healthy", connected: true };
    } catch (error) {
      return { status: "error", error: error.message };
    }
  }
}

// Create singleton instance
const dbConnection = new DatabaseConnection();

export default dbConnection;
export { DatabaseConnection };