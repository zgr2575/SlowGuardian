# Plugin Development Guide

SlowGuardian v9 features a powerful plugin system that allows you to extend functionality without
modifying the core codebase.

## Getting Started

### Plugin Structure

A basic plugin follows this structure:

```javascript
export default {
  // Plugin metadata
  name: "my-awesome-plugin",
  version: "1.0.0",
  description: "An awesome plugin for SlowGuardian",
  author: "Your Name",
  license: "MIT",

  // Plugin configuration
  config: {
    enabled: true,
    settings: {
      // Plugin-specific settings
    },
  },

  // Lifecycle hooks
  onLoad(app, config, pluginManager) {
    console.log("Plugin loaded!");
  },

  onUnload() {
    console.log("Plugin unloaded!");
  },

  // Express routes
  routes: [
    {
      method: "GET",
      path: "/api/plugin/example",
      handler: (req, res) => {
        res.json({ message: "Hello from plugin!" });
      },
    },
  ],

  // Express middleware
  middleware: [
    {
      path: "/",
      handler: (req, res, next) => {
        // Middleware logic
        next();
      },
    },
  ],

  // Frontend assets
  assets: {
    css: ["styles/plugin.css"],
    js: ["scripts/plugin.js"],
    static: ["images/", "fonts/"],
  },

  // Frontend components
  components: {
    navbar: {
      template: "components/navbar-item.html",
      script: "components/navbar-item.js",
    },
  },
};
```

### Creating Your First Plugin

1. **Create plugin directory**

   ```bash
   mkdir plugins/my-plugin
   cd plugins/my-plugin
   ```

2. **Create package.json**

   ```json
   {
     "name": "slowguardian-my-plugin",
     "version": "1.0.0",
     "description": "My first SlowGuardian plugin",
     "main": "index.js",
     "type": "module"
   }
   ```

3. **Create plugin entry point**

   ```javascript
   // plugins/my-plugin/index.js
   export default {
     name: "my-plugin",
     version: "1.0.0",
     description: "My first plugin",

     onLoad(app) {
       console.log("My plugin is loading!");
     },

     routes: [
       {
         method: "GET",
         path: "/api/my-plugin/hello",
         handler: (req, res) => {
           res.json({
             message: "Hello from my plugin!",
             timestamp: new Date().toISOString(),
           });
         },
       },
     ],
   };
   ```

## Plugin API Reference

### Lifecycle Hooks

#### onLoad(app, config, pluginManager)

Called when the plugin is loaded.

**Parameters:**

- `app` - Express application instance
- `config` - SlowGuardian configuration object
- `pluginManager` - Plugin manager instance

#### onUnload()

Called when the plugin is unloaded.

#### onConfigChange(newConfig)

Called when plugin configuration changes.

### Routes

Define custom API endpoints:

```javascript
routes: [
  {
    method: "GET|POST|PUT|DELETE",
    path: "/api/plugin/endpoint",
    middleware: [
      /* optional middleware */
    ],
    handler: (req, res) => {
      // Route handler
    },
  },
];
```

### Middleware

Add Express middleware:

```javascript
middleware: [
  {
    path: "/", // Path pattern
    handler: (req, res, next) => {
      // Middleware logic
      next();
    },
  },
];
```

### Frontend Integration

#### Static Assets

Serve static files from your plugin:

```javascript
assets: {
  static: ["public/"]; // Serves files from plugins/my-plugin/public/
}
```

#### CSS and JavaScript

Include CSS and JS files in pages:

```javascript
assets: {
  css: ["styles/plugin.css"],
  js: ["scripts/plugin.js"]
}
```

#### Frontend Components

Create reusable UI components:

```javascript
components: {
  "settings-panel": {
    template: "templates/settings.html",
    script: "scripts/settings.js",
    css: "styles/settings.css"
  }
}
```

## Advanced Features

### Database Integration

Access the database through the plugin API:

```javascript
onLoad(app, config, pluginManager) {
  const db = pluginManager.getDatabase();

  // Store plugin data
  db.set("my-plugin:setting", "value");

  // Retrieve plugin data
  const value = db.get("my-plugin:setting");
}
```

### Configuration Management

Handle plugin configuration:

```javascript
export default {
  config: {
    enabled: true,
    apiKey: "",
    timeout: 5000,
  },

  onConfigChange(newConfig) {
    // React to configuration changes
    this.apiKey = newConfig.apiKey;
  },
};
```

### Event System

Listen to and emit events:

```javascript
onLoad(app, config, pluginManager) {
  const events = pluginManager.getEventEmitter();

  // Listen to events
  events.on("proxy.request", (data) => {
    console.log("Proxy request:", data.url);
  });

  // Emit custom events
  events.emit("my-plugin.action", { data: "example" });
}
```

