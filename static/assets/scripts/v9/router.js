/**
 * Router for SlowGuardian v9 single-page application
 */

import { $, $$, on, fadeIn, fadeOut } from "./utils.js";

class Router {
  constructor() {
    this.routes = new Map();
    this.currentPage = null;
    this.initialized = false;

    this.setupEventListeners();
  }

  init() {
    if (this.initialized) return;

    // Handle initial route
    this.handleRoute();
    this.initialized = true;
  }

  setupEventListeners() {
    // Handle popstate (back/forward buttons)
    on(window, "popstate", () => {
      this.handleRoute();
    });

    // Handle navigation clicks with enhanced detection
    on(document, "click", (e) => {
      const link = e.target.closest('a[href^="/"], .nav-link');
      if (link && link.href) {
        const url = new URL(link.href);
        const path = url.pathname;
        
        // Only handle SPA routes, let external links work normally
        if (this.routes.has(path)) {
          e.preventDefault();
          e.stopPropagation();
          this.navigate(path);
        }
      }
    });

    // Enhanced route detection for forms and other elements
    on(document, "submit", (e) => {
      const form = e.target;
      if (form.id === "fs" || form.classList.contains("search-form")) {
        // Let the existing form handler deal with this
        return;
      }
    });
  }

  register(path, config) {
    this.routes.set(path, {
      element: config.element || `#page-${path.slice(1) || "home"}`,
      title: config.title || "SlowGuardian",
      onEnter: config.onEnter || (() => {}),
      onLeave: config.onLeave || (() => {}),
      ...config,
    });
  }

  navigate(path, replaceState = false) {
    if (path === this.currentPage) return;

    const method = replaceState ? "replaceState" : "pushState";
    history[method](null, "", path);

    this.handleRoute();
  }

  async handleRoute() {
    const path = window.location.pathname;
    const route = this.routes.get(path);

    if (!route) {
      // Handle 404 or redirect to home
      this.navigate("/", true);
      return;
    }

    await this.switchPage(route, path);
  }

  async switchPage(route, path) {
    const newPageElement = $(route.element);

    if (!newPageElement) {
      console.error(`Page element not found: ${route.element}`);
      return;
    }

    // Call onLeave for current page
    if (this.currentPage) {
      const currentRoute = this.routes.get(this.currentPage);
      if (currentRoute?.onLeave) {
        await currentRoute.onLeave();
      }
    }

    // Hide current page
    const currentPageElement = $(".page.active");
    if (currentPageElement) {
      currentPageElement.classList.remove("active");
    }

    // Update navigation
    this.updateNavigation(path);

    // Show new page
    newPageElement.classList.add("active");

    // Update document title
    document.title = route.title;

    // Call onEnter for new page
    if (route.onEnter) {
      await route.onEnter();
    }

    this.currentPage = path;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  updateNavigation(currentPath) {
    // Update navigation active states
    $$(".nav-link").forEach((link) => {
      link.classList.remove("active");

      const href = link.getAttribute("href");
      if (
        href === currentPath ||
        (currentPath === "/" && href === "/") ||
        (currentPath.startsWith(href) && href !== "/")
      ) {
        link.classList.add("active");
      }
    });
  }

  // Get current route
  getCurrentRoute() {
    return this.routes.get(this.currentPage);
  }

  // Get all registered routes
  getRoutes() {
    return Array.from(this.routes.entries());
  }
}

// Page controllers
class PageController {
  constructor(name) {
    this.name = name;
    this.element = null;
    this.initialized = false;
  }

  async onEnter() {
    if (!this.initialized) {
      await this.init();
      this.initialized = true;
    }

    await this.load();
  }

  async onLeave() {
    await this.cleanup();
  }

  async init() {
    // Override in subclasses
  }

  async load() {
    // Override in subclasses
  }

  async cleanup() {
    // Override in subclasses
  }
}

// Home page controller
class HomeController extends PageController {
  constructor() {
    super("home");
    this.stats = null;
    this.statsInterval = null;
  }

  async init() {
    this.element = $("#page-home");
    this.setupSearchForm();
    this.setupQuickAccess();
  }

