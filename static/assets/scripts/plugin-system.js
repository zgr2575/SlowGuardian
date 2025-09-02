/**
 * SlowGuardian v9 Plugin System
 * Complete plugin architecture with loading, management, and API
 */

class PluginSystem {
  constructor() {
    // Wait for dependencies before initializing
    if (window.scriptLoader) {
      window.scriptLoader.onReady(() => this.initialize());
    } else {
      // Fallback initialization
      setTimeout(() => this.initialize(), 1000);
    }
  }

  initialize() {
    // Ensure getCookie is available
    if (typeof getCookie !== "function") {
      console.warn("getCookie not available, using localStorage fallback");
      window.getCookie = () => null;
      window.setCookie = () => {};
    }

    this.plugins = new Map();
    this.hooks = new Map();
    this.pluginDirectory = "/plugins/";
    this.enabledPlugins = JSON.parse(
      getCookie("enabled-plugins") ||
        localStorage.getItem("enabled-plugins") ||
        "[]"
    );
    this.pluginStore = new Map();
    this.init();
  }

  async init() {
    console.log("🔌 Initializing Plugin System...");
    this.registerCoreHooks();
    await this.loadCorePlugins();
    await this.loadUserPlugins();
    this.createPluginManager();
    console.log("✅ Plugin System initialized");

    // Mark module as loaded
    if (typeof window.markModuleLoaded === "function") {
      window.markModuleLoaded("plugin-system");
    }
  }

  registerCoreHooks() {
    // Core hooks for plugin integration
    this.hooks.set("page_load", []);
    this.hooks.set("before_navigation", []);
    this.hooks.set("after_navigation", []);
    this.hooks.set("proxy_request", []);
    this.hooks.set("settings_change", []);
    this.hooks.set("theme_change", []);
    this.hooks.set("user_action", []);
  }

  async loadCorePlugins() {
    // Load essential plugins that come with SlowGuardian - all disabled by default
    const corePlugins = [
      "notes-manager",
      "bookmark-system",
      "password-manager",
      "download-manager",
      "theme-creator",
    ];

    // Only load core plugins if they are explicitly enabled
    for (const pluginId of corePlugins) {
      if (this.enabledPlugins.includes(pluginId)) {
        try {
          await this.loadPlugin(pluginId, true);
        } catch (error) {
          console.warn(`Failed to load core plugin ${pluginId}:`, error);
        }
      }
    }
  }

  async loadUserPlugins() {
    // Load user-enabled plugins
    for (const pluginId of this.enabledPlugins) {
      try {
        await this.loadPlugin(pluginId, false);
      } catch (error) {
        console.warn(`Failed to load user plugin ${pluginId}:`, error);
      }
    }
  }

  async loadPlugin(pluginId, isCore = false) {
    try {
      const pluginPath = isCore
        ? `/assets/plugins/${pluginId}/`
        : `${this.pluginDirectory}${pluginId}/`;

      // Load plugin manifest
      const manifestResponse = await fetch(`${pluginPath}manifest.json`);
      if (!manifestResponse.ok) {
        throw new Error(`Plugin manifest not found: ${pluginId}`);
      }

      const manifest = await manifestResponse.json();

      // Validate plugin
      if (!this.validatePlugin(manifest)) {
        throw new Error(`Invalid plugin manifest: ${pluginId}`);
      }

      // Load plugin script
      const script = document.createElement("script");
      script.src = `${pluginPath}plugin.js`;
      script.onload = () => {
        console.log(`✅ Plugin loaded: ${manifest.name} v${manifest.version}`);
      };
      script.onerror = () => {
        throw new Error(`Failed to load plugin script: ${pluginId}`);
      };

      document.head.appendChild(script);

      // Store plugin info
      this.plugins.set(pluginId, {
        manifest,
        isCore,
        loaded: true,
        enabled: isCore || this.enabledPlugins.includes(pluginId),
      });

      return manifest;
    } catch (error) {
      console.error(`Error loading plugin ${pluginId}:`, error);
      throw error;
    }
  }

  validatePlugin(manifest) {
    const required = ["id", "name", "version", "description", "author"];
    return required.every((field) => manifest[field]);
  }

  registerPlugin(pluginId, pluginInstance) {
    if (this.plugins.has(pluginId)) {
      const plugin = this.plugins.get(pluginId);
      plugin.instance = pluginInstance;

      // Initialize plugin if it's enabled
      if (plugin.enabled && pluginInstance.init) {
        pluginInstance.init();
      }

      console.log(`🔌 Plugin registered: ${pluginId}`);
    }
  }

  enablePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.enabled = true;

      if (!this.enabledPlugins.includes(pluginId)) {
        this.enabledPlugins.push(pluginId);
        this.saveEnabledPlugins();
      }

      if (plugin.instance && plugin.instance.enable) {
        plugin.instance.enable();
      }

      this.runHook("plugin_enabled", { pluginId, plugin });
    }
  }

  disablePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (plugin && !plugin.isCore) {
      plugin.enabled = false;

      const index = this.enabledPlugins.indexOf(pluginId);
      if (index > -1) {
        this.enabledPlugins.splice(index, 1);
        this.saveEnabledPlugins();
      }

      if (plugin.instance && plugin.instance.disable) {
        plugin.instance.disable();
      }

      this.runHook("plugin_disabled", { pluginId, plugin });
    }
  }

  saveEnabledPlugins() {
    setCookie("enabled-plugins", JSON.stringify(this.enabledPlugins));
    localStorage.setItem(
      "enabled-plugins",
      JSON.stringify(this.enabledPlugins)
    );
  }

  addHook(hookName, callback, pluginId) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }

    this.hooks.get(hookName).push({ callback, pluginId });
  }

  runHook(hookName, data = {}) {
    const hooks = this.hooks.get(hookName) || [];

    hooks.forEach(({ callback, pluginId }) => {
      try {
        const plugin = this.plugins.get(pluginId);
        if (!plugin || plugin.enabled) {
          callback(data);
        }
      } catch (error) {
        console.error(
          `Error in hook ${hookName} for plugin ${pluginId}:`,
          error
        );
      }
    });
  }

  createPluginManager() {
    // Create plugin management interface
    const style = document.createElement("style");
    style.textContent = `
      .plugin-manager {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        border-radius: 12px;
        padding: 20px;
        min-width: 300px;
        max-height: 400px;
        overflow-y: auto;
        z-index: 10000;
        display: none;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      }
      
      .plugin-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-secondary);
      }
      
      .plugin-info h4 {
        margin: 0;
        color: var(--text-primary);
      }
      
      .plugin-info small {
        color: var(--text-secondary);
      }
      
      .plugin-toggle {
        position: relative;
        width: 44px;
        height: 24px;
      }
      
      .plugin-toggle input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .plugin-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.4s;
        border-radius: 24px;
      }
      
      .plugin-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
      }
      
      input:checked + .plugin-slider {
        background-color: var(--accent-primary);
      }
      
      input:checked + .plugin-slider:before {
        transform: translateX(20px);
      }
    `;
    document.head.appendChild(style);
  }

  showPluginManager() {
    let manager = document.getElementById("plugin-manager");

    if (!manager) {
      manager = document.createElement("div");
      manager.id = "plugin-manager";
      manager.className = "plugin-manager";
      document.body.appendChild(manager);
    }

    manager.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; color: var(--text-primary);">🔌 Plugin Manager</h3>
        <button onclick="window.pluginSystem.hidePluginManager()" style="background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer;">&times;</button>
      </div>
      
      <div class="plugin-list">
        ${Array.from(this.plugins.entries())
          .map(
            ([id, plugin]) => `
          <div class="plugin-item">
            <div class="plugin-info">
              <h4>${plugin.manifest.name}</h4>
              <small>v${plugin.manifest.version} by ${plugin.manifest.author}</small>
              <br><small>${plugin.manifest.description}</small>
            </div>
            <label class="plugin-toggle">
              <input type="checkbox" ${plugin.enabled ? "checked" : ""} 
                     onchange="window.pluginSystem.togglePlugin('${id}', this.checked)"
                     ${plugin.isCore ? "disabled" : ""}>
              <span class="plugin-slider"></span>
            </label>
          </div>
        `
          )
          .join("")}
      </div>
      
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-secondary);">
        <button onclick="window.pluginSystem.showPluginStore()" class="btn btn-primary">
          📦 Plugin Store
        </button>
        <button onclick="window.pluginSystem.showPluginDocs()" class="btn btn-secondary">
          📚 Developer Docs
        </button>
      </div>
    `;

    manager.style.display = "block";
  }

  hidePluginManager() {
    const manager = document.getElementById("plugin-manager");
    if (manager) {
      manager.style.display = "none";
    }
  }

  togglePlugin(pluginId, enabled) {
    if (enabled) {
      this.enablePlugin(pluginId);
    } else {
      this.disablePlugin(pluginId);
    }
  }

  showPluginStore() {
    // Plugin store implementation
    this.showNotification("Plugin Store - Coming soon!", "info");
  }

  showPluginDocs() {
    // Open plugin development documentation
    const docs = window.open("", "_blank");
    docs.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SlowGuardian Plugin Development Guide</title>
        <style>
          body { font-family: 'Inter', sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1, h2, h3 { color: #333; }
          code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
          pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
          .example { border-left: 4px solid #007acc; padding-left: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <h1>🔌 SlowGuardian Plugin Development Guide</h1>
        
        <h2>Getting Started</h2>
        <p>SlowGuardian plugins are JavaScript modules that extend the functionality of the proxy system.</p>
        
        <h2>Plugin Structure</h2>
        <pre>
/plugins/your-plugin-name/
  ├── manifest.json
  ├── plugin.js
  ├── styles.css (optional)
  └── assets/ (optional)
        </pre>
        
        <h2>Manifest Format</h2>
        <div class="example">
          <pre>
{
  "id": "your-plugin-name",
  "name": "Your Plugin Name",
  "version": "1.0.0",
  "description": "What your plugin does",
  "author": "Your Name",
  "permissions": ["storage", "proxy"],
  "hooks": ["page_load", "proxy_request"]
}
          </pre>
        </div>
        
        <h2>Plugin Template</h2>
        <div class="example">
          <pre>
class YourPlugin {
  constructor() {
    this.name = 'Your Plugin Name';
    this.version = '1.0.0';
  }
  
  init() {
    console.log('Plugin initialized');
    this.setupUI();
    this.registerHooks();
  }
  
  enable() {
    console.log('Plugin enabled');
  }
  
  disable() {
    console.log('Plugin disabled');
  }
  
  setupUI() {
    // Create plugin interface
  }
  
  registerHooks() {
    // Register event hooks
    window.pluginSystem.addHook('page_load', (data) => {
      this.onPageLoad(data);
    }, 'your-plugin-name');
  }
  
  onPageLoad(data) {
    // Handle page load
  }
}

// Register plugin
window.pluginSystem.registerPlugin('your-plugin-name', new YourPlugin());
          </pre>
        </div>
        
        <h2>Available Hooks</h2>
        <ul>
          <li><code>page_load</code> - Fired when a page loads</li>
          <li><code>before_navigation</code> - Before navigating to a page</li>
          <li><code>after_navigation</code> - After navigating to a page</li>
          <li><code>proxy_request</code> - When a proxy request is made</li>
          <li><code>settings_change</code> - When settings are changed</li>
          <li><code>theme_change</code> - When theme is changed</li>
          <li><code>user_action</code> - Generic user actions</li>
        </ul>
        
        <h2>API Functions</h2>
        <ul>
          <li><code>window.pluginSystem.addHook(name, callback, pluginId)</code></li>
          <li><code>window.pluginSystem.runHook(name, data)</code></li>
          <li><code>window.pluginSystem.enablePlugin(id)</code></li>
          <li><code>window.pluginSystem.disablePlugin(id)</code></li>
        </ul>
        
        <h2>Best Practices</h2>
        <ul>
          <li>Always check if elements exist before manipulating them</li>
          <li>Use proper error handling</li>
          <li>Clean up event listeners when disabled</li>
          <li>Test your plugin in different browser environments</li>
          <li>Follow semantic versioning</li>
        </ul>
      </body>
      </html>
    `);
  }

  showNotification(message, type = "info") {
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }
}

// Export for modules - no automatic initialization
if (typeof module !== "undefined") {
  module.exports = PluginSystem;
} else {
  // Initialize plugin system when script loads - only if enabled
  whenReady(() => {
    if (!window.pluginSystem) {
      // Check if plugins are enabled by user preference
      const pluginsEnabled = getCookie("feature-plugins") === "true" || 
                            localStorage.getItem("feature-plugins") === "true";
      
      if (pluginsEnabled) {
        console.log("🔌 Creating PluginSystem instance...");
        window.pluginSystem = new PluginSystem();
      } else {
        console.log("🔌 Plugin System disabled by user preference");
      }
    }
  }, ["cookie-utils"]);
}
