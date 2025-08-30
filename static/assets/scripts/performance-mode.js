/**
 * Performance Mode for SlowGuardian v9
 * Optimized interface for less intensive laptops and slower devices
 */

class PerformanceMode {
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

    this.isPerformanceMode =
      getCookie("performance-mode") === "true" ||
      localStorage.getItem("performance-mode") === "true";
    this.performanceCSS = null;
    this.init();
  }

  init() {
    if (this.isPerformanceMode) {
      this.enablePerformanceMode();
    }

    // Add performance mode toggle to settings
    this.addPerformanceModeToggle();
  }

  enablePerformanceMode() {
    console.log("🚀 Enabling Performance Mode...");

    // Apply performance optimizations
    this.removeHeavyAnimations();
    this.optimizeParticles();
    this.reduceVisualEffects();
    this.optimizeLayout();

    // Store preference
    setCookie("performance-mode", "true", 365);
    localStorage.setItem("performance-mode", "true");

    console.log("✅ Performance Mode enabled");
  }

  disablePerformanceMode() {
    console.log("🔄 Disabling Performance Mode...");

    // Restore full visual effects
    this.restoreAnimations();
    this.restoreParticles();
    this.restoreVisualEffects();
    this.restoreLayout();

    // Store preference
    setCookie("performance-mode", "false", 365);
    localStorage.setItem("performance-mode", "false");

    console.log("✅ Performance Mode disabled");
  }

  removeHeavyAnimations() {
    // Disable heavy CSS animations for better performance
    const style = document.createElement("style");
    style.id = "performance-mode-animations";
    style.textContent = `
      /* Performance Mode - Reduced Animations */
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-delay: -1ms !important;
        transition-duration: 0.01ms !important;
        transition-delay: 0ms !important;
      }
      
      .particles-js-canvas-el {
        display: none !important;
      }
      
      .floating-shapes * {
        animation: none !important;
      }
      
      .bg-gradient {
        background: #1a1a2e !important;
        animation: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  optimizeParticles() {
    // Disable particles for better performance
    const particlesContainer = document.querySelector("#particles");
    if (particlesContainer) {
      particlesContainer.style.display = "none";
    }

    // Disable any particle.js instances
    if (window.pJSDom && window.pJSDom.length > 0) {
      window.pJSDom.forEach((pjs) => {
        if (pjs.pJS.fn.vendors.destroypJS) {
          pjs.pJS.fn.vendors.destroypJS();
        }
      });
    }
  }

  reduceVisualEffects() {
    // Apply performance-focused styles
    if (!this.performanceCSS) {
      this.performanceCSS = document.createElement("style");
      this.performanceCSS.id = "performance-mode-styles";
      this.performanceCSS.textContent = `
        /* Performance Mode Optimizations */
        
        .background {
          background: #1a1a2e !important;
        }
        
        .bg-gradient, .bg-particles, .bg-overlay {
          display: none !important;
        }
        
        .navbar {
          backdrop-filter: none !important;
          background: rgba(26, 26, 46, 0.95) !important;
        }
        
        .card, .settings-card, .feature-card {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
          backdrop-filter: none !important;
        }
        
        .btn {
          transition: none !important;
        }
        
        .loading-spinner {
          animation: none !important;
        }
        
        img, video {
          image-rendering: optimizeSpeed !important;
        }
      `;
    }
    document.head.appendChild(this.performanceCSS);
  }

  optimizeLayout() {
    // Add performance class to body
    document.body.classList.add("performance-mode");

    // Reduce DOM updates
    document.documentElement.style.setProperty("--animation-speed", "0");
  }

  restoreAnimations() {
    const style = document.getElementById("performance-mode-animations");
    if (style) style.remove();
  }

  restoreParticles() {
    const particlesContainer = document.querySelector("#particles");
    if (particlesContainer) {
      particlesContainer.style.display = "";
    }

    // Reinitialize particles if available
    if (typeof initParticles === "function") {
      initParticles();
    }
  }

  restoreVisualEffects() {
    if (this.performanceCSS) {
      this.performanceCSS.remove();
      this.performanceCSS = null;
    }
  }

  restoreLayout() {
    document.body.classList.remove("performance-mode");
    document.documentElement.style.removeProperty("--animation-speed");
  }

  addPerformanceModeToggle() {
    // Only add the toggle on the settings page
    if (
      !window.location.pathname.includes("/settings") &&
      !window.location.pathname.includes("/s") &&
      !document.querySelector(".settings-container")
    ) {
      return; // Don't add performance mode toggle on non-settings pages
    }

    // Add toggle to settings page when it loads
    const addToggleToSettings = () => {
      const settingsContainer = document.querySelector(".settings-container");

      if (!settingsContainer) {
        console.log(
          "Settings container not found, skipping performance mode toggle"
        );
        return;
      }

      // Remove existing toggle
      const existingToggle = document.getElementById(
        "performance-mode-section"
      );
      if (existingToggle) existingToggle.remove();

      const toggleSection = document.createElement("div");
      toggleSection.id = "performance-mode-section";
      toggleSection.className = "settings-section";
      toggleSection.innerHTML = `
        <div class="section-header">
          <h2>⚡ Performance Mode</h2>
          <p>Optimize SlowGuardian for slower devices and limited resources</p>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>Performance Optimization</h3>
            <p>Reduces animations, particles, and visual effects for better performance on less powerful laptops</p>
          </div>
          <div class="setting-control">
            <label class="switch">
              <input type="checkbox" id="performance-mode-toggle" ${this.isPerformanceMode ? "checked" : ""}>
              <span class="slider"></span>
            </label>
          </div>
        </div>
        
        <div class="performance-benefits">
          <h4>Benefits of Performance Mode:</h4>
          <ul>
            <li>🚀 Faster page loading and navigation</li>
            <li>💾 Lower memory usage</li>
            <li>🔋 Reduced CPU usage and battery drain</li>
            <li>🌡️ Less heat generation on older laptops</li>
            <li>📱 Better experience on low-end devices</li>
          </ul>
        </div>
      `;

      settingsContainer.appendChild(toggleSection);

      this.setupToggleListener();
    };

    // Add immediately if settings page is loaded, otherwise wait
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", addToggleToSettings);
    } else {
      addToggleToSettings();
    }
  }

  setupToggleListener() {
    const toggle = document.getElementById("performance-mode-toggle");
    if (toggle) {
      toggle.addEventListener("change", (e) => {
        if (e.target.checked) {
          this.enablePerformanceMode();
        } else {
          this.disablePerformanceMode();
        }

        // Show notification
        this.showNotification(
          e.target.checked
            ? "⚡ Performance Mode enabled - Optimizing interface..."
            : "🎨 Performance Mode disabled - Restoring full visual effects..."
        );
      });
    }
  }

  showNotification(message) {
    // Create a simple notification
    const notification = document.createElement("div");
    notification.className = "performance-notification";
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent-color, #6366f1);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  toggle() {
    if (this.isPerformanceMode) {
      this.disablePerformanceMode();
      this.isPerformanceMode = false;
    } else {
      this.enablePerformanceMode();
      this.isPerformanceMode = true;
    }
  }
}

// Export for modules - no automatic initialization
if (typeof module !== "undefined") {
  module.exports = PerformanceMode;
} else {
  // Initialize performance mode when script loads
  whenReady(() => {
    if (!window.performanceMode) {
      console.log("⚡ Creating PerformanceMode instance...");
      window.performanceMode = new PerformanceMode();
    }
  }, ["cookie-utils"]);
}