  async load() {
    await this.loadStats();
    this.startStatsUpdate();
  }

  async cleanup() {
    this.stopStatsUpdate();
  }

  setupSearchForm() {
    const form = $("#proxy-form");
    const input = $("#url-input");

    if (form && input) {
      on(form, "submit", (e) => {
        e.preventDefault();
        const url = input.value.trim();
        if (url) {
          this.handleSearch(url);
        }
      });

      // Auto-focus on input
      input.focus();
    }
  }

  setupQuickAccess() {
    $$(".quick-item").forEach((item) => {
      on(item, "click", (e) => {
        e.preventDefault();
        const url = item.dataset.url;
        if (url) {
          this.handleSearch(url);
        }
      });
    });
  }

  handleSearch(input) {
    // Import proxy utilities and handle the search
    import("./proxy.js").then(({ handleProxyRequest }) => {
      handleProxyRequest(input, false);
    });
  }

  async loadStats() {
    try {
      const response = await fetch("/api/info");
      this.stats = await response.json();
      this.updateStatsDisplay();
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }

  updateStatsDisplay() {
    if (!this.stats) return;

    const uptimeElement = $("#uptime");
    const memoryElement = $("#memory");

    if (uptimeElement) {
      uptimeElement.textContent = this.formatUptime(this.stats.uptime);
    }

    if (memoryElement) {
      memoryElement.textContent = `${this.stats.memory.used}MB`;
    }
  }

  formatUptime(seconds) {
    if (seconds < 60) {
      return `${Math.floor(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h`;
    } else {
      const days = Math.floor(seconds / 86400);
      return `${days}d`;
    }
  }

  startStatsUpdate() {
    this.statsInterval = setInterval(() => {
      this.loadStats();
    }, 10000); // Update every 10 seconds
  }

  stopStatsUpdate() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }
}

// Apps page controller
class AppsController extends PageController {
  constructor() {
    super("apps");
    this.apps = [];
  }

  async init() {
    this.element = $("#page-apps");
  }

  async load() {
    await this.loadApps();
    this.renderApps();
  }

  async loadApps() {
    try {
      const response = await fetch("/assets/json/a.min.json");
      this.apps = await response.json();
    } catch (error) {
      console.error("Failed to load apps:", error);
      this.apps = [];
    }
  }

  renderApps() {
    const container = $("#apps-grid");
    if (!container) return;

    container.innerHTML = "";

    this.apps.forEach((app) => {
      const appElement = this.createAppElement(app);
      container.appendChild(appElement);
    });
  }

  createAppElement(app) {
    const element = document.createElement("div");
    element.className = "card card-hover-lift";
    element.innerHTML = `
      <div class="card-header">
        <div class="card-title">${app.name}</div>
        <div class="card-subtitle">${app.description || ""}</div>
      </div>
      <div class="card-content">
        <div class="app-categories">
          ${
            app.categories
              ? app.categories
                  .map(
                    (cat) => `<span class="badge badge-secondary">${cat}</span>`
                  )
                  .join("")
              : ""
          }
        </div>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary" data-url="${app.link}">
          Launch App
        </button>
      </div>
    `;

    const launchBtn = element.querySelector(".btn");
    on(launchBtn, "click", () => {
      import("./proxy.js").then(({ handleProxyRequest }) => {
        handleProxyRequest(app.link, false);
      });
    });

    return element;
  }
}

// Games page controller
class GamesController extends PageController {
  constructor() {
    super("games");
    this.games = [];
  }

  async init() {
    this.element = $("#page-games");
  }

  async load() {
    await this.loadGames();
    this.renderGames();
  }

  async loadGames() {
    try {
      const response = await fetch("/assets/json/g.min.json");
      this.games = await response.json();
    } catch (error) {
      console.error("Failed to load games:", error);
      this.games = [];
    }
  }

  renderGames() {
    const container = $("#games-grid");
    if (!container) return;

    container.innerHTML = "";

    this.games.forEach((game) => {
      const gameElement = this.createGameElement(game);
      container.appendChild(gameElement);
    });
  }

