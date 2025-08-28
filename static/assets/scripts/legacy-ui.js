/**
 * Performance Mode for SlowGuardian v9
 * Optimized interface for less intensive laptops and slower devices
 */

class PerformanceMode {
  constructor() {
    this.isPerformanceMode = getCookie('performance-mode') === 'true' || localStorage.getItem('performance-mode') === 'true';
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
    console.log('🚀 Enabling Performance Mode...');
    
    // Apply performance optimizations
    this.removeHeavyAnimations();
    this.optimizeParticles();
    this.reduceVisualEffects();
    this.optimizeLayout();
    
    // Store preference
    setCookie('performance-mode', 'true', 365);
    localStorage.setItem('performance-mode', 'true');
    
    console.log('✅ Performance Mode enabled');
  }

  disablePerformanceMode() {
    console.log('🔄 Disabling Performance Mode...');
    
    // Restore full visual effects
    this.restoreAnimations();
    this.restoreParticles();
    this.restoreVisualEffects();
    this.restoreLayout();
    
    // Store preference
    setCookie('performance-mode', 'false', 365);
    localStorage.setItem('performance-mode', 'false');
    
    console.log('✅ Performance Mode disabled');
  }

  removeHeavyAnimations() {
    // Disable heavy CSS animations for better performance
    const style = document.createElement('style');
    style.id = 'performance-mode-animations';
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
    const particlesContainer = document.querySelector('#particles');
    if (particlesContainer) {
      particlesContainer.style.display = 'none';
    }
    
    // Disable any particle.js instances
    if (window.pJSDom && window.pJSDom.length > 0) {
      window.pJSDom.forEach(pjs => {
        if (pjs.pJS.fn.vendors.destroypJS) {
          pjs.pJS.fn.vendors.destroypJS();
        }
      });
    }
  }

