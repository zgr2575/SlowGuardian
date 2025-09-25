/**
 * Universal Loading System
 * Shows loading screen until all JavaScript modules are initialized
 */

class LoadingSystem {
  constructor() {
    this.loadedModules = new Set();

    // Build expected modules list based on user preferences
    this.expectedModules = ["cookie-utils", "main", "navbar"];

    // Check user preferences and add optional modules
    this.checkAndAddModule("features", "features");
    this.checkAndAddModule("plugin-system", "feature-plugins");
    this.checkAndAddModule("performance-mode", "feature-performance-mode");
    this.checkAndAddModule("moveable-buttons", "feature-moveable-buttons");
    this.checkAndAddModule("ads-manager", "ads-enabled");

    this.loadingStartTime = Date.now();
    this.minLoadingTime = 500; // Reduced minimum loading time
    this.maxLoadingTime = 5000; // Reduced maximum loading time to 5 seconds

    this.createLoadingScreen();
    this.startInitializationCheck();
  }

  checkAndAddModule(moduleName, preferenceKey) {
    // Check if the feature is enabled via cookie or localStorage
    const isEnabled =
      this.getCookie(preferenceKey) === "true" ||
      localStorage.getItem(preferenceKey) === "true";

    if (isEnabled) {
      this.expectedModules.push(moduleName);
      console.log(`📦 Module ${moduleName} enabled and will be expected`);
    } else {
      console.log(`📦 Module ${moduleName} disabled by user preference`);
    }
  }

