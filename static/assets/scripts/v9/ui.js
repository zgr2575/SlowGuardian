/**
 * UI interactions and components for SlowGuardian v9
 */

import { $, $$, on, theme, device, debounce } from "./utils.js";

class UIManager {
  constructor() {
    this.initialized = false;
    this.observers = new Map();
  }

  init() {
    if (this.initialized) return;

    this.setupThemeToggle();
    this.setupFullscreenToggle();
    this.setupScrollReveal();
    this.setupResponsiveNavigation();
    this.setupPerformanceOptimizations();
    this.setupAccessibility();

    this.initialized = true;
  }

  setupThemeToggle() {
    const themeToggle = $("#theme-toggle");
    if (!themeToggle) return;

    const updateThemeIcon = () => {
      const currentTheme = theme.current();
      const icon = themeToggle.querySelector(".icon");
      if (icon) {
        // Update icon based on theme
        if (currentTheme === "light" || currentTheme === "catppuccinLatte") {
          icon.textContent = "🌙";
          themeToggle.title = "Switch to dark theme";
        } else {
          icon.textContent = "☀️";
          themeToggle.title = "Switch theme";
        }
      }
    };

    updateThemeIcon();

    on(themeToggle, "click", () => {
      const newTheme = theme.toggle();
      updateThemeIcon();

      // Show notification about theme change
      const themeNames = {
        dark: "Dark",
        light: "Light",
        catppuccinMocha: "Catppuccin Mocha",
        catppuccinMacchiato: "Catppuccin Macchiato",
        catppuccinFrappe: "Catppuccin Frappe",
        catppuccinLatte: "Catppuccin Latte",
      };

      if (window.showNotification) {
        window.showNotification(
          `Switched to ${themeNames[newTheme] || newTheme} theme`,
          "success",
          2000
        );
      }
    });
  }

