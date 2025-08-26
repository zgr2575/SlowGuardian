/**
 * Plugin Manager for SlowGuardian
 * Handles loading, managing, and executing plugins
 */

import { readdir, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { EventEmitter } from "node:events";
import { Logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class PluginManager extends EventEmitter {
  constructor(app, config) {
    super();
    this.app = app;
    this.config = config;
    this.plugins = new Map();
    this.pluginDir = join(__dirname, "../../plugins");
    this.logger = new Logger("PluginManager");
  }

  /**
   * Load all plugins from the plugins directory
   */
  async loadPlugins() {
    this.logger.info("Loading plugins...");

    try {
      const pluginDirs = await this.discoverPlugins();
      
      for (const pluginDir of pluginDirs) {
        await this.loadPlugin(pluginDir);
      }

      this.logger.info(`Loaded ${this.plugins.size} plugins`);
    } catch (error) {
      this.logger.error("Error loading plugins:", error);
    }
  }

  /**
   * Discover plugin directories
   */
  async discoverPlugins() {
    const pluginDirs = [];

    try {
      const entries = await readdir(this.pluginDir);
      
      for (const entry of entries) {
        const pluginPath = join(this.pluginDir, entry);
        const stats = await stat(pluginPath);
        
        if (stats.isDirectory()) {
          pluginDirs.push(pluginPath);
        }
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        this.logger.error("Error discovering plugins:", error);
      }
    }

    return pluginDirs;
  }

  /**
   * Load a single plugin
   */
  async loadPlugin(pluginPath) {
    try {
      const pluginFile = join(pluginPath, "index.js");
      const { default: plugin } = await import(`file://${pluginFile}`);

      // Validate plugin
      if (!this.validatePlugin(plugin)) {
        return;
      }

      // Initialize plugin
      const pluginInstance = new PluginInstance(plugin, pluginPath, this);
      
      // Store plugin
      this.plugins.set(plugin.name, pluginInstance);

      // Load plugin
      await pluginInstance.load();

      this.logger.info(`Loaded plugin: ${plugin.name} v${plugin.version}`);
      this.emit("pluginLoaded", plugin.name);

    } catch (error) {
      this.logger.error(`Error loading plugin from ${pluginPath}:`, error);
    }
  }

  /**
   * Validate plugin structure
   */
  validatePlugin(plugin) {
    if (!plugin.name || typeof plugin.name !== "string") {
      this.logger.error("Plugin missing or invalid name");
      return false;
    }

    if (!plugin.version || typeof plugin.version !== "string") {
      this.logger.error(`Plugin ${plugin.name} missing or invalid version`);
      return false;
    }

    return true;
  }

  /**
   * Get a plugin by name
   */
  getPlugin(name) {
    return this.plugins.get(name);
  }

  /**
   * Get all loaded plugins
   */
  getPlugins() {
    return Array.from(this.plugins.values());
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      return;
    }

    try {
      await plugin.unload();
      this.plugins.delete(name);
      this.logger.info(`Unloaded plugin: ${name}`);
      this.emit("pluginUnloaded", name);
    } catch (error) {
      this.logger.error(`Error unloading plugin ${name}:`, error);
    }
  }

  /**
   * Get event emitter for plugin communication
   */
  getEventEmitter() {
    return this;
  }

  /**
   * Register a service for cross-plugin communication
   */
  registerService(name, service) {
    this.services = this.services || new Map();
    this.services.set(name, service);
    this.logger.debug(`Service registered: ${name}`);
  }

  /**
   * Get a registered service
   */
  getService(name) {
    return this.services?.get(name);
  }
}

/**
 * Plugin Instance wrapper
 */
class PluginInstance {
  constructor(plugin, path, manager) {
    this.plugin = plugin;
    this.path = path;
    this.manager = manager;
    this.logger = new Logger(`Plugin:${plugin.name}`);
    this.loaded = false;
  }

  /**
   * Load the plugin
   */
  async load() {
    if (this.loaded) {
      return;
    }

    try {
      // Setup plugin routes
      if (this.plugin.routes) {
        this.setupRoutes();
      }

      // Setup plugin middleware
      if (this.plugin.middleware) {
        this.setupMiddleware();
      }

      // Call plugin onLoad hook
      if (typeof this.plugin.onLoad === "function") {
        await this.plugin.onLoad(this.manager.app, this.manager.config, this.manager);
      }

      this.loaded = true;
    } catch (error) {
      this.logger.error("Error during plugin load:", error);
      throw error;
    }
  }

  /**
   * Unload the plugin
   */
  async unload() {
    if (!this.loaded) {
      return;
    }

    try {
      // Call plugin onUnload hook
      if (typeof this.plugin.onUnload === "function") {
        await this.plugin.onUnload();
      }

      this.loaded = false;
    } catch (error) {
      this.logger.error("Error during plugin unload:", error);
      throw error;
    }
  }

  /**
   * Setup plugin routes
   */
  setupRoutes() {
    for (const route of this.plugin.routes) {
      const method = (route.method || "GET").toLowerCase();
      const path = route.path;
      const handler = route.handler;

      if (!this.manager.app[method]) {
        this.logger.error(`Invalid HTTP method: ${method}`);
        continue;
      }

      // Wrap handler with error handling
      const wrappedHandler = async (req, res, next) => {
        try {
          await handler(req, res, next);
        } catch (error) {
          this.logger.error(`Error in route ${method.toUpperCase()} ${path}:`, error);
          next(error);
        }
      };

      // Apply middleware if specified
      if (route.middleware && Array.isArray(route.middleware)) {
        this.manager.app[method](path, ...route.middleware, wrappedHandler);
      } else {
        this.manager.app[method](path, wrappedHandler);
      }

      this.logger.debug(`Registered route: ${method.toUpperCase()} ${path}`);
    }
  }

  /**
   * Setup plugin middleware
   */
  setupMiddleware() {
    for (const middleware of this.plugin.middleware) {
      const path = middleware.path || "/";
      const handler = middleware.handler;

      // Wrap middleware with error handling
      const wrappedMiddleware = async (req, res, next) => {
        try {
          await handler(req, res, next);
        } catch (error) {
          this.logger.error(`Error in middleware for ${path}:`, error);
          next(error);
        }
      };

      this.manager.app.use(path, wrappedMiddleware);
      this.logger.debug(`Registered middleware for: ${path}`);
    }
  }

  /**
   * Get plugin metadata
   */
  getMetadata() {
    return {
      name: this.plugin.name,
      version: this.plugin.version,
      description: this.plugin.description || "",
      author: this.plugin.author || "",
      loaded: this.loaded,
      path: this.path,
    };
  }
}