/**
 * Script Loader - Ensures reliable initialization order and dependency management
 * Fixes the issue where pages need to be reloaded to get all options working
 */

class ScriptLoader {
  constructor() {
    this.loadedScripts = new Set();
    this.pendingScripts = new Map();
    this.initCallbacks = [];
    this.retryAttempts = new Map();
    this.maxRetries = 3;

    // Track required dependencies
    this.dependencies = {
      "cookie-utils": ["getCookie", "setCookie"],
      main: ["changeTheme", "toggleAboutBlank"],
      utils: ["showNotification", "fadeIn", "fadeOut"],
      features: ["SlowGuardianFeatures"],
      "plugin-system": ["PluginSystem"],
      "performance-mode": ["PerformanceMode"],
      "moveable-buttons": ["MoveableButtons"],
    };

    this.checkInitialization();
  }

  // Check if all required dependencies are available
  checkDependencies(scriptName) {
    const deps = this.dependencies[scriptName];
    if (!deps) return true;

    return deps.every((dep) => {
      const available = this.isGlobalAvailable(dep);
      if (!available) {
        console.warn(`Dependency ${dep} not available for ${scriptName}`);
      }
      return available;
    });
  }

  // Check if a global function/object is available
  isGlobalAvailable(name) {
    try {
      // Check window object first
      if (typeof window[name] !== "undefined") {
        return true;
      }

      // Check global scope
      if (typeof globalThis[name] !== "undefined") {
        return true;
      }

      // For function names, try to evaluate safely
      try {
        const value = eval(`typeof ${name}`);
        return value !== "undefined";
      } catch (evalError) {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  // Wait for a script to load with retry mechanism
  async waitForScript(scriptName, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkScript = () => {
        if (this.checkDependencies(scriptName)) {
          this.loadedScripts.add(scriptName);
          resolve();
          return;
        }

        if (Date.now() - startTime > timeout) {
          const attempts = this.retryAttempts.get(scriptName) || 0;
          if (attempts < this.maxRetries) {
            console.warn(`Retrying ${scriptName} (attempt ${attempts + 1})`);
            this.retryAttempts.set(scriptName, attempts + 1);
            setTimeout(checkScript, 1000);
          } else {
            console.error(
              `Failed to load ${scriptName} after ${this.maxRetries} attempts`
            );
            reject(new Error(`Script ${scriptName} failed to load`));
          }
          return;
        }

        setTimeout(checkScript, 100);
      };

      checkScript();
    });
  }

  // Initialize a script with proper error handling
  async initializeScript(scriptName, initFunction) {
    try {
      await this.waitForScript(scriptName);

      if (typeof initFunction === "function") {
        console.log(`✅ Initializing ${scriptName}`);
        await initFunction();
        console.log(`✅ ${scriptName} initialized successfully`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to initialize ${scriptName}:`, error);

      // Try to show user-friendly error notification
      if (window.showNotification) {
        window.showNotification(
          `Some features may not be available. Try refreshing the page.`,
          "warning"
        );
      }

      return false;
    }
  }

  // Add initialization callback to run when all dependencies are ready
  onReady(callback) {
    if (typeof callback === "function") {
      this.initCallbacks.push(callback);
    }
  }

  // Check overall initialization status
  checkInitialization() {
    const checkInterval = setInterval(() => {
      // Check if basic dependencies are available
      const basicDeps = ["getCookie", "setCookie", "showNotification"];
      const allBasicReady = basicDeps.every((dep) =>
        this.isGlobalAvailable(dep)
      );

      if (allBasicReady || this.initCallbacks.length === 0) {
        clearInterval(checkInterval);
        this.runInitCallbacks();
      }
    }, 500);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (this.initCallbacks.length > 0) {
        console.warn(
          "Some initialization callbacks may not have run due to missing dependencies"
        );
        this.runInitCallbacks();
      }
    }, 10000);
  }

  // Run all pending initialization callbacks
  runInitCallbacks() {
    console.log("🚀 Running initialization callbacks...");
    this.initCallbacks.forEach((callback, index) => {
      try {
        callback();
        console.log(`✅ Init callback ${index + 1} completed`);
      } catch (error) {
        console.error(`❌ Init callback ${index + 1} failed:`, error);
      }
    });
    this.initCallbacks = [];
  }

  // Enhanced script loading with dependency checking
  loadScript(src, scriptName) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (this.loadedScripts.has(scriptName)) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;

      script.onload = async () => {
        try {
          await this.waitForScript(scriptName, 3000);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      script.onerror = () => {
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  }
}

// Create global script loader instance
window.scriptLoader = new ScriptLoader();

// Enhanced DOMContentLoaded wrapper that waits for dependencies
window.whenReady = function (callback, dependencies = []) {
  const wrappedCallback = async () => {
    try {
      // Wait for specific dependencies if provided
      if (dependencies.length > 0) {
        await Promise.all(
          dependencies.map((dep) =>
            window.scriptLoader.waitForScript(dep, 5000)
          )
        );
      }

      callback();
    } catch (error) {
      console.error("whenReady callback failed:", error);
      // Still try to run the callback even if dependencies failed
      try {
        callback();
      } catch (callbackError) {
        console.error("Callback execution failed:", callbackError);
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wrappedCallback);
  } else {
    // DOM already loaded, run immediately
    setTimeout(wrappedCallback, 0);
  }
};

// Utility function to safely call functions that might not be loaded yet
window.safeCall = function (functionName, args = [], fallback = null) {
  try {
    const func =
      typeof functionName === "string" ? eval(functionName) : functionName;

    if (typeof func === "function") {
      return func.apply(window, args);
    } else {
      console.warn(`Function ${functionName} not available`);
      return fallback;
    }
  } catch (error) {
    console.warn(`Error calling ${functionName}:`, error);
    return fallback;
  }
};

console.log("📦 Script Loader initialized");
