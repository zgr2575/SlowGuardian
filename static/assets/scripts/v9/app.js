/**
 * Main application entry point for SlowGuardian v9
 */

import { theme, device, showNotification } from './utils.js';
import { initParticles } from './particles.js';
import { router } from './router.js';
import { setupProxyFeatures } from './proxy.js';
import { ui } from './ui.js';

class SlowGuardianApp {
  constructor() {
    this.version = '9.0.0';
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
    
    console.log(`🚀 SlowGuardian v${this.version} initializing...`);
    
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
      console.error('Failed to initialize SlowGuardian:', error);
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
    if (this.features.particles && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await this.initializeParticles();
    }
    
    // Initialize proxy features
    setupProxyFeatures();
    
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
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
      try {
        // Determine particle type based on device capabilities
        let particleType = 'floating';
        
        if (device.isDesktop() && !device.isLowEndDevice?.()) {
          particleType = 'interactive';
        }
        
        this.particleSystem = initParticles(particlesContainer, particleType);
        console.log(`✨ Particle system initialized: ${particleType}`);
      } catch (error) {
        console.warn('Failed to initialize particle system:', error);
      }
    }
  }
  
  async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('ServiceWorker registered:', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateAvailable();
            }
          });
        });
      } catch (error) {
        console.log('ServiceWorker registration failed:', error);
      }
    }
  }
  
  setupPerformanceMonitoring() {
    // Monitor core web vitals
    if ('PerformanceObserver' in window) {
      try {
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.log(`Performance: ${entry.name} = ${entry.value}ms`);
          });
        }).observe({ entryTypes: ['measure'] });
      } catch (error) {
        console.debug('Performance monitoring not available:', error);
      }
    }
    
    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          console.warn('High memory usage detected, enabling performance mode');
          this.enablePerformanceMode();
        }
      }, 30000);
    }
  }
  
  setupResponsiveHandlers() {
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
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
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
  }
  
  setupAccessibilityFeatures() {
    // High contrast mode detection
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    highContrastQuery.addListener((e) => {
      if (e.matches) {
        theme.set('high-contrast');
      }
    });
    
    // Reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addListener((e) => {
      this.features.animations = !e.matches;
      this.updateAnimationSettings();
    });
  }
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Focus search on '/' key
      if (e.key === '/' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        const searchInput = document.getElementById('url-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Theme toggle on Ctrl+Shift+T
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        theme.toggle();
        showNotification(`Switched to ${theme.current()} theme`, 'success');
      }
      
      // Performance mode toggle on Ctrl+Shift+P
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        this.togglePerformanceMode();
      }
    });
  }
  
  setupTabManagement() {
    // Tab cloaking
    if (this.features.tabCloaking) {
      this.enableTabCloaking();
    }
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
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
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this.showInstallPrompt();
    });
    
    // Handle app installation
    window.addEventListener('appinstalled', () => {
      showNotification('SlowGuardian installed successfully!', 'success');
      this.savePreference('installed', true);
    });
  }
  
  setupNavigationEnhancements() {
    // Prefetch pages on hover
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('.nav-link[href]');
      if (link && !link.dataset.prefetched) {
        link.dataset.prefetched = 'true';
        // Could implement prefetching logic here
      }
    });
  }
  
  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      this.handleError(e.error, 'Global Error');
    });
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      this.handleError(e.reason, 'Promise Rejection');
      e.preventDefault(); // Prevent console spam
    });
  }
  
  handleError(error, context = 'Unknown') {
    console.error(`[${context}] Error:`, error);
    
    // Show user-friendly error message
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      this.showReloadPrompt();
    } else {
      showNotification('Something went wrong. Please try refreshing the page.', 'error');
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
    
    console.log('Error reported:', errorData);
  }
  
  showWelcomeMessage() {
    const isFirstVisit = !this.getPreference('visited');
    if (isFirstVisit) {
      setTimeout(() => {
        ui.createModal({
          title: 'Welcome to SlowGuardian v9! 🚀',
          content: `
            <p>Welcome to the completely rewritten SlowGuardian v9!</p>
            <ul>
              <li>✨ Modern, breathtaking UI design</li>
              <li>🔌 Powerful plugin system</li>
              <li>⚡ Enhanced performance</li>
              <li>🛡️ Better security features</li>
              <li>📱 Mobile-friendly design</li>
            </ul>
            <p>Press <kbd>/</kbd> to quickly focus the search bar.</p>
          `,
          actions: [
            {
              text: 'Get Started',
              class: 'btn-primary',
              action: 'start',
              handler: (close) => {
                close();
                this.savePreference('visited', true);
                document.getElementById('url-input')?.focus();
              }
            }
          ]
        });
      }, 1000);
    }
  }
  
  showUpdateAvailable() {
    ui.createModal({
      title: 'Update Available',
      content: 'A new version of SlowGuardian is available. Reload to get the latest features and fixes.',
      actions: [
        {
          text: 'Later',
          class: 'btn-secondary',
          action: 'later',
          handler: (close) => close()
        },
        {
          text: 'Reload Now',
          class: 'btn-primary',
          action: 'reload',
          handler: () => window.location.reload()
        }
      ]
    });
  }
  
  showReloadPrompt() {
    ui.createModal({
      title: 'Reload Required',
      content: 'Some application files failed to load. Please reload the page to continue.',
      actions: [
        {
          text: 'Reload Page',
          class: 'btn-primary',
          action: 'reload',
          handler: () => window.location.reload()
        }
      ]
    });
  }
  
  showInstallPrompt() {
    if (!this.getPreference('installPromptDismissed')) {
      setTimeout(() => {
        ui.createModal({
          title: 'Install SlowGuardian',
          content: 'Install SlowGuardian as a Progressive Web App for the best experience.',
          actions: [
            {
              text: 'Not Now',
              class: 'btn-secondary',
              action: 'dismiss',
              handler: (close) => {
                close();
                this.savePreference('installPromptDismissed', true);
              }
            },
            {
              text: 'Install',
              class: 'btn-primary',
              action: 'install',
              handler: async (close) => {
                close();
                if (window.deferredPrompt) {
                  window.deferredPrompt.prompt();
                  const { outcome } = await window.deferredPrompt.userChoice;
                  console.log(`User ${outcome} the install prompt`);
                  window.deferredPrompt = null;
                }
              }
            }
          ]
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
    document.documentElement.classList.toggle('mobile', isMobile);
    
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
    console.log('Enabling performance mode');
    
    // Disable particles
    if (this.particleSystem) {
      this.particleSystem.destroy();
      this.particleSystem = null;
    }
    
    // Reduce animations
    document.documentElement.classList.add('performance-mode');
    
    // Update features
    this.features.particles = false;
    this.features.animations = false;
    
    showNotification('Performance mode enabled', 'info');
  }
  
  togglePerformanceMode() {
    if (document.documentElement.classList.contains('performance-mode')) {
      // Disable performance mode
      document.documentElement.classList.remove('performance-mode');
      this.features.particles = true;
      this.features.animations = true;
      
      // Re-initialize particles
      this.initializeParticles();
      
      showNotification('Performance mode disabled', 'success');
    } else {
      this.enablePerformanceMode();
    }
  }
  
  updateAnimationSettings() {
    if (this.features.animations) {
      document.documentElement.classList.remove('no-animations');
    } else {
      document.documentElement.classList.add('no-animations');
    }
  }
  
  enableTabCloaking(title = 'Google', favicon = '/favicon-google.ico') {
    document.title = title;
    
    const link = document.querySelector('link[rel="shortcut icon"]');
    if (link) {
      link.href = favicon;
    }
    
    this.features.tabCloaking = true;
    this.savePreference('tabCloaking', true);
  }
  
  disableTabCloaking() {
    document.title = `SlowGuardian v${this.version}`;
    
    const link = document.querySelector('link[rel="shortcut icon"]');
    if (link) {
      link.href = '/favicon.png';
    }
    
    this.features.tabCloaking = false;
    this.savePreference('tabCloaking', false);
  }
  
  loadPreferences() {
    try {
      const preferences = JSON.parse(localStorage.getItem('sg_preferences') || '{}');
      this.features = { ...this.features, ...preferences };
    } catch (error) {
      console.warn('Failed to load preferences:', error);
    }
  }
  
  savePreference(key, value) {
    try {
      const preferences = JSON.parse(localStorage.getItem('sg_preferences') || '{}');
      preferences[key] = value;
      localStorage.setItem('sg_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save preference:', error);
    }
  }
  
  getPreference(key, defaultValue = null) {
    try {
      const preferences = JSON.parse(localStorage.getItem('sg_preferences') || '{}');
      return preferences[key] ?? defaultValue;
    } catch (error) {
      return defaultValue;
    }
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
      }
    };
  }
}

// Create and initialize the app
const app = new SlowGuardianApp();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Export for global access
window.SlowGuardian = app;

// Also export for modules
export default app;