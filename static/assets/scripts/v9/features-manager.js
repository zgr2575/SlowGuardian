/**
 * SlowGuardian v9 - Enhanced Features Management
 * Provides UI for managing 100+ quality of life features
 */

class FeaturesManager {
  constructor() {
    this.features = new Map();
    this.currentCategory = "all";
    this.searchQuery = "";
    this.initialize();
  }

  initialize() {
    console.log("🎛️ Initializing Features Manager...");
    this.createFeaturesInterface();
    this.loadFeatures();
    this.setupEventListeners();
  }

  createFeaturesInterface() {
    // Create features management section in settings
    const settingsContainer =
      document.querySelector(".settings-container") ||
      document.querySelector("main") ||
      document.body;

    const featuresSection = document.createElement("div");
    featuresSection.id = "features-management";
    featuresSection.className = "settings-section";
    featuresSection.innerHTML = `
      <div class="section-header">
        <h2>🚀 Features Manager</h2>
        <p>Customize your SlowGuardian experience with 100+ quality of life improvements</p>
      </div>
      
      <div class="features-controls">
        <div class="features-search">
          <input type="text" id="features-search" placeholder="🔍 Search features..." />
        </div>
        
        <div class="features-categories">
          <button class="category-btn active" data-category="all">All (100)</button>
          <button class="category-btn" data-category="ux">User Experience (25)</button>
          <button class="category-btn" data-category="productivity">Productivity (25)</button>
          <button class="category-btn" data-category="customization">Customization (25)</button>
          <button class="category-btn" data-category="advanced">Advanced (25)</button>
        </div>
        
        <div class="features-bulk-actions">
          <button id="enable-all-btn" class="btn btn-success">✅ Enable All</button>
          <button id="disable-all-btn" class="btn btn-warning">❌ Disable All</button>
          <button id="reset-features-btn" class="btn btn-secondary">🔄 Reset to Defaults</button>
        </div>
      </div>
      
      <div class="features-stats">
        <div class="stat-card">
          <span class="stat-number" id="enabled-count">0</span>
          <span class="stat-label">Enabled</span>
        </div>
        <div class="stat-card">
          <span class="stat-number" id="disabled-count">0</span>
          <span class="stat-label">Disabled</span>
        </div>
        <div class="stat-card">
          <span class="stat-number" id="total-count">100</span>
          <span class="stat-label">Total</span>
        </div>
      </div>
      
      <div class="features-grid" id="features-grid">
        <!-- Features will be populated here -->
      </div>
      
      <div class="features-performance">
        <h3>⚡ Performance Impact</h3>
        <div class="performance-bar">
          <div class="performance-fill" id="performance-fill"></div>
        </div>
        <p id="performance-text">Low impact - All features can be enabled safely</p>
      </div>
    `;

    // Add CSS styles for features management
    this.addFeaturesStyles();

    // Insert into settings page
    settingsContainer.appendChild(featuresSection);
  }

