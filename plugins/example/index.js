/**
 * Example Plugin for SlowGuardian v9
 * Demonstrates the plugin system capabilities
 */

export default {
  name: "example-plugin",
  version: "1.0.0",
  description: "Example plugin demonstrating SlowGuardian v9 plugin system",
  author: "SlowGuardian Team",

  /**
   * Plugin initialization
   */
  onLoad(app, config, pluginManager) {
    console.log("🔌 Example plugin loaded!");
    
    // Listen to plugin manager events
    pluginManager.on("pluginLoaded", (pluginName) => {
      if (pluginName !== this.name) {
        console.log(`📦 Plugin loaded: ${pluginName}`);
      }
    });
  },

  /**
   * Plugin cleanup
   */
  onUnload() {
    console.log("🔌 Example plugin unloaded!");
  },

  /**
   * Plugin routes
   */
  routes: [
    {
      method: "GET",
      path: "/api/plugins/example/hello",
      handler: (req, res) => {
        res.json({
          message: "Hello from the example plugin!",
          plugin: "example-plugin",
          version: "1.0.0",
          timestamp: new Date().toISOString(),
        });
      },
    },
    {
      method: "GET",
      path: "/api/plugins/example/info",
      handler: (req, res) => {
        res.json({
          name: "example-plugin",
          version: "1.0.0",
          description: "Example plugin for SlowGuardian v9",
          features: [
            "API endpoints",
            "Event handling",
            "Configuration management",
          ],
          endpoints: [
            "/api/plugins/example/hello",
            "/api/plugins/example/info",
          ],
        });
      },
    },
  ],

  /**
   * Plugin middleware
   */
  middleware: [
    {
      path: "/api/plugins/example",
      handler: (req, res, next) => {
        // Add plugin identifier header
        res.set("X-Plugin", "example-plugin");
        next();
      },
    },
  ],
};