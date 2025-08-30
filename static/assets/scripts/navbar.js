/**
 * Centralized Navigation Bar System
 * Handles sidebar navigation with hover animations and active page detection
 */

class NavigationBar {
  constructor() {
    this.currentPage = this.detectCurrentPage();
    this.isHovered = false;
    this.hideTimeout = null;
    
    this.init();
  }

  detectCurrentPage() {
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index.html') return 'home';
    if (path.includes('/apps')) return 'apps';
    if (path.includes('/games')) return 'games';
    if (path.includes('/tabs')) return 'tabs';
    if (path.includes('/settings')) return 'settings';
    
    return 'home'; // default
  }

  init() {
    this.createNavbar();
    this.attachEventListeners();
    this.injectStyles();
  }

  createNavbar() {
    // Remove existing navbar if any
    const existingNav = document.querySelector('.navbar, .sidebar-nav');
    if (existingNav) {
      existingNav.remove();
    }

    // Create sidebar navigation
    const navbar = document.createElement('nav');
    navbar.className = 'sidebar-nav';
    navbar.id = 'sidebar-nav';
    
    navbar.innerHTML = `
      <div class="sidebar-content">
        <!-- Brand Section -->
        <div class="sidebar-brand">
          <div class="brand-icon">🛡️</div>
          <div class="brand-text">
            <div class="brand-name">SlowGuardian</div>
            <div class="brand-version">v9</div>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="sidebar-links">
          <a href="/" class="sidebar-link ${this.currentPage === 'home' ? 'active' : ''}" data-page="home">
            <div class="link-icon">🏠</div>
            <span class="link-text">Home</span>
          </a>
          <a href="/apps" class="sidebar-link ${this.currentPage === 'apps' ? 'active' : ''}" data-page="apps">
            <div class="link-icon">📱</div>
            <span class="link-text">Apps</span>
          </a>
          <a href="/games" class="sidebar-link ${this.currentPage === 'games' ? 'active' : ''}" data-page="games">
            <div class="link-icon">🎮</div>
            <span class="link-text">Games</span>
          </a>
          <a href="/tabs" class="sidebar-link ${this.currentPage === 'tabs' ? 'active' : ''}" data-page="tabs">
            <div class="link-icon">🗂️</div>
            <span class="link-text">Tabs</span>
          </a>
          <a href="/settings" class="sidebar-link ${this.currentPage === 'settings' ? 'active' : ''}" data-page="settings">
            <div class="link-icon">⚙️</div>
            <span class="link-text">Settings</span>
          </a>
        </div>

        <!-- Actions Section -->
        <div class="sidebar-actions">
          <button class="sidebar-action" id="theme-toggle" title="Toggle theme">
            <div class="action-icon">🌙</div>
            <span class="action-text">Theme</span>
          </button>
          <button class="sidebar-action" id="fullscreen-toggle" title="Toggle fullscreen">
            <div class="action-icon">⛶</div>
            <span class="action-text">Fullscreen</span>
          </button>
        </div>
      </div>

      <!-- Hover trigger area -->
      <div class="sidebar-trigger"></div>
    `;

    // Insert at the beginning of body
    document.body.insertBefore(navbar, document.body.firstChild);
  }