  reduceVisualEffects() {
    // Apply performance-focused styles
    if (!this.performanceCSS) {
      this.performanceCSS = document.createElement('style');
      this.performanceCSS.id = 'performance-mode-styles';
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
    document.body.classList.add('performance-mode');
    
    // Reduce DOM updates
    document.documentElement.style.setProperty('--animation-speed', '0');
  }

  restoreAnimations() {
    const style = document.getElementById('performance-mode-animations');
    if (style) style.remove();
  }

  restoreParticles() {
    const particlesContainer = document.querySelector('#particles');
    if (particlesContainer) {
      particlesContainer.style.display = '';
    }
    
    // Reinitialize particles if available
    if (typeof initParticles === 'function') {
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
    document.body.classList.remove('performance-mode');
    document.documentElement.style.removeProperty('--animation-speed');
  }
        
        .btn {
          background: var(--legacy-accent) !important;
          color: white !important;
          border: none !important;
          padding: 10px 20px !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        
        .btn:hover {
          background: #d63447 !important;
          transform: translateY(-1px) !important;
        }
        
        .btn-secondary {
          background: var(--legacy-bg-tertiary) !important;
          border: 1px solid var(--legacy-border) !important;
        }
        
        .btn-secondary:hover {
          background: var(--legacy-border) !important;
        }
        
        .card {
          background: var(--legacy-bg-secondary) !important;
          border: 1px solid var(--legacy-border) !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
        }
        
        .card-header {
          background: var(--legacy-bg-tertiary) !important;
          border-bottom: 1px solid var(--legacy-border) !important;
          padding: 15px !important;
        }
        
        .card-title {
          color: var(--legacy-text-primary) !important;
          margin: 0 !important;
        }
        
        .quick-item {
          background: var(--legacy-bg-secondary) !important;
          border: 2px solid var(--legacy-border) !important;
          border-radius: 8px !important;
          color: var(--legacy-text-primary) !important;
          text-decoration: none !important;
          transition: all 0.2s ease !important;
        }
        
        .quick-item:hover {
          border-color: var(--legacy-accent) !important;
          transform: translateY(-2px) !important;
        }
        
        .content-grid {
          display: grid !important;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
          gap: 20px !important;
          padding: 20px !important;
        }
        
        .app-item, .game-item {
          background: var(--legacy-bg-secondary) !important;
          border: 1px solid var(--legacy-border) !important;
          border-radius: 8px !important;
          padding: 15px !important;
          transition: all 0.2s ease !important;
        }
        
        .app-item:hover, .game-item:hover {
          border-color: var(--legacy-accent) !important;
          transform: translateY(-2px) !important;
        }
        
        .footer {
          background: var(--legacy-bg-secondary) !important;
          border-top: 2px solid var(--legacy-accent) !important;
          color: var(--legacy-text-secondary) !important;
        }
        
        /* Remove modern animations and effects */
        * {
          animation: none !important;
          transition: all 0.2s ease !important;
        }
        
        .bg-particles {
          display: none !important;
        }
        
        .bg-gradient {
          background: var(--legacy-bg-primary) !important;
        }
        
        /* Legacy form styles */
        .form-input, .form-select {
          background: var(--legacy-bg-primary) !important;
          border: 1px solid var(--legacy-border) !important;
          color: var(--legacy-text-primary) !important;
          padding: 8px 12px !important;
          border-radius: 4px !important;
        }
        
        .form-input:focus, .form-select:focus {
          border-color: var(--legacy-accent) !important;
          outline: none !important;
        }
        
        /* Legacy modal styles */
        .modal {
          background: rgba(0,0,0,0.8) !important;
        }
        
        .modal-content {
          background: var(--legacy-bg-secondary) !important;
          border: 2px solid var(--legacy-border) !important;
          border-radius: 8px !important;
        }
        
        /* Hide modern decorative elements */
        .hero-decoration,
        .floating-icons,
        .glow-effect {
          display: none !important;
        }
        
        /* Legacy typography */
        h1, h2, h3, h4, h5, h6 {
          color: var(--legacy-text-primary) !important;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5) !important;
        }
        
        /* Responsive legacy design */
        @media (max-width: 768px) {
          .nav-links {
            flex-direction: column !important;
            gap: 5px !important;
          }
          
          .hero {
            margin: 10px !important;
            padding: 20px !important;
          }
          
          .hero-title {
            font-size: 2rem !important;
          }
          
          .content-grid {
            grid-template-columns: 1fr !important;
            padding: 10px !important;
          }
        }
      `;
      
      document.head.appendChild(this.legacyCSS);
    }
  }

  removeLegacyStyles() {
    if (this.legacyCSS) {
      this.legacyCSS.remove();
      this.legacyCSS = null;
    }
  }

  restoreModernStyles() {
    // Re-enable modern CSS files
    const modernStyles = [
      'assets/styles/v9/main.css',
      'assets/styles/v9/components.css',
      'assets/styles/v9/animations.css'
    ];
    
    modernStyles.forEach(href => {
      const link = document.querySelector(`link[href*="${href}"]`);
      if (link) {
        link.disabled = false;
      }
    });
  }

  modifyLayout() {
    // Add legacy mode indicator
    const indicator = document.createElement('div');
    indicator.id = 'legacy-mode-indicator';
    indicator.innerHTML = '📜 Legacy UI Mode';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: var(--legacy-accent);
      color: white;
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 12px;
      z-index: 10000;
      opacity: 0.8;
    `;
    document.body.appendChild(indicator);
    
    // Remove modern layout elements
    const modernElements = document.querySelectorAll('.hero-decoration, .floating-icons');
    modernElements.forEach(el => el.style.display = 'none');
  }

  restoreLayout() {
    // Remove legacy mode indicator
    const indicator = document.getElementById('legacy-mode-indicator');
    if (indicator) {
      indicator.remove();
    }
    
    // Restore modern layout elements
    const modernElements = document.querySelectorAll('.hero-decoration, .floating-icons');
    modernElements.forEach(el => el.style.display = '');
  }

  addLegacyModeToggle() {
    // Add toggle to settings page when it loads
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        this.insertLegacyToggle();
      }, 1000);
    });
  }

  insertLegacyToggle() {
    // Find settings container
    const settingsContainer = document.querySelector('.settings-grid, .dashboard-grid');
    if (!settingsContainer) return;
    
    // Create legacy UI card
    const legacyCard = document.createElement('div');
    legacyCard.className = 'card settings-card';
    legacyCard.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">📜 Legacy UI Mode</h3>
        <p class="card-description">Switch to the classic SlowGuardian v8 interface</p>
      </div>
      <div class="card-body">
        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">Enable Legacy UI</label>
            <span class="setting-description">Use the older, simpler interface design</span>
          </div>
          <div class="setting-control">
            <label class="switch">
              <input type="checkbox" id="legacy-ui-toggle" ${this.isLegacyMode ? 'checked' : ''}>
              <span class="switch-slider"></span>
            </label>
          </div>
        </div>
        
        <div class="legacy-ui-info" style="margin-top: 15px; padding: 10px; background: rgba(233, 69, 96, 0.1); border-radius: 6px; ${this.isLegacyMode ? '' : 'display: none;'}">
          <small style="color: var(--accent-primary);">
            <strong>Legacy Mode Active:</strong> You're using the classic SlowGuardian interface. 
            Some modern features may be limited in this mode.
          </small>
        </div>
      </div>
    `;
    
    // Insert at the beginning of settings
    settingsContainer.insertBefore(legacyCard, settingsContainer.firstChild);
    
    // Add event listener
    const toggle = document.getElementById('legacy-ui-toggle');
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.enableLegacyMode();
        } else {
          this.disableLegacyMode();
        }
        
        // Show/hide info
        const info = legacyCard.querySelector('.legacy-ui-info');
        if (info) {
          info.style.display = e.target.checked ? 'block' : 'none';
        }
        
        // Reload page to apply changes fully
        setTimeout(() => {
          if (window.showNotification) {
            window.showNotification('UI mode changed. Refreshing page...', 'info');
          }
          setTimeout(() => window.location.reload(), 1000);
        }, 500);
      });
    }
  }

  toggle() {
    if (this.isLegacyMode) {
      this.disableLegacyMode();
      this.isLegacyMode = false;
    } else {
      this.enableLegacyMode();
      this.isLegacyMode = true;
    }
  }
}

// Initialize Legacy UI Mode
const legacyUIMode = new LegacyUIMode();
window.legacyUIMode = legacyUIMode;

// Export for modules
if (typeof module !== 'undefined') {
  module.exports = LegacyUIMode;
}