  getCookie(name) {
    if (typeof getCookie === "function") {
      return getCookie(name);
    }
    // Fallback cookie implementation
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  createLoadingScreen() {
    // Create loading overlay
    const overlay = document.createElement("div");
    overlay.id = "slowguardian-loading-overlay";
    overlay.innerHTML = `
      <div class="loading-container">
        <div class="loading-logo">
          <div class="logo-icon">🛡️</div>
          <div class="logo-text">SlowGuardian</div>
          <div class="version-text">v9.0.0</div>
        </div>
        
        <div class="loading-progress">
          <div class="progress-bar">
            <div class="progress-fill" id="loading-progress-fill"></div>
          </div>
          <div class="loading-text" id="loading-text">Initializing modules...</div>
          <div class="loading-details" id="loading-details">Starting up...</div>
        </div>
        
        <div class="loading-modules" id="loading-modules">
          ${this.expectedModules
            .map(
              (module) => `
            <div class="module-status" data-module="${module}">
              <span class="module-icon">⏳</span>
              <span class="module-name">${this.formatModuleName(module)}</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    // Add loading styles
    const style = document.createElement("style");
    style.textContent = `
      #slowguardian-loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeInLoading 0.3s ease-in-out;
      }

      .loading-container {
        text-align: center;
        max-width: 500px;
        padding: 40px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
      }

      .loading-logo {
        margin-bottom: 30px;
      }

      .logo-icon {
        font-size: 60px;
        margin-bottom: 10px;
        animation: pulse 2s ease-in-out infinite;
      }

      .logo-text {
        font-size: 32px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 5px;
      }

      .version-text {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
      }

      .loading-progress {
        margin-bottom: 30px;
      }

      .progress-bar {
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 15px;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #6366f1, #8b5cf6);
        border-radius: 3px;
        width: 0%;
        transition: width 0.3s ease;
        animation: shimmer 2s ease-in-out infinite;
      }

      .loading-text {
        font-size: 18px;
        color: #ffffff;
        margin-bottom: 5px;
        font-weight: 500;
      }

      .loading-details {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
      }

      .loading-modules {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
        margin-top: 20px;
      }

      .module-status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
      }

      .module-status.loaded {
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
      }

      .module-status.loaded .module-icon {
        color: #22c55e;
      }

      .module-status.error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
      }

      .module-status.error .module-icon {
        color: #ef4444;
      }

      @keyframes fadeInLoading {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }

      @keyframes shimmer {
        0% { opacity: 0.8; }
        50% { opacity: 1; }
        100% { opacity: 0.8; }
      }

      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      #slowguardian-loading-overlay.fade-out {
        animation: fadeOut 0.5s ease-in-out forwards;
      }

      @media (max-width: 768px) {
        .loading-container {
          margin: 20px;
          padding: 30px 20px;
        }
        
        .loading-modules {
          grid-template-columns: 1fr;
        }
      }
    `;

    // Insert at the very beginning of body
    document.head.appendChild(style);
    document.body.insertBefore(overlay, document.body.firstChild);
  }

  formatModuleName(module) {
    return module
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  updateProgress() {
    const progressFill = document.getElementById("loading-progress-fill");
    const loadingText = document.getElementById("loading-text");
    const loadingDetails = document.getElementById("loading-details");

    if (!progressFill) return;

    const progress =
      (this.loadedModules.size / this.expectedModules.length) * 100;
    progressFill.style.width = `${progress}%`;

    if (this.loadedModules.size === 0) {
      loadingText.textContent = "Initializing modules...";
      loadingDetails.textContent = "Starting up...";
    } else if (this.loadedModules.size < this.expectedModules.length) {
      loadingText.textContent = `Loading modules... (${this.loadedModules.size}/${this.expectedModules.length})`;
      loadingDetails.textContent = `Loaded: ${Array.from(this.loadedModules).join(", ")}`;
    } else {
      loadingText.textContent = "Finalizing...";
      loadingDetails.textContent = "All modules loaded successfully";
    }
  }

  markModuleLoaded(moduleName) {
    if (this.loadedModules.has(moduleName)) return;

    this.loadedModules.add(moduleName);

    // Update module status in UI
    const moduleElement = document.querySelector(
      `[data-module="${moduleName}"]`
    );
    if (moduleElement) {
      moduleElement.classList.add("loaded");
      const icon = moduleElement.querySelector(".module-icon");
      if (icon) icon.textContent = "✅";
    }

    this.updateProgress();
    console.log(
      `📦 Module loaded: ${moduleName} (${this.loadedModules.size}/${this.expectedModules.length})`
    );

    // Check if we can hide loading screen
    if (this.loadedModules.size >= this.expectedModules.length) {
      this.scheduleHideLoading();
    }
  }

  markModuleError(moduleName, error) {
    console.warn(`❌ Module failed: ${moduleName}`, error);

    const moduleElement = document.querySelector(
      `[data-module="${moduleName}"]`
    );
    if (moduleElement) {
      moduleElement.classList.add("error");
      const icon = moduleElement.querySelector(".module-icon");
      if (icon) icon.textContent = "❌";
    }
  }

  startInitializationCheck() {
    // Check every 100ms for module availability
    this.checkInterval = setInterval(() => {
      this.checkModuleAvailability();
    }, 100);

    // Fallback timeout with better handling
    setTimeout(() => {
      if (document.getElementById("slowguardian-loading-overlay")) {
        const loadedCount = this.loadedModules.size;
        const totalCount = this.expectedModules.length;
        
        // Check if critical modules are loaded
        const criticalModules = ["cookie-utils", "main", "navbar"];
        const criticalLoaded = criticalModules.filter(m => this.loadedModules.has(m)).length;
        
        if (criticalLoaded >= 3) {
          // All critical modules are loaded, proceed regardless of optional modules
          console.log(
            `⏰ Loading timeout reached, but all critical modules loaded (${criticalLoaded}/3) - proceeding`
          );
          this.hideLoading();
        } else if (loadedCount >= Math.floor(totalCount * 0.7)) {
          // If we have at least 70% of modules loaded, proceed
          console.log(
            `⏰ Loading timeout reached, but ${loadedCount}/${totalCount} modules loaded - proceeding`
          );
          this.hideLoading();
        } else {
          // If too few modules loaded, give more details
          const missing = this.expectedModules.filter(
            (m) => !this.loadedModules.has(m)
          );
          console.warn(
            `⏰ Loading timeout reached with only ${loadedCount}/${totalCount} modules loaded. Missing: ${missing.join(", ")}`
          );
          console.warn("Critical modules status:", criticalModules.map(m => `${m}: ${this.loadedModules.has(m) ? '✅' : '❌'}`).join(', '));
          this.hideLoading();
        }
      }
    }, this.maxLoadingTime);

    // Emergency timeout for critical failures
    setTimeout(() => {
      if (document.getElementById("slowguardian-loading-overlay")) {
        console.error("🚨 Emergency timeout - forcing loading screen removal");
        this.hideLoading();
      }
    }, this.maxLoadingTime + 5000);

    // Ultra-emergency timeout - remove loading overlay no matter what
    setTimeout(() => {
      const overlay = document.getElementById("slowguardian-loading-overlay");
      if (overlay) {
        console.error("💥 CRITICAL: Force removing stuck loading overlay");
        overlay.remove();
      }
    }, 20000);
  }

  checkModuleAvailability() {
    // Check for cookie-utils
    if (
      !this.loadedModules.has("cookie-utils") &&
      typeof window.getCookie === "function"
    ) {
      this.markModuleLoaded("cookie-utils");
    }

    // Check for main utilities
    if (
      !this.loadedModules.has("main") &&
      typeof window.changeTheme === "function"
    ) {
      this.markModuleLoaded("main");
    }

    // Check for navbar system
    if (
      !this.loadedModules.has("navbar") &&
      typeof window.sidebarNav !== "undefined"
    ) {
      this.markModuleLoaded("navbar");
    }

    // Check for features system (only if enabled)
    if (
      this.expectedModules.includes("features") &&
      !this.loadedModules.has("features") &&
      typeof window.SlowGuardianFeatures === "function"
    ) {
      this.markModuleLoaded("features");
    }

    // Check for plugin system (only if enabled)
    if (
      this.expectedModules.includes("plugin-system") &&
      !this.loadedModules.has("plugin-system") &&
      typeof window.PluginSystem === "function"
    ) {
      this.markModuleLoaded("plugin-system");
    }

    // Check for performance mode (only if enabled)
    if (
      this.expectedModules.includes("performance-mode") &&
      !this.loadedModules.has("performance-mode") &&
      typeof window.PerformanceMode === "function"
    ) {
      this.markModuleLoaded("performance-mode");
    }

    // Check for moveable buttons (only if enabled)
    if (
      this.expectedModules.includes("moveable-buttons") &&
      !this.loadedModules.has("moveable-buttons") &&
      typeof window.MoveableButtons === "function"
    ) {
      this.markModuleLoaded("moveable-buttons");
    }

    // Check for ads manager (only if enabled)
    if (
      this.expectedModules.includes("ads-manager") &&
      !this.loadedModules.has("ads-manager") &&
      typeof window.AdsManager === "function"
    ) {
      this.markModuleLoaded("ads-manager");
    }
  }

  scheduleHideLoading() {
    const elapsed = Date.now() - this.loadingStartTime;
    const remainingTime = Math.max(0, this.minLoadingTime - elapsed);

    setTimeout(() => {
      this.hideLoading();
    }, remainingTime);
  }

  hideLoading() {
    const overlay = document.getElementById("slowguardian-loading-overlay");
    if (!overlay) return;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    overlay.classList.add("fade-out");

    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      console.log("🚀 SlowGuardian fully loaded and ready!");

      // Dispatch custom event for other scripts to listen to
      window.dispatchEvent(new CustomEvent("slowguardian:ready"));
    }, 500);
  }