  addFeaturesStyles() {
    const styles = document.createElement("style");
    styles.id = "features-management-styles";
    styles.textContent = `
      .features-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
      }
      
      .features-search input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-lg);
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-size: 1rem;
      }
      
      .features-categories {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      
      .category-btn {
        padding: 8px 16px;
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-md);
        background: var(--bg-secondary);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
      }
      
      .category-btn.active,
      .category-btn:hover {
        background: var(--accent-primary);
        color: white;
        border-color: var(--accent-primary);
      }
      
      .features-bulk-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      
      .features-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }
      
      .stat-card {
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        text-align: center;
        transition: transform 0.3s ease;
      }
      
      .stat-card:hover {
        transform: translateY(-2px);
      }
      
      .stat-number {
        display: block;
        font-size: 2rem;
        font-weight: 700;
        color: var(--accent-primary);
      }
      
      .stat-label {
        color: var(--text-secondary);
        font-size: 0.9rem;
      }
      
      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }
      
      .feature-card {
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .feature-card:hover {
        border-color: var(--accent-primary);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }
      
      .feature-card.enabled {
        border-color: var(--success, #10b981);
        background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(16, 185, 129, 0.05) 100%);
      }
      
      .feature-card.enabled::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: var(--success, #10b981);
      }
      
      .feature-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
      }
      
      .feature-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }
      
      .feature-toggle {
        position: relative;
        width: 50px;
        height: 26px;
        background: var(--bg-tertiary);
        border-radius: 13px;
        cursor: pointer;
        transition: background 0.3s ease;
        border: none;
        outline: none;
      }
      
      .feature-toggle.enabled {
        background: var(--accent-primary);
      }
      
      .feature-toggle::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: transform 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      .feature-toggle.enabled::after {
        transform: translateX(24px);
      }
      
      .feature-description {
        color: var(--text-secondary);
        font-size: 0.9rem;
        line-height: 1.4;
        margin-bottom: 1rem;
      }
      
      .feature-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.8rem;
        color: var(--text-tertiary);
      }
      
      .feature-category {
        background: var(--accent-primary);
        color: white;
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        text-transform: uppercase;
        font-weight: 500;
      }
      
      .feature-performance {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .performance-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      
      .performance-low {
        background: var(--success, #10b981);
      }
      
      .performance-medium {
        background: var(--warning, #f59e0b);
      }
      
      .performance-high {
        background: var(--error, #ef4444);
      }
      
      .features-performance {
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
      }
      
      .performance-bar {
        width: 100%;
        height: 8px;
        background: var(--bg-tertiary);
        border-radius: 4px;
        overflow: hidden;
        margin: 1rem 0;
      }
      
      .performance-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--success, #10b981) 0%, var(--warning, #f59e0b) 70%, var(--error, #ef4444) 100%);
        border-radius: 4px;
        transition: width 0.3s ease;
        width: 25%;
      }
      
      @media (max-width: 768px) {
        .features-grid {
          grid-template-columns: 1fr;
        }
        
        .features-categories {
          flex-direction: column;
        }
        
        .category-btn {
          text-align: center;
        }
        
        .features-bulk-actions {
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  loadFeatures() {
    // Wait for features system to be ready
    if (typeof window.sgFeatures !== "undefined") {
      this.features = window.sgFeatures.features;
      this.renderFeatures();
      this.updateStats();
    } else {
      // Retry after a short delay
      setTimeout(() => this.loadFeatures(), 500);
    }
  }

  renderFeatures() {
    const grid = document.getElementById("features-grid");
    if (!grid) return;

    const filteredFeatures = this.getFilteredFeatures();

    grid.innerHTML = "";

    filteredFeatures.forEach(([id, feature]) => {
      const card = this.createFeatureCard(id, feature);
      grid.appendChild(card);
    });

    if (filteredFeatures.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);">
          <h3>No features found</h3>
          <p>Try adjusting your search or category filter</p>
        </div>
      `;
    }
  }

  createFeatureCard(id, feature) {
    const card = document.createElement("div");
    card.className = `feature-card ${feature.enabled ? "enabled" : ""}`;
    card.dataset.featureId = id;

    const performanceClass = this.getPerformanceClass(feature);
    const categoryDisplay = this.formatCategoryName(feature.category);

    card.innerHTML = `
      <div class="feature-header">
        <h3 class="feature-title">${feature.name}</h3>
        <button class="feature-toggle ${feature.enabled ? "enabled" : ""}" data-feature-id="${id}"></button>
      </div>
      
      <p class="feature-description">${feature.description}</p>
      
      <div class="feature-meta">
        <span class="feature-category">${categoryDisplay}</span>
        <div class="feature-performance">
          <div class="performance-indicator ${performanceClass}"></div>
          <span>${this.getPerformanceText(feature)}</span>
        </div>
      </div>
    `;

    // Add toggle event listener
    const toggle = card.querySelector(".feature-toggle");
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleFeature(id);
    });

    return card;
  }

  getFilteredFeatures() {
    const features = Array.from(this.features.entries());

    return features.filter(([id, feature]) => {
      // Category filter
      if (
        this.currentCategory !== "all" &&
        feature.category !== this.currentCategory
      ) {
        return false;
      }

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return (
          feature.name.toLowerCase().includes(query) ||
          feature.description.toLowerCase().includes(query) ||
          id.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }

  toggleFeature(featureId) {
    if (!window.sgFeatures) return;

    const feature = this.features.get(featureId);
    if (!feature) return;

    if (feature.enabled) {
      window.sgFeatures.disableFeature(featureId);
    } else {
      window.sgFeatures.enableFeature(featureId);
    }

    // Update UI
    this.renderFeatures();
    this.updateStats();
    this.updatePerformanceIndicator();

    // Show notification
    this.showNotification(
      feature.enabled
        ? `✅ ${feature.name} enabled`
        : `❌ ${feature.name} disabled`
    );
  }

  updateStats() {
    const enabledFeatures = Array.from(this.features.values()).filter(
      (f) => f.enabled
    );
    const totalFeatures = this.features.size;

    document.getElementById("enabled-count").textContent =
      enabledFeatures.length;
    document.getElementById("disabled-count").textContent =
      totalFeatures - enabledFeatures.length;
    document.getElementById("total-count").textContent = totalFeatures;
  }

  updatePerformanceIndicator() {
    const enabledFeatures = Array.from(this.features.values()).filter(
      (f) => f.enabled
    );
    const performanceImpact = Math.min(
      (enabledFeatures.length / 100) * 100,
      100
    );

    const fill = document.getElementById("performance-fill");
    const text = document.getElementById("performance-text");

    if (fill) {
      fill.style.width = `${performanceImpact}%`;
    }

    if (text) {
      if (performanceImpact < 30) {
        text.textContent = "Low impact - Excellent performance";
      } else if (performanceImpact < 60) {
        text.textContent = "Medium impact - Good performance";
      } else if (performanceImpact < 80) {
        text.textContent = "High impact - May affect performance";
      } else {
        text.textContent =
          "Very high impact - Consider disabling some features";
      }
    }
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("features-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        this.renderFeatures();
      });
    }

    // Category filtering
    document.querySelectorAll(".category-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // Update active category
        document
          .querySelectorAll(".category-btn")
          .forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");

        this.currentCategory = e.target.dataset.category;
        this.renderFeatures();
      });
    });

    // Bulk actions
    const enableAllBtn = document.getElementById("enable-all-btn");
    if (enableAllBtn) {
      enableAllBtn.addEventListener("click", () => {
        this.enableAllFeatures();
      });
    }

    const disableAllBtn = document.getElementById("disable-all-btn");
    if (disableAllBtn) {
      disableAllBtn.addEventListener("click", () => {
        this.disableAllFeatures();
      });
    }

    const resetBtn = document.getElementById("reset-features-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.resetToDefaults();
      });
    }
  }

  enableAllFeatures() {
    if (!window.sgFeatures) return;

    let count = 0;
    this.features.forEach((feature, id) => {
      if (!feature.enabled) {
        window.sgFeatures.enableFeature(id);
        count++;
      }
    });

    this.renderFeatures();
    this.updateStats();
    this.updatePerformanceIndicator();
    this.showNotification(`✅ Enabled ${count} features`);
  }

  disableAllFeatures() {
    if (!window.sgFeatures) return;

    let count = 0;
    this.features.forEach((feature, id) => {
      if (feature.enabled) {
        window.sgFeatures.disableFeature(id);
        count++;
      }
    });

    this.renderFeatures();
    this.updateStats();
    this.updatePerformanceIndicator();
    this.showNotification(`❌ Disabled ${count} features`);
  }

  resetToDefaults() {
    if (
      !confirm("Reset all features to default settings? This cannot be undone.")
    ) {
      return;
    }

    localStorage.removeItem("feature_states");
    location.reload();
  }

  getPerformanceClass(feature) {
    // Determine performance impact based on feature category and type
    if (feature.category === "advanced") return "performance-high";
    if (feature.category === "productivity") return "performance-medium";
    return "performance-low";
  }

  getPerformanceText(feature) {
    const className = this.getPerformanceClass(feature);
    switch (className) {
      case "performance-low":
        return "Low";
      case "performance-medium":
        return "Medium";
      case "performance-high":
        return "High";
      default:
        return "Low";
    }
  }

  formatCategoryName(category) {
    const names = {
      ux: "UX",
      productivity: "Productivity",
      customization: "Customization",
      advanced: "Advanced",
    };
    return names[category] || category;
  }

  showNotification(message) {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
      padding: 1rem 1.5rem;
      color: var(--text-primary);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-in forwards";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize features manager when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Wait a bit for the main features system to load
  setTimeout(() => {
    window.featuresManager = new FeaturesManager();
  }, 1000);
});

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = FeaturesManager;
}
