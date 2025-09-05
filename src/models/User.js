/**
 * User Model for SlowGuardian MongoDB Authentication
 * Handles user data operations and validation
 */

import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import dbConnection from "../database/connection.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger("UserModel");

class User {
  constructor(userData = {}) {
    this._id = userData._id;
    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this.firstName = userData.firstName;
    this.lastName = userData.lastName;
    this.role = userData.role || "user"; // user, premium, admin
    this.isVerified = userData.isVerified || false;
    this.premiumStatus = userData.premiumStatus || {
      isPremium: false,
      premiumKey: null,
      activatedAt: null,
      expiresAt: null,
    };
    this.spotifyTokens = userData.spotifyTokens || null;
    this.preferences = userData.preferences || {
      theme: "dark",
      searchEngine: "https://www.google.com/search?q=",
      tabCloaking: false,
      aboutBlankCloaking: false,
      particles: true,
    };
    this.loginAttempts = userData.loginAttempts || 0;
    this.lockUntil = userData.lockUntil;
    this.lastLogin = userData.lastLogin;
    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = userData.updatedAt || new Date();
  }

  /**
   * Hash password before saving
   */
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password
   */
  async comparePassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  /**
   * Validate user data
   */
  validate() {
    const errors = [];

    // Username validation
    if (!this.username || this.username.length < 3) {
      errors.push("Username must be at least 3 characters long");
    }
    if (this.username && !/^[a-zA-Z0-9_-]+$/.test(this.username)) {
      errors.push("Username can only contain letters, numbers, underscores, and hyphens");
    }

    // Email validation
    if (!this.email) {
      errors.push("Email is required");
    }
    if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push("Invalid email format");
    }