### Cross-Plugin Communication

Communicate with other plugins:

```javascript
onLoad(app, config, pluginManager) {
  // Get another plugin
  const otherPlugin = pluginManager.getPlugin("other-plugin");

  if (otherPlugin) {
    // Call plugin methods
    otherPlugin.doSomething();
  }

  // Register service for other plugins
  pluginManager.registerService("my-service", {
    method1: () => "result",
    method2: (param) => `Hello ${param}`
  });
}
```

## Security Considerations

### Input Validation

Always validate user input:

```javascript
routes: [
  {
    method: "POST",
    path: "/api/plugin/data",
    handler: (req, res) => {
      const { data } = req.body;

      // Validate input
      if (!data || typeof data !== "string") {
        return res.status(400).json({ error: "Invalid data" });
      }

      // Sanitize if needed
      const sanitized = data.replace(/<script>/gi, "");

      res.json({ success: true });
    },
  },
];
```

### Permission System

Check permissions before executing actions:

```javascript
onLoad(app, config, pluginManager) {
  const auth = pluginManager.getAuth();

  app.get("/api/plugin/admin", auth.requireAdmin, (req, res) => {
    // Admin-only endpoint
  });
}
```

## Testing Plugins

### Unit Testing

Create tests for your plugin:

```javascript
// test/plugin.test.js
import plugin from "../plugins/my-plugin/index.js";
import { describe, it, expect } from "node:test";

describe("My Plugin", () => {
  it("should have correct metadata", () => {
    expect(plugin.name).toBe("my-plugin");
    expect(plugin.version).toBe("1.0.0");
  });

  it("should handle routes correctly", () => {
    const route = plugin.routes[0];
    expect(route.path).toBe("/api/my-plugin/hello");
  });
});
```

### Integration Testing

Test plugin integration with SlowGuardian:

```javascript
import request from "supertest";
import app from "../index.js";

describe("Plugin Integration", () => {
  it("should respond to plugin routes", async () => {
    const response = await request(app).get("/api/my-plugin/hello").expect(200);

    expect(response.body.message).toBe("Hello from my plugin!");
  });
});
```

## Publishing Plugins

### Plugin Manifest

Create a plugin manifest:

```json
{
  "name": "slowguardian-my-plugin",
  "version": "1.0.0",
  "description": "My awesome plugin",
  "author": "Your Name",
  "license": "MIT",
  "keywords": ["slowguardian", "plugin"],
  "repository": "https://github.com/user/my-plugin",
  "slowguardian": {
    "minVersion": "9.0.0",
    "maxVersion": "9.x"
  }
}
```

### Distribution

1. **GitHub Repository**
   - Create a public repository
   - Include comprehensive README
   - Add installation instructions

2. **npm Package**

   ```bash
   npm publish
   ```

3. **Plugin Registry**
   - Submit to SlowGuardian plugin registry
   - Include screenshots and documentation

## Examples

### Authentication Plugin

```javascript
export default {
  name: "custom-auth",
  version: "1.0.0",

  middleware: [
    {
      path: "/admin",
      handler: (req, res, next) => {
        const token = req.headers.authorization;
        if (!this.validateToken(token)) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        next();
      },
    },
  ],

  validateToken(token) {
    // Token validation logic
    return token === "valid-token";
  },
};
```

### Analytics Plugin

```javascript
export default {
  name: "analytics",
  version: "1.0.0",

  onLoad(app, config, pluginManager) {
    const events = pluginManager.getEventEmitter();

    events.on("proxy.request", (data) => {
      this.logRequest(data);
    });
  },

  routes: [
    {
      method: "GET",
      path: "/api/analytics/stats",
      handler: (req, res) => {
        res.json({
          totalRequests: this.totalRequests,
          topSites: this.getTopSites(),
        });
      },
    },
  ],

  logRequest(data) {
    // Analytics logic
  },
};
```

## Best Practices

1. **Namespace Everything**: Use plugin name as prefix for routes, events, and storage
2. **Handle Errors Gracefully**: Always include error handling
3. **Clean Up Resources**: Implement proper cleanup in onUnload
4. **Document Your Plugin**: Provide clear documentation and examples
5. **Test Thoroughly**: Include comprehensive tests
6. **Follow Security Guidelines**: Validate input and check permissions
7. **Version Compatibility**: Specify compatible SlowGuardian versions

## Getting Help

- **Documentation**: Check the full API documentation
- **Examples**: Browse the example plugins repository
- **Community**: Join the plugin developer discussions
- **Issues**: Report bugs or request features on GitHub

Happy plugin development! 🚀