  // Public method to manually hide loading (for emergency cases)
  forceHide() {
    this.hideLoading();
  }
}

// Initialize loading system immediately when script loads
if (typeof window !== "undefined" && document.body) {
  window.slowGuardianLoader = new LoadingSystem();
} else {
  // If body isn't ready yet, wait for it
  document.addEventListener("DOMContentLoaded", () => {
    window.slowGuardianLoader = new LoadingSystem();
  });
}

// Global function to mark modules as loaded (for external scripts)
window.markModuleLoaded = function (moduleName) {
  if (window.slowGuardianLoader) {
    window.slowGuardianLoader.markModuleLoaded(moduleName);
  }
};

// Global function to force hide loading screen (for debugging)
window.forceHideLoading = function () {
  console.log("🔧 Manually forcing loading screen to hide...");
  const overlay = document.getElementById("slowguardian-loading-overlay");
  if (overlay) {
    overlay.remove();
    console.log("✅ Loading overlay removed");
  } else {
    console.log("ℹ️ No loading overlay found");
  }
  
  // Clear any timeouts
  if (window.slowGuardianLoader) {
    if (window.slowGuardianLoader.checkInterval) {
      clearInterval(window.slowGuardianLoader.checkInterval);
    }
    console.log("✅ Loading system cleaned up");
  }
};

// Global function to check loading status (for debugging)
window.checkLoadingStatus = function () {
  if (window.slowGuardianLoader) {
    const loader = window.slowGuardianLoader;
    console.log("🔍 Loading Status:");
    console.log("Expected modules:", loader.expectedModules);
    console.log("Loaded modules:", Array.from(loader.loadedModules));
    console.log("Missing modules:", loader.expectedModules.filter(m => !loader.loadedModules.has(m)));
    console.log("Loading overlay present:", !!document.getElementById("slowguardian-loading-overlay"));
  } else {
    console.log("❌ SlowGuardian loader not found");
  }
};

window.markModuleError = function (moduleName, error) {
  if (window.slowGuardianLoader) {
    window.slowGuardianLoader.markModuleError(moduleName, error);
  }
};