  createGameElement(game) {
    const element = document.createElement("div");
    element.className = "card card-hover-lift";
    element.innerHTML = `
      <div class="card-header">
        <div class="card-title">${game.name}</div>
        <div class="card-subtitle">${game.description || ""}</div>
      </div>
      <div class="card-content">
        <div class="game-categories">
          ${
            game.categories
              ? game.categories
                  .map(
                    (cat) => `<span class="badge badge-secondary">${cat}</span>`
                  )
                  .join("")
              : ""
          }
        </div>
        ${
          game.error
            ? `<div class="alert alert-error">
          <div class="alert-icon">⚠️</div>
          <div class="alert-content">${game.say || "This game is currently unavailable"}</div>
        </div>`
            : ""
        }
        ${
          game.partial
            ? `<div class="alert alert-warning">
          <div class="alert-icon">⚠️</div>
          <div class="alert-content">${game.say || "This game may not work for all users"}</div>
        </div>`
            : ""
        }
      </div>
      <div class="card-footer">
        <button class="btn btn-primary" data-url="${game.link}" ${game.error ? "disabled" : ""}>
          ${game.error ? "Unavailable" : "Play Game"}
        </button>
      </div>
    `;

    const playBtn = element.querySelector(".btn");
    if (!game.error) {
      on(playBtn, "click", () => {
        import("./proxy.js").then(({ handleProxyRequest }) => {
          handleProxyRequest(game.link, false);
        });
      });
    }

    return element;
  }
}

// Settings page controller
class SettingsController extends PageController {
  constructor() {
    super("settings");
  }

  async init() {
    this.element = $("#page-settings");
    this.renderSettings();
  }

  renderSettings() {
    const container = $("#settings-container");
    if (!container) return;

    container.innerHTML = `
      <div class="settings-section">
        <h3>🎨 Appearance</h3>
        <div class="form-group">
          <label class="form-label">Theme</label>
          <div class="theme-selector">
            <select class="form-select" id="theme-select">
              <option value="default">Default</option>
              <option value="cyberpunk">Cyberpunk</option>
              <option value="ocean">Ocean</option>
              <option value="sunset">Sunset</option>
              <option value="catppuccinMocha">Catppuccin Mocha</option>
              <option value="catppuccinLatte">Catppuccin Latte</option>
              <option value="custom">Custom</option>
            </select>
            <button class="btn btn-secondary" id="create-theme-btn">Create Custom Theme</button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3>🔒 Privacy & Security</h3>
        <div class="form-checkbox">
          <input type="checkbox" id="ab-cloak-toggle">
          <label for="ab-cloak-toggle">
            <strong>About:Blank Popup</strong><br>
            <small>Open links in cloaked about:blank windows</small>
          </label>
        </div>
        <div class="form-checkbox">
          <input type="checkbox" id="tab-cloak-toggle">
          <label for="tab-cloak-toggle">
            <strong>Tab Cloaking</strong><br>
            <small>Disguise browser tab as Google Drive</small>
          </label>
        </div>
        <div class="form-group">
          <label class="form-label">Tab Disguise</label>
          <select class="form-select" id="tab-disguise-select">
            <option value="drive">My Drive - Google Drive</option>
            <option value="gmail">Gmail</option>
            <option value="youtube">YouTube</option>
            <option value="google">Google</option>
            <option value="canvas">Canvas</option>
            <option value="schoology">Schoology</option>
          </select>
        </div>
      </div>

      <div class="settings-section">
        <h3>🛡️ Screenshot Protection</h3>
        <div class="form-checkbox">
          <input type="checkbox" id="screenshot-protection-toggle">
          <label for="screenshot-protection-toggle">
            <strong>Anti-Surveillance Mode</strong><br>
            <small>Hide SlowGuardian when screenshot attempts are detected</small>
          </label>
        </div>
        <div class="button-group">
          <button class="btn btn-secondary" id="test-screenshot-protection">Test Protection</button>
        </div>
        <div class="form-info">
          <div class="alert alert-info">
            <div class="alert-icon">ℹ️</div>
            <div class="alert-content">
              <strong>How it works:</strong> When enabled, this feature detects screenshot attempts (PrintScreen, Snipping Tool, etc.) and temporarily shows spoofed content instead of SlowGuardian.
            </div>
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>⚡ Performance</h3>
        <div class="form-checkbox">
          <input type="checkbox" id="particles-toggle" checked>
          <label for="particles-toggle">
            <strong>Background Particles</strong><br>
            <small>Enable animated particle effects</small>
          </label>
        </div>
        <div class="form-checkbox">
          <input type="checkbox" id="animations-toggle" checked>
          <label for="animations-toggle">
            <strong>Animations</strong><br>
            <small>Enable UI transitions and animations</small>
          </label>
        </div>
      </div>

      <div class="settings-section">
        <h3>🔍 Search & Proxy</h3>
        <div class="form-group">
          <label class="form-label">Search Engine</label>
          <select class="form-select" id="search-engine-select">
            <option value="https://www.google.com/search?q=">Google</option>
            <option value="https://duckduckgo.com/?q=">DuckDuckGo</option>
            <option value="https://www.bing.com/search?q=">Bing</option>
            <option value="https://search.brave.com/search?q=">Brave</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Proxy Service</label>
          <select class="form-select" id="proxy-select">
            <option value="ultraviolet">Ultraviolet (Recommended)</option>
            <option value="dynamic">Dynamic</option>
          </select>
        </div>
      </div>

      <div class="settings-section">
        <h3>💾 Data Management</h3>
        <div class="button-group">
          <button class="btn btn-warning" id="reset-settings-btn">Reset Settings</button>
          <button class="btn btn-secondary" id="export-settings-btn">Export Settings</button>
          <button class="btn btn-secondary" id="import-settings-btn">Import Settings</button>
        </div>
      </div>
    `;

    // Custom Theme Creator Modal
    this.createThemeCreatorModal();
    this.setupSettingsEvents();
    this.loadCurrentSettings();
  }