  attachEventListeners() {
    const sidebar = document.getElementById('sidebar-nav');
    const trigger = sidebar.querySelector('.sidebar-trigger');
    
    // Hover to show
    sidebar.addEventListener('mouseenter', () => {
      this.showSidebar();
    });

    // Hide when leaving
    sidebar.addEventListener('mouseleave', () => {
      this.hideSidebar();
    });

    // Theme toggle
    const themeToggle = sidebar.querySelector('#theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        if (typeof window.changeTheme === 'function') {
          // Use legacy theme system if available
          window.changeTheme();
        } else if (typeof window.theme !== 'undefined' && window.theme.toggle) {
          // Use v9 theme system
          window.theme.toggle();
        } else {
          // Fallback - manual theme toggle
          this.toggleTheme();
        }
      });
    }

    // Fullscreen toggle
    const fullscreenToggle = sidebar.querySelector('#fullscreen-toggle');
    if (fullscreenToggle) {
      fullscreenToggle.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }

    // Navigation links
    sidebar.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', (e) => {
        // Update active state
        sidebar.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Hide sidebar after navigation
        setTimeout(() => {
          this.hideSidebar();
        }, 150);
      });
    });
  }

  showSidebar() {
    const sidebar = document.getElementById('sidebar-nav');
    sidebar.classList.add('expanded');
    this.isHovered = true;
    
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  hideSidebar() {
    this.isHovered = false;
    this.hideTimeout = setTimeout(() => {
      if (!this.isHovered) {
        const sidebar = document.getElementById('sidebar-nav');
        sidebar.classList.remove('expanded');
      }
    }, 300);
  }

  toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    
    // Update theme toggle icon
    const themeIcon = document.querySelector('#theme-toggle .action-icon');
    if (themeIcon) {
      themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  injectStyles() {
    const styleId = 'sidebar-nav-styles';
    
    // Remove existing styles
    const existingStyles = document.getElementById(styleId);
    if (existingStyles) {
      existingStyles.remove();
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Sidebar Navigation Styles */
      .sidebar-nav {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 280px;
        background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
        backdrop-filter: blur(20px);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        transform: translateX(-220px);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
      }

      .sidebar-nav.expanded {
        transform: translateX(0);
      }

      .sidebar-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 20px;
        position: relative;
      }

      .sidebar-trigger {
        position: absolute;
        top: 0;
        right: -20px;
        width: 20px;
        height: 100%;
        background: transparent;
        cursor: pointer;
      }

      /* Brand Section */
      .sidebar-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 40px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .brand-icon {
        font-size: 32px;
        line-height: 1;
      }

      .brand-text {
        flex: 1;
      }

      .brand-name {
        font-size: 18px;
        font-weight: 700;
        color: #ffffff;
        line-height: 1;
        margin-bottom: 2px;
      }

      .brand-version {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        font-weight: 500;
      }

      /* Navigation Links */
      .sidebar-links {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .sidebar-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        border-radius: 10px;
        transition: all 0.2s ease;
        position: relative;
        background: transparent;
        border: 1px solid transparent;
      }

      .sidebar-link:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.1);
        transform: translateX(4px);
      }

      .sidebar-link.active {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      }

      .sidebar-link.active::before {
        content: '';
        position: absolute;
        left: -20px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 24px;
        background: #ffffff;
        border-radius: 2px;
      }

      .link-icon {
        font-size: 18px;
        width: 20px;
        text-align: center;
        line-height: 1;
      }

      .link-text {
        font-size: 14px;
        font-weight: 500;
        line-height: 1;
      }

      /* Actions Section */
      .sidebar-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .sidebar-action {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
      }

      .sidebar-action:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.2);
      }

      .action-icon {
        font-size: 16px;
        width: 18px;
        text-align: center;
        line-height: 1;
      }

      .action-text {
        font-size: 13px;
        font-weight: 500;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .sidebar-nav {
          width: 260px;
          transform: translateX(-200px);
        }
        
        .sidebar-content {
          padding: 16px;
        }
        
        .sidebar-brand {
          margin-bottom: 30px;
        }
      }

      /* Adjust main content to accommodate sidebar */
      body {
        transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Hide original navbar if it exists */
      .navbar:not(.sidebar-nav) {
        display: none !important;
      }

      /* Dark/Light theme adjustments */
      [data-theme="light"] .sidebar-nav {
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        border-right-color: rgba(0, 0, 0, 0.1);
        box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
      }

      [data-theme="light"] .sidebar-brand {
        background: rgba(0, 0, 0, 0.05);
        border-color: rgba(0, 0, 0, 0.1);
      }

      [data-theme="light"] .brand-name {
        color: #1a1a2e;
      }

      [data-theme="light"] .brand-version {
        color: rgba(0, 0, 0, 0.6);
      }

      [data-theme="light"] .sidebar-link {
        color: rgba(0, 0, 0, 0.8);
      }

      [data-theme="light"] .sidebar-link:hover {
        background: rgba(0, 0, 0, 0.08);
        color: #000000;
        border-color: rgba(0, 0, 0, 0.1);
      }

      [data-theme="light"] .sidebar-action {
        color: rgba(0, 0, 0, 0.8);
        border-color: rgba(0, 0, 0, 0.1);
      }

      [data-theme="light"] .sidebar-action:hover {
        background: rgba(0, 0, 0, 0.08);
        color: #000000;
        border-color: rgba(0, 0, 0, 0.2);
      }

      [data-theme="light"] .sidebar-actions {
        border-top-color: rgba(0, 0, 0, 0.1);
      }
    `;

    document.head.appendChild(style);
  }

  // Public method to update active page
  setActivePage(page) {
    this.currentPage = page;
    const sidebar = document.getElementById('sidebar-nav');
    if (sidebar) {
      sidebar.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
          link.classList.add('active');
        }
      });
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.sidebarNav = new NavigationBar();
  });
} else {
  window.sidebarNav = new NavigationBar();
}

// Global function to update active page
window.updateNavbarActivePage = function(page) {
  if (window.sidebarNav) {
    window.sidebarNav.setActivePage(page);
  }
};

// Mark module as loaded for loading system
if (typeof window.markModuleLoaded === 'function') {
  window.markModuleLoaded('navbar');
}