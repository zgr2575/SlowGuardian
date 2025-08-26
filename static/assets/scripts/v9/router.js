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

    // Handle navigation clicks
    on(document, "click", (e) => {
      const link = e.target.closest('a[href^="/"], .nav-link');
      if (link && link.href) {
        e.preventDefault();
        const url = new URL(link.href);
        this.navigate(url.pathname);
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
      handleProxyRequest(input);
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
        handleProxyRequest(app.link);
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
          handleProxyRequest(game.link);
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
        <h3>Appearance</h3>
        <div class="form-group">
          <label class="form-label">Theme</label>
          <select class="form-select" id="theme-select">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="high-contrast">High Contrast</option>
          </select>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>Performance</h3>
        <div class="form-checkbox">
          <input type="checkbox" id="particles-toggle" checked>
          <label for="particles-toggle">Enable background particles</label>
        </div>
        <div class="form-checkbox">
          <input type="checkbox" id="animations-toggle" checked>
          <label for="animations-toggle">Enable animations</label>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>Privacy</h3>
        <div class="form-checkbox">
          <input type="checkbox" id="tab-cloaking-toggle">
          <label for="tab-cloaking-toggle">Enable tab cloaking</label>
        </div>
      </div>
    `;

    this.setupSettingsEvents();
  }

  setupSettingsEvents() {
    // Theme selector
    const themeSelect = $("#theme-select");
    if (themeSelect) {
      themeSelect.value =
        document.documentElement.getAttribute("data-theme") || "dark";
      on(themeSelect, "change", (e) => {
        import("./utils.js").then(({ theme }) => {
          theme.set(e.target.value);
        });
      });
    }

    // Settings toggles would be implemented here
    // For now, they're just UI elements
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