  createThemeCreatorModal() {
    const modal = document.createElement('div');
    modal.id = 'theme-creator-modal';
    modal.className = 'theme-creator-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3>🎨 Create Custom Theme</h3>
          <button class="modal-close" id="close-theme-creator">&times;</button>
        </div>
        <div class="modal-content">
          <div class="theme-creator-grid">
            <div class="color-section">
              <h4>Background Colors</h4>
              <div class="color-input-group">
                <label>Primary Background</label>
                <input type="color" id="bg-primary" value="#0a0a0f">
              </div>
              <div class="color-input-group">
                <label>Secondary Background</label>
                <input type="color" id="bg-secondary" value="#1a1a2e">
              </div>
              <div class="color-input-group">
                <label>Card Background</label>
                <input type="color" id="bg-card" value="#16213e">
              </div>
            </div>
            
            <div class="color-section">
              <h4>Text Colors</h4>
              <div class="color-input-group">
                <label>Primary Text</label>
                <input type="color" id="text-primary" value="#ffffff">
              </div>
              <div class="color-input-group">
                <label>Secondary Text</label>
                <input type="color" id="text-secondary" value="#a0a0a0">
              </div>
            </div>
            
            <div class="color-section">
              <h4>Accent Colors</h4>
              <div class="color-input-group">
                <label>Primary Accent</label>
                <input type="color" id="accent-primary" value="#4f46e5">
              </div>
              <div class="color-input-group">
                <label>Secondary Accent</label>
                <input type="color" id="accent-secondary" value="#7c3aed">
              </div>
            </div>
          </div>
          
          <div class="theme-preview">
            <h4>Preview</h4>
            <div class="preview-container" id="theme-preview">
              <div class="preview-card">
                <h5>Sample Card</h5>
                <p>This is how your theme will look</p>
                <button class="preview-btn">Sample Button</button>
              </div>
            </div>
          </div>
          
          <div class="theme-name-section">
            <label for="theme-name">Theme Name</label>
            <input type="text" id="theme-name" placeholder="My Custom Theme">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cancel-theme">Cancel</button>
          <button class="btn btn-primary" id="save-theme">Save Theme</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  setupSettingsEvents() {
    // Theme selector
    const themeSelect = $("#theme-select");
    if (themeSelect) {
      themeSelect.value = localStorage.getItem('theme') || 'default';
      themeSelect.addEventListener('change', (e) => {
        const theme = e.target.value;
        this.applyTheme(theme);
        localStorage.setItem('theme', theme);
      });
    }

    // Create theme button
    const createThemeBtn = $("#create-theme-btn");
    if (createThemeBtn) {
      createThemeBtn.addEventListener('click', () => {
        document.getElementById('theme-creator-modal').style.display = 'flex';
      });
    }

    // Theme creator modal events
    this.setupThemeCreatorEvents();

    // Privacy settings
    const abCloakToggle = $("#ab-cloak-toggle");
    if (abCloakToggle) {
      abCloakToggle.checked = localStorage.getItem('ab') === 'true';
      abCloakToggle.addEventListener('change', (e) => {
        localStorage.setItem('ab', e.target.checked.toString());
      });
    }

    const tabCloakToggle = $("#tab-cloak-toggle");
    if (tabCloakToggle) {
      tabCloakToggle.checked = localStorage.getItem('tab-cloak-enabled') === 'true';
      tabCloakToggle.addEventListener('change', (e) => {
        localStorage.setItem('tab-cloak-enabled', e.target.checked.toString());
      });
    }

    // Screenshot protection settings
    const screenshotProtectionToggle = $("#screenshot-protection-toggle");
    if (screenshotProtectionToggle) {
      screenshotProtectionToggle.checked = localStorage.getItem('screenshot-protection') === 'true';
      screenshotProtectionToggle.addEventListener('change', (e) => {
        if (window.ScreenshotProtection) {
          if (e.target.checked) {
            window.ScreenshotProtection.enable();
          } else {
            window.ScreenshotProtection.disable();
          }
        } else {
          localStorage.setItem('screenshot-protection', e.target.checked.toString());
        }
      });
    }

    const testScreenshotProtection = $("#test-screenshot-protection");
    if (testScreenshotProtection) {
      testScreenshotProtection.addEventListener('click', () => {
        if (window.ScreenshotProtection) {
          window.ScreenshotProtection.test();
        } else {
          if (window.showNotification) {
            window.showNotification('Screenshot protection not available', 'error');
          }
        }
      });
    }

    // Performance settings
    const particlesToggle = $("#particles-toggle");
    if (particlesToggle) {
      particlesToggle.checked = localStorage.getItem('Particles') !== 'false';
      particlesToggle.addEventListener('change', (e) => {
        localStorage.setItem('Particles', e.target.checked.toString());
        if (window.showNotification) {
          window.showNotification('Reload the page to see particle changes', 'info');
        }
      });
    }

    const animationsToggle = $("#animations-toggle");
    if (animationsToggle) {
      animationsToggle.checked = localStorage.getItem('animations') !== 'false';
      animationsToggle.addEventListener('change', (e) => {
        localStorage.setItem('animations', e.target.checked.toString());
        document.documentElement.classList.toggle('no-animations', !e.target.checked);
      });
    }

    // Search and proxy settings
    const searchEngineSelect = $("#search-engine-select");
    if (searchEngineSelect) {
      searchEngineSelect.value = localStorage.getItem('search-engine') || 'https://www.google.com/search?q=';
      searchEngineSelect.addEventListener('change', (e) => {
        localStorage.setItem('search-engine', e.target.value);
      });
    }

    const proxySelect = $("#proxy-select");
    if (proxySelect) {
      proxySelect.value = localStorage.getItem('proxy-service') || 'ultraviolet';
      proxySelect.addEventListener('change', (e) => {
        localStorage.setItem('proxy-service', e.target.value);
      });
    }

    // Data management
    const resetBtn = $("#reset-settings-btn");
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all settings? This cannot be undone.')) {
          localStorage.clear();
          sessionStorage.clear();
          location.reload();
        }
      });
    }

    const exportBtn = $("#export-settings-btn");
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportSettings();
      });
    }

    const importBtn = $("#import-settings-btn");
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        this.importSettings();
      });
    }
  }

  setupThemeCreatorEvents() {
    // Close modal events
    const closeBtn = $("#close-theme-creator");
    const cancelBtn = $("#cancel-theme");
    const modal = document.getElementById('theme-creator-modal');
    
    [closeBtn, cancelBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      }
    });

    // Close on overlay click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
          modal.style.display = 'none';
        }
      });
    }

    // Color input events for live preview
    const colorInputs = ['bg-primary', 'bg-secondary', 'bg-card', 'text-primary', 'text-secondary', 'accent-primary', 'accent-secondary'];
    colorInputs.forEach(inputId => {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener('input', () => {
          this.updateThemePreview();
        });
      }
    });

    // Save theme button
    const saveBtn = $("#save-theme");
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveCustomTheme();
      });
    }
  }

  updateThemePreview() {
    const preview = document.getElementById('theme-preview');
    if (!preview) return;

    const colors = {
      bgPrimary: document.getElementById('bg-primary')?.value || '#0a0a0f',
      bgSecondary: document.getElementById('bg-secondary')?.value || '#1a1a2e',
      bgCard: document.getElementById('bg-card')?.value || '#16213e',
      textPrimary: document.getElementById('text-primary')?.value || '#ffffff',
      textSecondary: document.getElementById('text-secondary')?.value || '#a0a0a0',
      accentPrimary: document.getElementById('accent-primary')?.value || '#4f46e5',
      accentSecondary: document.getElementById('accent-secondary')?.value || '#7c3aed',
    };

    preview.style.background = colors.bgPrimary;
    const card = preview.querySelector('.preview-card');
    if (card) {
      card.style.background = colors.bgCard;
      card.style.color = colors.textPrimary;
      card.style.border = `1px solid ${colors.accentPrimary}`;
      
      const title = card.querySelector('h5');
      if (title) title.style.color = colors.textPrimary;
      
      const text = card.querySelector('p');
      if (text) text.style.color = colors.textSecondary;
      
      const btn = card.querySelector('.preview-btn');
      if (btn) {
        btn.style.background = `linear-gradient(45deg, ${colors.accentPrimary}, ${colors.accentSecondary})`;
        btn.style.color = '#ffffff';
        btn.style.border = `1px solid ${colors.accentPrimary}`;
      }
    }
  }

  saveCustomTheme() {
    const themeName = document.getElementById('theme-name')?.value || 'Custom Theme';
    
    const customTheme = {
      name: themeName,
      colors: {
        bgPrimary: document.getElementById('bg-primary')?.value || '#0a0a0f',
        bgSecondary: document.getElementById('bg-secondary')?.value || '#1a1a2e',
        bgCard: document.getElementById('bg-card')?.value || '#16213e',
        textPrimary: document.getElementById('text-primary')?.value || '#ffffff',
        textSecondary: document.getElementById('text-secondary')?.value || '#a0a0a0',
        accentPrimary: document.getElementById('accent-primary')?.value || '#4f46e5',
        accentSecondary: document.getElementById('accent-secondary')?.value || '#7c3aed',
      }
    };

    // Save to localStorage
    localStorage.setItem('custom-theme', JSON.stringify(customTheme));
    
    // Apply the theme
    this.applyCustomTheme(customTheme);
    localStorage.setItem('theme', 'custom');
    
    // Close modal and update selector
    document.getElementById('theme-creator-modal').style.display = 'none';
    document.getElementById('theme-select').value = 'custom';
    
    if (window.showNotification) {
      window.showNotification(`Custom theme "${themeName}" saved successfully!`, 'success');
    }
  }

  applyCustomTheme(theme) {
    const css = `
      :root {
        --bg-primary: ${theme.colors.bgPrimary};
        --bg-secondary: ${theme.colors.bgSecondary};
        --bg-tertiary: ${theme.colors.bgCard};
        --text-primary: ${theme.colors.textPrimary};
        --text-secondary: ${theme.colors.textSecondary};
        --accent-primary: ${theme.colors.accentPrimary};
        --accent-secondary: ${theme.colors.accentSecondary};
        --gradient-bg: linear-gradient(135deg, ${theme.colors.bgPrimary} 0%, ${theme.colors.bgSecondary} 50%, ${theme.colors.bgCard} 100%);
        --gradient-primary: linear-gradient(45deg, ${theme.colors.accentPrimary}, ${theme.colors.accentSecondary});
      }
    `;
    
    // Remove existing custom theme
    const existingCustom = document.getElementById('custom-theme-style');
    if (existingCustom) {
      existingCustom.remove();
    }
    
    // Add new custom theme
    const style = document.createElement('style');
    style.id = 'custom-theme-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  applyTheme(theme) {
    // Remove existing theme stylesheets
    const existingTheme = document.querySelector('link[href*="/themes/"]');
    if (existingTheme) {
      existingTheme.remove();
    }
    
    const existingCustom = document.getElementById('custom-theme-style');
    if (existingCustom) {
      existingCustom.remove();
    }

    if (theme === 'custom') {
      const customTheme = JSON.parse(localStorage.getItem('custom-theme') || '{}');
      if (customTheme.colors) {
        this.applyCustomTheme(customTheme);
      }
    } else if (theme && theme !== 'default') {
      const themeEle = document.createElement("link");
      themeEle.rel = "stylesheet";
      
      if (theme.startsWith('catppuccin')) {
        const variant = theme.replace('catppuccin', '').toLowerCase();
        themeEle.href = `/assets/styles/themes/catppuccin/${variant}.css?v=1`;
      } else {
        themeEle.href = `/assets/styles/themes/${theme}.css?v=1`;
      }
      
      document.head.appendChild(themeEle);
    }
  }

  loadCurrentSettings() {
    // Load and apply current theme
    const currentTheme = localStorage.getItem('theme') || 'default';
    this.applyTheme(currentTheme);
  }

  exportSettings() {
    const settings = {
      theme: localStorage.getItem('theme'),
      customTheme: localStorage.getItem('custom-theme'),
      particles: localStorage.getItem('Particles'),
      animations: localStorage.getItem('animations'),
      abCloak: localStorage.getItem('ab'),
      tabCloak: localStorage.getItem('tab-cloak-enabled'),
      searchEngine: localStorage.getItem('search-engine'),
      proxyService: localStorage.getItem('proxy-service'),
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'slowguardian-settings.json';
    link.click();
    
    URL.revokeObjectURL(url);
    
    if (window.showNotification) {
      window.showNotification('Settings exported successfully!', 'success');
    }
  }

  importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target.result);
          
          // Apply imported settings
          Object.entries(settings).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              if (key === 'customTheme') {
                localStorage.setItem('custom-theme', value);
              } else {
                const storageKey = {
                  theme: 'theme',
                  particles: 'Particles',
                  animations: 'animations',
                  abCloak: 'ab',
                  tabCloak: 'tab-cloak-enabled',
                  searchEngine: 'search-engine',
                  proxyService: 'proxy-service'
                }[key];
                
                if (storageKey) {
                  localStorage.setItem(storageKey, value);
                }
              }
            }
          });
          
          if (window.showNotification) {
            window.showNotification('Settings imported successfully! Reloading page...', 'success');
          }
          
          setTimeout(() => {
            location.reload();
          }, 1500);
          
        } catch (error) {
          if (window.showNotification) {
            window.showNotification('Failed to import settings. Invalid file format.', 'error');
          }
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }
}

// Initialize router
const router = new Router();

// Register routes
router.register("/", {
  title: "SlowGuardian v9 - Home",
  onEnter: () => new HomeController().onEnter(),
});

router.register("/apps", {
  title: "SlowGuardian v9 - Apps",
  onEnter: () => new AppsController().onEnter(),
});

router.register("/games", {
  title: "SlowGuardian v9 - Games",
  onEnter: () => new GamesController().onEnter(),
});

router.register("/settings", {
  title: "SlowGuardian v9 - Settings",
  onEnter: () => new SettingsController().onEnter(),
});

export {
  router,
  PageController,
  HomeController,
  AppsController,
  GamesController,
  SettingsController,
};
