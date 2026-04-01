/**
 * Main application entry point for SlowGuardian v9
 */

import { theme, device, showNotification } from "./utils.js";
import { initParticles } from "./particles.js";
import { router } from "./router.js";
import { setupProxyFeatures } from "./proxy.js";
import { ui } from "./ui.js";

class SlowGuardianApp {
  constructor() {
    this.version = "9.0.0";
    this.buildInfo = null;
    this.initialized = false;
    this.particleSystem = null;
    this.features = {
      particles: true,
      animations: true,
      tabCloaking: false,
      aboutBlankCloaking: false,
    };
  }

  async init() {
    if (this.initialized) return;

    // Load build information first
    await this.loadVersionInfo();

    console.log(`🚀 SlowGuardian v${this.version} initializing...`);
    if (this.buildInfo) {
      console.log(`🔨 Build: ${this.buildInfo.buildId}`);
      console.log(`📅 Built: ${this.buildInfo.buildDate}`);
      console.log(`🌿 Branch: ${this.buildInfo.git.branch}`);
      console.log(
        `🔗 Commit: ${this.buildInfo.git.commitShort} - ${this.buildInfo.git.commitMessage}`
      );
    }

    try {
      // Show loading screen
      ui.showLoading();

      // Initialize core systems
      await this.initializeCore();

      // Initialize UI components
      await this.initializeUI();

      // Initialize features
      await this.initializeFeatures();

      // Initialize routing
      await this.initializeRouting();

      // Setup error handling
      this.setupErrorHandling();

      // Hide loading screen
      ui.hideLoading();

      this.initialized = true;
      console.log(`✅ SlowGuardian v${this.version} initialized successfully`);

      // Show welcome message for first-time users
      this.showWelcomeMessage();
    } catch (error) {
      console.error("Failed to initialize SlowGuardian:", error);
      ui.hideLoading();
      this.showErrorScreen(error);
    }
  }

  async initializeCore() {
    // Initialize theme system
    theme.init();

    // Load user preferences
    this.loadPreferences();

    // Initialize service worker for PWA features
    await this.initializeServiceWorker();

    // Setup performance monitoring
    this.setupPerformanceMonitoring();
  }

  async loadVersionInfo() {
    try {
      const response = await fetch("/version.json");
      if (response.ok) {
        this.buildInfo = await response.json();
        this.version = this.buildInfo.version;

        // Update page title with version if needed
        if (document.title.includes("v9")) {
          document.title = document.title.replace("v9", `v${this.version}`);
        }

        // Update footer version info
        this.updateFooterVersion();

        // Add version info to console for debugging
        console.log(
          `%c🛡️ SlowGuardian v${this.version}`,
          "color: #7c3aed; font-weight: bold; font-size: 16px;"
        );

        // Make version info globally available
        window.SlowGuardianVersion = this.buildInfo;
      } else {
        console.warn("Could not load version information");
      }
    } catch (error) {
      console.warn("Failed to load version info:", error);
    }
  }

  updateFooterVersion() {
    const footerVersionText = document.getElementById("footer-version-text");
    const footerBuildInfo = document.getElementById("footer-build-info");

    if (footerVersionText && this.buildInfo) {
      footerVersionText.textContent = `v${this.buildInfo.version}`;
    }

    if (footerBuildInfo && this.buildInfo) {
      const buildDate = new Date(this.buildInfo.buildDate);
      const timeAgo = this.getTimeAgo(buildDate);

      footerBuildInfo.textContent = `Build ${this.buildInfo.git.commitShort} (${timeAgo})`;
      footerBuildInfo.className = "build-info loaded";
      footerBuildInfo.title = `
Full Build Info:
Build ID: ${this.buildInfo.buildId}
Commit: ${this.buildInfo.git.commitShort} - ${this.buildInfo.git.commitMessage}
Branch: ${this.buildInfo.git.branch}
Built: ${this.buildInfo.buildDate}
Environment: ${this.buildInfo.environment}
      `.trim();

      // Make build info clickable to copy version details
      footerBuildInfo.addEventListener("click", () => {
        this.copyVersionToClipboard();
      });
    }
  }

  getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  }

  copyVersionToClipboard() {
    if (!this.buildInfo) return;

    const versionText = `SlowGuardian v${this.buildInfo.version} - Build ${this.buildInfo.git.commitShort}`;

    navigator.clipboard
      .writeText(versionText)
      .then(() => {
        console.log("Version info copied to clipboard:", versionText);
      })
      .catch((err) => {
        console.warn("Failed to copy version info:", err);
      });
  }

  async initializeUI() {
    // Initialize UI manager
    ui.init();

    // Setup responsive design handlers
    this.setupResponsiveHandlers();

    // Initialize accessibility features
    this.setupAccessibilityFeatures();

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  async initializeFeatures() {
    // Initialize particle system
    if (
      this.features.particles &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      await this.initializeParticles();
    }

    // Initialize proxy features
    setupProxyFeatures();

    // Setup motivational quotes
    this.setupMotivationalQuotes();

    // Setup tab management
    this.setupTabManagement();

    // Initialize PWA features
    this.setupPWAFeatures();
  }

  async initializeRouting() {
    // Initialize router
    router.init();

    // Setup navigation enhancements
    this.setupNavigationEnhancements();
  }

  async initializeParticles() {
    const particlesContainer = document.getElementById("particles");
    if (particlesContainer && !window.location.pathname.includes("/go")) {
      try {
        // Skip particles on browser page to avoid conflicts
        if (
          window.location.pathname === "/go" ||
          window.location.pathname === "/p"
        ) {
          return;
        }

        // Determine particle type based on device capabilities
        let particleType = "floating";

        if (device.isDesktop() && !device.isLowEndDevice?.()) {
          particleType = "interactive";
        }

        this.particleSystem = initParticles(particlesContainer, particleType);

        // Ensure particles are visible
        particlesContainer.style.position = "fixed";
        particlesContainer.style.top = "0";
        particlesContainer.style.left = "0";
        particlesContainer.style.width = "100%";
        particlesContainer.style.height = "100%";
        particlesContainer.style.pointerEvents = "none";
        particlesContainer.style.zIndex = "1";

        console.log(`✨ Particle system initialized: ${particleType}`);
      } catch (error) {
        console.warn("Failed to initialize particle system:", error);
        // Fallback to simple CSS particle animation
        this.createSimpleParticles(particlesContainer);
      }
    }
  }

  createSimpleParticles(container) {
    // Simple CSS-based floating particles as fallback
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div");
      particle.style.cssText = `
        position: absolute;
        width: ${2 + Math.random() * 4}px;
        height: ${2 + Math.random() * 4}px;
        background: rgba(255, 255, 255, ${0.3 + Math.random() * 0.4});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${10 + Math.random() * 20}s infinite linear;
        opacity: ${0.3 + Math.random() * 0.4};
      `;
      container.appendChild(particle);
    }

    // Add CSS keyframes if not already added
    if (!document.getElementById("simple-particles-css")) {
      const style = document.createElement("style");
      style.id = "simple-particles-css";
      style.textContent = `
        @keyframes float {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100px) translateX(${-50 + Math.random() * 100}px);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  async initializeServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("ServiceWorker registered:", registration);

        // Handle updates - disabled to prevent false update notifications
        // registration.addEventListener("updatefound", () => {
        //   const newWorker = registration.installing;
        //   newWorker.addEventListener("statechange", () => {
        //     if (
        //       newWorker.state === "installed" &&
        //       navigator.serviceWorker.controller
        //     ) {
        //       this.showUpdateAvailable();
        //     }
        //   });
        // });
      } catch (error) {
        console.log("ServiceWorker registration failed:", error);
      }
    }
  }

  setupPerformanceMonitoring() {
    // Monitor core web vitals
    if ("PerformanceObserver" in window) {
      try {
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.log(`Performance: ${entry.name} = ${entry.value}ms`);
          });
        }).observe({ entryTypes: ["measure"] });
      } catch (error) {
        console.debug("Performance monitoring not available:", error);
      }
    }

    // Monitor memory usage
    if ("memory" in performance) {
      setInterval(() => {
        const memory = performance.memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          console.warn("High memory usage detected, enabling performance mode");
          this.enablePerformanceMode();
        }
      }, 30000);
    }
  }

  setupResponsiveHandlers() {
    // Handle window resize
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (this.particleSystem) {
          this.particleSystem.resize();
        }

        // Adjust UI for new screen size
        this.handleScreenSizeChange();
      }, 100);
    });

    // Handle orientation change
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
  }

  setupAccessibilityFeatures() {
    // High contrast mode detection
    const highContrastQuery = window.matchMedia("(prefers-contrast: high)");
    highContrastQuery.addListener((e) => {
      if (e.matches) {
        theme.set("high-contrast");
      }
    });

    // Reduced motion preference
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    reducedMotionQuery.addListener((e) => {
      this.features.animations = !e.matches;
      this.updateAnimationSettings();
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Focus search on '/' key
      if (e.key === "/" && !e.target.matches("input, textarea")) {
        e.preventDefault();
        const searchInput =
          document.getElementById("is") || document.getElementById("url-input");
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Theme toggle on Ctrl+Shift+T
      if (e.ctrlKey && e.shiftKey && e.key === "T") {
        e.preventDefault();
        theme.toggle();
        showNotification(`Switched to ${theme.current()} theme`, "success");
      }

      // Performance mode toggle on Ctrl+Shift+P
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        this.togglePerformanceMode();
      }

      // Show version info on Ctrl+Shift+V
      if (e.ctrlKey && e.shiftKey && e.key === "V") {
        e.preventDefault();
        this.showVersionModal();
      }
    });

    // Setup search form handling
    this.setupSearchForm();
  }

  setupSearchForm() {
    const searchForm = document.getElementById("fs");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const searchInput = document.getElementById("is");
        if (searchInput && searchInput.value.trim()) {
          // Use the global go function if available
          if (typeof go === "function") {
            go(searchInput.value.trim());
          } else if (typeof processUrl === "function") {
            processUrl(searchInput.value.trim(), "/p");
          }
        }
      });

      // Also handle button click
      const searchBtn = document.getElementById("search-submit-btn");
      if (searchBtn) {
        searchBtn.addEventListener("click", (e) => {
          e.preventDefault();
          searchForm.dispatchEvent(new Event("submit"));
        });
      }
    }
  }

  setupTabManagement() {
    // Tab cloaking
    if (this.features.tabCloaking) {
      this.enableTabCloaking();
    }

    // Handle page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        // Page is hidden, can pause certain operations
        if (this.particleSystem) {
          this.particleSystem.stop();
        }
      } else {
        // Page is visible again
        if (this.particleSystem && this.features.particles) {
          this.particleSystem.start();
        }
      }
    });
  }

  setupPWAFeatures() {
    // Handle app installation
    let deferredPrompt;

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this.showInstallPrompt();
    });

    // Handle app installation
    window.addEventListener("appinstalled", () => {
      showNotification("SlowGuardian installed successfully!", "success");
      this.savePreference("installed", true);
    });
  }

  setupNavigationEnhancements() {
    // Prefetch pages on hover
    document.addEventListener("mouseover", (e) => {
      const link = e.target.closest(".nav-link[href]");
      if (link && !link.dataset.prefetched) {
        link.dataset.prefetched = "true";
        // Could implement prefetching logic here
      }
    });
  }

  setupErrorHandling() {
    // Global error handler
    window.addEventListener("error", (e) => {
      console.error("Global error:", e.error);
      this.handleError(e.error, "Global Error");
    });

    // Unhandled promise rejections
    window.addEventListener("unhandledrejection", (e) => {
      console.error("Unhandled promise rejection:", e.reason);
      this.handleError(e.reason, "Promise Rejection");
      e.preventDefault(); // Prevent console spam
    });
  }

  handleError(error, context = "Unknown") {
    console.error(`[${context}] Error:`, error);

    // Show user-friendly error message
    if (
      error.name === "ChunkLoadError" ||
      error.message.includes("Loading chunk")
    ) {
      this.showReloadPrompt();
    } else {
      showNotification(
        "Something went wrong. Please try refreshing the page.",
        "error"
      );
    }

    // Report error to monitoring service (if implemented)
    this.reportError(error, context);
  }

  reportError(error, context) {
    // Could implement error reporting to service like Sentry
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    console.log("Error reported:", errorData);
  }

  showWelcomeMessage() {
    // Welcome modal is handled by the onboarding system
    // Disabled to prevent conflicts with the structured onboarding flow
    return;
  }

  showUpdateAvailable() {
    ui.createModal({
      title: "Update Available",
      content:
        "A new version of SlowGuardian is available. Reload to get the latest features and fixes.",
      actions: [
        {
          text: "Later",
          class: "btn-secondary",
          action: "later",
          handler: (close) => close(),
        },
        {
          text: "Reload Now",
          class: "btn-primary",
          action: "reload",
          handler: () => window.location.reload(),
        },
      ],
    });
  }

  showReloadPrompt() {
    ui.createModal({
      title: "Reload Required",
      content:
        "Some application files failed to load. Please reload the page to continue.",
      actions: [
        {
          text: "Reload Page",
          class: "btn-primary",
          action: "reload",
          handler: () => window.location.reload(),
        },
      ],
    });
  }

  showInstallPrompt() {
    if (!this.getPreference("installPromptDismissed")) {
      setTimeout(() => {
        ui.createModal({
          title: "Install SlowGuardian",
          content:
            "Install SlowGuardian as a Progressive Web App for the best experience.",
          actions: [
            {
              text: "Not Now",
              class: "btn-secondary",
              action: "dismiss",
              handler: (close) => {
                close();
                this.savePreference("installPromptDismissed", true);
              },
            },
            {
              text: "Install",
              class: "btn-primary",
              action: "install",
              handler: async (close) => {
                close();
                if (window.deferredPrompt) {
                  window.deferredPrompt.prompt();
                  const { outcome } = await window.deferredPrompt.userChoice;
                  console.log(`User ${outcome} the install prompt`);
                  window.deferredPrompt = null;
                }
              },
            },
          ],
        });
      }, 5000);
    }
  }

  showErrorScreen(error) {
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
        padding: 2rem;
        background: var(--bg-primary);
        color: var(--text-primary);
      ">
        <h1>Something went wrong</h1>
        <p>SlowGuardian failed to initialize properly.</p>
        <details style="margin: 1rem 0;">
          <summary>Error Details</summary>
          <pre style="text-align: left; margin-top: 1rem;">${error.stack}</pre>
        </details>
        <button onclick="window.location.reload()" class="btn btn-primary">
          Reload Page
        </button>
      </div>
    `;
  }

  handleScreenSizeChange() {
    // Adjust UI based on screen size
    const isMobile = device.isMobile();
    document.documentElement.classList.toggle("mobile", isMobile);

    // Adjust particle count for mobile devices
    if (this.particleSystem && isMobile) {
      this.particleSystem.setParticleCount?.(20);
    } else if (this.particleSystem) {
      this.particleSystem.setParticleCount?.(50);
    }
  }

  handleOrientationChange() {
    // Handle orientation-specific adjustments
    if (this.particleSystem) {
      this.particleSystem.resize();
    }
  }

  enablePerformanceMode() {
    console.log("Enabling performance mode");

    // Disable particles
    if (this.particleSystem) {
      this.particleSystem.destroy();
      this.particleSystem = null;
    }

    // Reduce animations
    document.documentElement.classList.add("performance-mode");

    // Update features
    this.features.particles = false;
    this.features.animations = false;

    showNotification("Performance mode enabled", "info");
  }

  togglePerformanceMode() {
    if (document.documentElement.classList.contains("performance-mode")) {
      // Disable performance mode
      document.documentElement.classList.remove("performance-mode");
      this.features.particles = true;
      this.features.animations = true;

      // Re-initialize particles
      this.initializeParticles();

      showNotification("Performance mode disabled", "success");
    } else {
      this.enablePerformanceMode();
    }
  }

  updateAnimationSettings() {
    if (this.features.animations) {
      document.documentElement.classList.remove("no-animations");
    } else {
      document.documentElement.classList.add("no-animations");
    }
  }

  // Global proxy handler for legacy compatibility
  async handleProxyRequest(url, useBlankPopup = false) {
    try {
      const { handleProxyRequest } = await import("./proxy.js");
      return handleProxyRequest(url, useBlankPopup);
    } catch (error) {
      console.error("Failed to handle proxy request:", error);
      showNotification("Failed to load the requested page", "error");
    }
  }

  enableTabCloaking(title = "Google", favicon = "/favicon-google.ico") {
    document.title = title;

    const link = document.querySelector('link[rel="shortcut icon"]');
    if (link) {
      link.href = favicon;
    }

    this.features.tabCloaking = true;
    this.savePreference("tabCloaking", true);
  }

  disableTabCloaking() {
    document.title = `SlowGuardian v${this.version}`;

    const link = document.querySelector('link[rel="shortcut icon"]');
    if (link) {
      link.href = "/favicon.png";
    }

    this.features.tabCloaking = false;
    this.savePreference("tabCloaking", false);
  }

  loadPreferences() {
    try {
      // Use the unified storage interface
      const preferences = window.storage
        ? window.storage.getItem("sg_preferences", {})
        : JSON.parse(localStorage.getItem("sg_preferences") || "{}");

      this.features = { ...this.features, ...preferences };

      // Migrate old localStorage data to new storage system
      this.migrateOldSettings();
    } catch (error) {
      console.warn("Failed to load preferences:", error);
    }
  }

  savePreference(key, value) {
    try {
      const currentPrefs = window.storage
        ? window.storage.getItem("sg_preferences", {})
        : JSON.parse(localStorage.getItem("sg_preferences") || "{}");

      currentPrefs[key] = value;

      if (window.storage) {
        window.storage.setItem("sg_preferences", currentPrefs);
      } else {
        localStorage.setItem("sg_preferences", JSON.stringify(currentPrefs));
      }

      // Update features
      this.features[key] = value;
    } catch (error) {
      console.warn("Failed to save preference:", error);
    }
  }

  getPreference(key, defaultValue = null) {
    try {
      const preferences = window.storage
        ? window.storage.getItem("sg_preferences", {})
        : JSON.parse(localStorage.getItem("sg_preferences") || "{}");

      return preferences[key] !== undefined ? preferences[key] : defaultValue;
    } catch (error) {
      console.warn("Failed to get preference:", error);
      return defaultValue;
    }
  }

  migrateOldSettings() {
    // Migrate common settings from localStorage to unified storage
    const settingsToMigrate = [
      "theme",
      "selectedOption",
      "ab",
      "dy",
      "engine",
      "Gcustom",
      "Gpinned",
    ];

    settingsToMigrate.forEach((key) => {
      const oldValue = localStorage.getItem(key);
      if (oldValue && window.storage && !window.storage.getItem(key)) {
        try {
          window.storage.setItem(key, oldValue);
          console.log(`Migrated setting: ${key}`);
        } catch (error) {
          console.warn(`Failed to migrate setting ${key}:`, error);
        }
      }
    });
  }

  showVersionModal() {
    if (!this.buildInfo) {
      console.log("Version info not loaded yet");
      return;
    }

    const modal = document.createElement("div");
    modal.className = "modal version-modal";
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

    const buildDate = new Date(this.buildInfo.buildDate);

    modal.innerHTML = `
      <div class="modal-content" style="
        background: var(--bg-primary);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-xl);
        padding: var(--space-6);
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      ">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
          <h2 style="color: var(--text-primary); margin: 0;">🛡️ SlowGuardian Version</h2>
          <button class="close-btn" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--text-secondary);
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-md);
          ">&times;</button>
        </div>
        <div class="version-details" style="
          display: grid;
          gap: var(--space-3);
          font-family: var(--font-mono);
          font-size: var(--font-size-sm);
        ">
          <div><strong>Version:</strong> v${this.buildInfo.version}</div>
          <div><strong>Build ID:</strong> ${this.buildInfo.buildId}</div>
          <div><strong>Commit:</strong> ${this.buildInfo.git.commitShort} (${this.buildInfo.git.commitMessage})</div>
          <div><strong>Branch:</strong> ${this.buildInfo.git.branch}</div>
          <div><strong>Built:</strong> ${buildDate.toLocaleString()}</div>
          <div><strong>Environment:</strong> ${this.buildInfo.environment}</div>
          <div><strong>Platform:</strong> ${this.buildInfo.platform} ${this.buildInfo.arch}</div>
          <div><strong>Node.js:</strong> ${this.buildInfo.nodeVersion}</div>
        </div>
        <div class="modal-actions" style="
          margin-top: var(--space-4);
          display: flex;
          gap: var(--space-2);
          justify-content: flex-end;
        ">
          <button class="copy-btn btn btn-secondary">📋 Copy Info</button>
          <button class="close-btn btn btn-primary">Close</button>
        </div>
      </div>
    `;

    // Add event listeners
    const closeButtons = modal.querySelectorAll(".close-btn");
    const copyButton = modal.querySelector(".copy-btn");

    closeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        modal.remove();
      });
    });

    copyButton.addEventListener("click", () => {
      const versionText = [
        `SlowGuardian v${this.buildInfo.version}`,
        `Build ID: ${this.buildInfo.buildId}`,
        `Commit: ${this.buildInfo.git.commitShort} (${this.buildInfo.git.commitMessage})`,
        `Branch: ${this.buildInfo.git.branch}`,
        `Built: ${this.buildInfo.buildDate}`,
        `Environment: ${this.buildInfo.environment}`,
        `Platform: ${this.buildInfo.platform} ${this.buildInfo.arch}`,
        `Node.js: ${this.buildInfo.nodeVersion}`,
      ].join("\n");

      navigator.clipboard.writeText(versionText).then(() => {
        copyButton.textContent = "✅ Copied!";
        setTimeout(() => {
          copyButton.textContent = "📋 Copy Info";
        }, 2000);
      });
    });

    // Close on backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        modal.remove();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);

    document.body.appendChild(modal);
  }

  // Public API methods
  getVersion() {
    return this.version;
  }

  getFeatures() {
    return { ...this.features };
  }

  getStats() {
    return {
      version: this.version,
      initialized: this.initialized,
      features: this.features,
      userAgent: navigator.userAgent,
      deviceInfo: {
        isMobile: device.isMobile(),
        isTablet: device.isTablet(),
        isDesktop: device.isDesktop(),
        hasTouch: device.hasTouch(),
      },
    };
  }

  setupMotivationalQuotes() {
    const quotes = [
      {
        text: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney",
      },
      {
        text: "Don't be afraid to give up the good to go for the great.",
        author: "John D. Rockefeller",
      },
      {
        text: "Innovation distinguishes between a leader and a follower.",
        author: "Steve Jobs",
      },
      {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
      },
      {
        text: "Your limitation—it's only your imagination.",
        author: "Unknown",
      },
      {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
      },
      {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
      },
      {
        text: "Life is what happens to you while you're busy making other plans.",
        author: "John Lennon",
      },
      {
        text: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt",
      },
      {
        text: "The best time to plant a tree was 20 years ago. The second best time is now.",
        author: "Chinese Proverb",
      },
    ];

    const quoteElement = document.querySelector(".quote-text");
    const authorElement = document.querySelector(".quote-author");

    if (quoteElement && authorElement) {
      // Get random quote
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

      // Set the quote
      quoteElement.textContent = `"${randomQuote.text}"`;
      authorElement.textContent = `- ${randomQuote.author}`;

      // Save the selected quote for the day
      const today = new Date().toDateString();
      const savedQuote = this.getPreference("dailyQuote");

      if (!savedQuote || savedQuote.date !== today) {
        this.savePreference("dailyQuote", {
          date: today,
          quote: randomQuote,
        });
      } else {
        // Use saved quote for today
        quoteElement.textContent = `"${savedQuote.quote.text}"`;
        authorElement.textContent = `- ${savedQuote.quote.author}`;
      }
    }
  }
}

// Create and initialize the app
const app = new SlowGuardianApp();

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => app.init());
} else {
  app.init();
}

// Export for global access
window.SlowGuardian = app;
window.theme = theme; // Make theme globally accessible

// Also export for modules
export default app;