    // Password validation (only for new users or password changes)
    if (this.password && !this._id) {
      if (this.password.length < 8) {
        errors.push("Password must be at least 8 characters long");
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.password)) {
        errors.push("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Save user to database
   */
  async save() {
    try {
      const validation = this.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const collection = dbConnection.getCollection("users");
      this.updatedAt = new Date();

      if (this._id) {
        // Update existing user
        const updateData = { ...this };
        delete updateData._id;
        
        const result = await collection.updateOne(
          { _id: new ObjectId(this._id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          throw new Error("User not found");
        }

        logger.info(`User updated: ${this.username}`);
        return this;
      } else {
        // Create new user
        if (this.password) {
          this.password = await this.hashPassword(this.password);
        }

        const result = await collection.insertOne(this);
        this._id = result.insertedId;

        logger.info(`User created: ${this.username}`);
        return this;
      }
    } catch (error) {
      logger.error("Failed to save user:", error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    try {
      const collection = dbConnection.getCollection("users");
      const userData = await collection.findOne({ _id: new ObjectId(id) });
      
      return userData ? new User(userData) : null;
    } catch (error) {
      logger.error("Failed to find user by ID:", error);
      return null;
    }
  }

  /**
   * Find user by username
   */
  static async findByUsername(username) {
    try {
      const collection = dbConnection.getCollection("users");
      const userData = await collection.findOne({ username: { $regex: new RegExp(username, "i") } });
      
      return userData ? new User(userData) : null;
    } catch (error) {
      logger.error("Failed to find user by username:", error);
      return null;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    try {
      const collection = dbConnection.getCollection("users");
      const userData = await collection.findOne({ email: email.toLowerCase() });
      
      return userData ? new User(userData) : null;
    } catch (error) {
      logger.error("Failed to find user by email:", error);
      return null;
    }
  }

  /**
   * Authenticate user
   */
  static async authenticate(usernameOrEmail, password) {
    try {
      // Find user by username or email
      let user = await User.findByUsername(usernameOrEmail);
      if (!user) {
        user = await User.findByEmail(usernameOrEmail);
      }

      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > new Date()) {
        return { success: false, error: "Account temporarily locked due to too many failed login attempts" };
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      
      if (!isValidPassword) {
        // Increment login attempts
        await user.incrementLoginAttempts();
        return { success: false, error: "Invalid password" };
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Remove password from returned user object
      delete user.password;

      logger.info(`User authenticated: ${user.username}`);
      return { success: true, user };
    } catch (error) {
      logger.error("Authentication failed:", error);
      return { success: false, error: "Authentication failed" };
    }
  }

  /**
   * Increment login attempts and lock account if necessary
   */
  async incrementLoginAttempts() {
    try {
      const collection = dbConnection.getCollection("users");
      const maxAttempts = 5;
      const lockTime = 15 * 60 * 1000; // 15 minutes

      this.loginAttempts = (this.loginAttempts || 0) + 1;

      // Lock account if max attempts reached
      if (this.loginAttempts >= maxAttempts) {
        this.lockUntil = new Date(Date.now() + lockTime);
        logger.warn(`Account locked for user: ${this.username}`);
      }

      await collection.updateOne(
        { _id: new ObjectId(this._id) },
        { 
          $set: { 
            loginAttempts: this.loginAttempts,
            lockUntil: this.lockUntil 
          } 
        }
      );
    } catch (error) {
      logger.error("Failed to increment login attempts:", error);
    }
  }

  /**
   * Reset login attempts
   */
  async resetLoginAttempts() {
    try {
      const collection = dbConnection.getCollection("users");
      
      this.loginAttempts = 0;
      this.lockUntil = null;

      await collection.updateOne(
        { _id: new ObjectId(this._id) },
        { 
          $unset: { 
            loginAttempts: 1,
            lockUntil: 1 
          } 
        }
      );
    } catch (error) {
      logger.error("Failed to reset login attempts:", error);
    }
  }

  /**
   * Activate premium with key
   */
  async activatePremium(premiumKey, expirationMonths = 1) {
    try {
      const collection = dbConnection.getCollection("users");
      const premiumCollection = dbConnection.getCollection("premium_activations");

      // Check if key is already used
      const existingActivation = await premiumCollection.findOne({ premiumKey });
      if (existingActivation) {
        throw new Error("Premium key already used");
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + (expirationMonths * 30 * 24 * 60 * 60 * 1000));

      // Update user premium status
      this.premiumStatus = {
        isPremium: true,
        premiumKey,
        activatedAt: now,
        expiresAt,
      };

      this.role = "premium";

      // Save premium activation record
      await premiumCollection.insertOne({
        userId: this._id,
        premiumKey,
        activatedAt: now,
        expiresAt,
        createdAt: now,
      });

      // Update user record
      await collection.updateOne(
        { _id: new ObjectId(this._id) },
        { 
          $set: { 
            premiumStatus: this.premiumStatus,
            role: this.role,
            updatedAt: new Date()
          } 
        }
      );

      logger.info(`Premium activated for user: ${this.username}`);
      return { success: true, expiresAt };
    } catch (error) {
      logger.error("Failed to activate premium:", error);
      throw error;
    }
  }

  /**
   * Check if user has active premium
   */
  isActivePremium() {
    return this.premiumStatus.isPremium && 
           this.premiumStatus.expiresAt && 
           new Date(this.premiumStatus.expiresAt) > new Date();
  }

  /**
   * Convert to JSON (removes sensitive data)
   */
  toJSON() {
    const userData = { ...this };
    delete userData.password;
    return userData;
  }

  /**
   * Delete user
   */
  async delete() {
    try {
      const collection = dbConnection.getCollection("users");
      await collection.deleteOne({ _id: new ObjectId(this._id) });
      
      logger.info(`User deleted: ${this.username}`);
      return true;
    } catch (error) {
      logger.error("Failed to delete user:", error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   */
  static async findAll(limit = 50, skip = 0) {
    try {
      const collection = dbConnection.getCollection("users");
      const users = await collection
        .find({})
        .project({ password: 0 }) // Exclude passwords
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .toArray();

      return users.map(userData => new User(userData));
    } catch (error) {
      logger.error("Failed to find all users:", error);
      return [];
    }
  }

  /**
   * Count total users
   */
  static async count() {
    try {
      const collection = dbConnection.getCollection("users");
      return await collection.countDocuments();
    } catch (error) {
      logger.error("Failed to count users:", error);
      return 0;
    }
  }
}

export default User;