  setupFullscreenToggle() {
    const fullscreenToggle = $("#fullscreen-toggle");
    if (!fullscreenToggle) return;

    const updateFullscreenIcon = () => {
      const icon = fullscreenToggle.querySelector(".icon");
      if (icon) {
        icon.textContent = document.fullscreenElement ? "⛶" : "⛶";
      }
      fullscreenToggle.title = document.fullscreenElement
        ? "Exit fullscreen"
        : "Enter fullscreen";
    };

    on(fullscreenToggle, "click", async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await document.documentElement.requestFullscreen();
        }
        updateFullscreenIcon();
      } catch (error) {
        console.error("Fullscreen toggle failed:", error);
      }
    });

    on(document, "fullscreenchange", updateFullscreenIcon);
  }

  setupScrollReveal() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    }, observerOptions);

    // Observe elements with scroll reveal classes
    $$(".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right").forEach(
      (el) => {
        observer.observe(el);
      }
    );

    this.observers.set("scrollReveal", observer);
  }

  setupResponsiveNavigation() {
    const navbar = $("#navbar");
    if (!navbar) return;

    // Mobile navigation handling
    if (device.isMobile()) {
      this.setupMobileNavigation();
    }

    // Navbar scroll behavior
    let lastScrollY = window.scrollY;
    const handleScroll = debounce(() => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide navbar
        navbar.style.transform = "translateY(-100%)";
      } else {
        // Scrolling up - show navbar
        navbar.style.transform = "translateY(0)";
      }

      lastScrollY = currentScrollY;
    }, 100);

    on(window, "scroll", handleScroll);
  }

  setupMobileNavigation() {
    // Add mobile menu toggle if needed
    const navContainer = $(".nav-container");
    if (!navContainer) return;

    const mobileMenuBtn = document.createElement("button");
    mobileMenuBtn.className = "mobile-menu-btn";
    mobileMenuBtn.innerHTML = "☰";
    mobileMenuBtn.style.display = "none";

    if (device.isMobile()) {
      mobileMenuBtn.style.display = "block";
      navContainer.appendChild(mobileMenuBtn);

      const navLinks = $(".nav-links");
      if (navLinks) {
        on(mobileMenuBtn, "click", () => {
          navLinks.classList.toggle("mobile-open");
        });
      }
    }
  }

  setupPerformanceOptimizations() {
    // Lazy load images
    this.setupLazyLoading();

    // Optimize animations based on device capabilities
    this.optimizeAnimations();

    // Setup intersection observers for performance
    this.setupPerformanceObservers();
  }

  setupLazyLoading() {
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
              imageObserver.unobserve(img);
            }
          }
        });
      });

      $$("img[data-src]").forEach((img) => {
        imageObserver.observe(img);
      });

      this.observers.set("lazyLoading", imageObserver);
    }
  }

  optimizeAnimations() {
    // Reduce animations on lower-end devices
    const isLowEndDevice =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (isLowEndDevice || prefersReducedMotion) {
      document.documentElement.style.setProperty("--transition-fast", "0ms");
      document.documentElement.style.setProperty("--transition-base", "0ms");
      document.documentElement.style.setProperty("--transition-slow", "0ms");
    }
  }

  setupPerformanceObservers() {
    // Monitor performance and adjust accordingly
    if ("PerformanceObserver" in window) {
      try {
        const perfObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (
              entry.name === "first-contentful-paint" &&
              entry.startTime > 3000
            ) {
              // Slow loading detected, reduce effects
              this.enablePerformanceMode();
            }
          });
        });

        perfObserver.observe({ entryTypes: ["paint"] });
      } catch (error) {
        console.debug("Performance observer not fully supported:", error);
      }
    }
  }

  enablePerformanceMode() {
    document.body.classList.add("performance-mode");

    // Disable particle system if running
    const particlesContainer = $("#particles");
    if (particlesContainer) {
      particlesContainer.style.display = "none";
    }

    // Reduce animation complexity
    $$(".animate-float, .animate-pulse").forEach((el) => {
      el.classList.remove("animate-float", "animate-pulse");
    });
  }

  setupAccessibility() {
    // Focus management
    this.setupFocusManagement();

    // Keyboard navigation
    this.setupKeyboardNavigation();

    // Screen reader improvements
    this.setupScreenReaderSupport();

    // High contrast support
    this.setupHighContrastSupport();
  }

  setupFocusManagement() {
    // Focus visible management
    let usingMouse = false;

    on(document, "mousedown", () => {
      usingMouse = true;
    });

    on(document, "keydown", (e) => {
      if (e.key === "Tab") {
        usingMouse = false;
      }
    });

    on(document, "focusin", (e) => {
      if (usingMouse) {
        e.target.classList.add("mouse-focus");
      } else {
        e.target.classList.remove("mouse-focus");
      }
    });
  }

  setupKeyboardNavigation() {
    // Escape key handling
    on(document, "keydown", (e) => {
      if (e.key === "Escape") {
        // Close any open modals, dropdowns, etc.
        $$(".modal-overlay.active, .dropdown.active").forEach((el) => {
          el.classList.remove("active");
        });

        // Clear focus from search input
        const searchInput = $("#url-input");
        if (searchInput && document.activeElement === searchInput) {
          searchInput.blur();
        }
      }
    });

    // Skip to main content link
    this.addSkipLink();
  }

  addSkipLink() {
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.textContent = "Skip to main content";
    skipLink.className = "skip-link";
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--accent-primary);
      color: white;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1000;
      transition: top 0.3s;
    `;

    on(skipLink, "focus", () => {
      skipLink.style.top = "6px";
    });

    on(skipLink, "blur", () => {
      skipLink.style.top = "-40px";
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  setupScreenReaderSupport() {
    // Add ARIA labels where needed
    $$("button:not([aria-label]):not([aria-labelledby])").forEach((button) => {
      const text = button.textContent.trim();
      const icon = button.querySelector(".icon");

      if (!text && icon) {
        // Button with only icon, needs aria-label
        button.setAttribute("aria-label", button.title || "Button");
      }
    });

    // Live region for notifications
    const liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(liveRegion);

    // Store reference for notifications
    this.liveRegion = liveRegion;
  }

  setupHighContrastSupport() {
    // Detect high contrast mode
    const detectHighContrast = () => {
      const testDiv = document.createElement("div");
      testDiv.style.cssText = `
        position: absolute;
        top: -999px;
        width: 1px;
        height: 1px;
        background-color: rgb(31, 41, 59);
        border: 1px solid rgb(31, 41, 59);
      `;
      document.body.appendChild(testDiv);

      const computed = window.getComputedStyle(testDiv);
      const isHighContrast = computed.backgroundColor !== computed.borderColor;

      document.body.removeChild(testDiv);
      return isHighContrast;
    };

    if (detectHighContrast()) {
      document.documentElement.setAttribute("data-theme", "high-contrast");
    }
  }

  // Utility methods for other components
  showLoading() {
    const loadingOverlay = $("#loading");
    if (loadingOverlay) {
      loadingOverlay.classList.add("active");
    }
  }

  hideLoading() {
    const loadingOverlay = $("#loading");
    if (loadingOverlay) {
      loadingOverlay.classList.remove("active");
    }
  }

  announceToScreenReader(message) {
    if (this.liveRegion) {
      this.liveRegion.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        this.liveRegion.textContent = "";
      }, 1000);
    }
  }

  // Component factories
  createModal(options) {
    const { title, content, actions = [], onClose } = options;

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" aria-label="Close modal">✕</button>
      </div>
      <div class="modal-content">${content}</div>
      <div class="modal-footer">
        ${actions
          .map(
            (action) =>
              `<button class="btn ${action.class || "btn-secondary"}" data-action="${action.action}">
            ${action.text}
          </button>`
          )
          .join("")}
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Event handlers
    const closeModal = () => {
      overlay.classList.remove("active");
      setTimeout(() => {
        overlay.remove();
      }, 300);
      if (onClose) onClose();
    };

    on(overlay, "click", (e) => {
      if (e.target === overlay) closeModal();
    });

    on(modal.querySelector(".modal-close"), "click", closeModal);

    // Action handlers
    actions.forEach((action) => {
      const btn = modal.querySelector(`[data-action="${action.action}"]`);
      if (btn && action.handler) {
        on(btn, "click", () => action.handler(closeModal));
      }
    });

    // Show modal
    setTimeout(() => {
      overlay.classList.add("active");
    }, 10);

    return { modal, overlay, close: closeModal };
  }

  createTooltip(element, text) {
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip-content";
    tooltip.textContent = text;

    element.style.position = "relative";
    element.appendChild(tooltip);

    return tooltip;
  }

  // Cleanup
  destroy() {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();

    if (this.liveRegion) {
      this.liveRegion.remove();
    }
  }
}

// Export singleton instance
export const ui = new UIManager();
