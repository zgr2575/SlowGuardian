/**
 * Centralized Navigation Bar System
 * Handles sidebar navigation with hover animations and active page detection
 */

class NavigationBar {
  constructor() {
    this.currentPage = this.detectCurrentPage();
    this.isHovered = false;
    this.hideTimeout = null;
    this.currentUser = null;

    this.init();
  }

  detectCurrentPage() {
    const path = window.location.pathname;

    if (path === "/" || path === "/index.html") return "home";
    if (path.includes("/apps")) return "apps";
    if (path.includes("/games")) return "games";
    if (path.includes("/music")) return "music";
    if (path.includes("/premium")) return "premium";
    if (path.includes("/tabs")) return "tabs";
    if (path.includes("/settings")) return "settings";
    if (path.includes("/go") || path.includes("/p/")) return "browser";

    return "home"; // default
  }

  async init() {
    await this.loadUserInfo();
    this.createNavbar();
    this.attachEventListeners();
    this.injectStyles();
    
    // Listen for KeyAuth status changes
    window.addEventListener('keyauth-status-changed', (event) => {
      this.loadUserInfo().then(() => {
        this.createNavbar();
        this.attachEventListeners();
      });
    });
  }

  async loadUserInfo() {
    try {
      // First check KeyAuth for user info
      if (window.keyAuthManager && window.keyAuthManager.isAuthenticated()) {
        const keyAuthUser = window.keyAuthManager.getUser();
        if (keyAuthUser) {
          this.currentUser = {
            username: keyAuthUser.username || 'Premium User',
            firstName: keyAuthUser.username || 'Premium',
            lastName: 'User',
            role: 'Premium',
            isPremium: true,
            isActivePremium: true,
            email: keyAuthUser.email || '',
            avatar: keyAuthUser.avatar || ''
          };
          console.log('✅ User loaded from KeyAuth:', this.currentUser.username);
          return;
        }
      }

      // Fallback to regular auth system
      const authToken = localStorage.getItem('authToken');
      const hasAuthCookie = document.cookie.includes('sg_auth=') || 
                           document.cookie.includes('sg_session=') ||
                           document.cookie.includes('sg_auth_ui=');

      if (authToken || hasAuthCookie) {
        const headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        };

        // Add Bearer token if available
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch('/api/auth/profile', {
          credentials: 'include',
          headers
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            this.currentUser = data.user;
            console.log('✅ User loaded from API:', this.currentUser.username);
          }
        }
      }
    } catch (error) {
      console.debug('Could not load user info:', error.message);
      // Not an error - user may not be logged in
    }
  }

  createNavbar() {
    // Remove existing navbar if any
    const existingNav = document.querySelector(".navbar, .sidebar-nav");
    if (existingNav) {
      existingNav.remove();
    }

    // Create sidebar navigation
    const navbar = document.createElement("nav");
    navbar.className = "sidebar-nav";
    navbar.id = "sidebar-nav";

    // Check if premium is active to determine whether to show Get Premium link
    const isPremium = typeof window.isPremiumActive === 'function' && window.isPremiumActive();
    const premiumLink = isPremium ? '' : `
          <a href="/premium" class="sidebar-link premium-gradient-link ${this.currentPage === "premium" ? "active" : ""}" data-page="premium">
            <div class="link-icon">⭐</div>
            <span class="link-text">Get Premium</span>
          </a>`;

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

        <!-- User Account Section -->
        ${this.currentUser ? this.renderUserSection() : this.renderLoginSection()}

        <!-- Navigation Links -->
        <div class="sidebar-links">
          <a href="/" class="sidebar-link ${this.currentPage === "home" ? "active" : ""}" data-page="home">
            <div class="link-icon">🏠</div>
            <span class="link-text">Home</span>
          </a>
          <a href="/apps" class="sidebar-link ${this.currentPage === "apps" ? "active" : ""}" data-page="apps">
            <div class="link-icon">📱</div>
            <span class="link-text">Apps</span>
          </a>
          <a href="/games" class="sidebar-link ${this.currentPage === "games" ? "active" : ""}" data-page="games">
            <div class="link-icon">🎮</div>
            <span class="link-text">Games</span>
          </a>
          <a href="/music" class="sidebar-link ${this.currentPage === "music" ? "active" : ""}" data-page="music">
            <div class="link-icon">🎵</div>
            <span class="link-text">Music</span>
          </a>${premiumLink}
          <a href="/tabs" class="sidebar-link ${this.currentPage === "tabs" ? "active" : ""}" data-page="tabs">
            <div class="link-icon">🗂️</div>
            <span class="link-text">Tabs</span>
          </a>
          <a href="/settings" class="sidebar-link ${this.currentPage === "settings" ? "active" : ""}" data-page="settings">
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

  renderUserSection() {
    const user = this.currentUser;
    const isPremium = user.isPremium || user.isActivePremium;
    const premiumBadge = isPremium ? '<span class="premium-badge">⭐ Premium</span>' : '';
    
    return `
      <div class="user-section">
        <div class="user-info" id="user-info">
          <div class="user-avatar">
            <span>${(user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}</span>
          </div>
          <div class="user-details">
            <div class="user-name">${user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username}</div>
            <div class="user-meta">
              <span class="user-role">${user.role || 'User'}</span>
              ${premiumBadge}
            </div>
          </div>
          <div class="user-dropdown-arrow">▼</div>
        </div>
        
        <div class="user-dropdown" id="user-dropdown" style="display: none;">
          <a href="/settings" class="dropdown-item">
            <span class="dropdown-icon">⚙️</span>
            <span>Account Settings</span>
          </a>
          <a href="/settings#premium" class="dropdown-item">
            <span class="dropdown-icon">⭐</span>
            <span>${isPremium ? 'Premium Status' : 'Upgrade to Premium'}</span>
          </a>
          <div class="dropdown-separator"></div>
          <button class="dropdown-item logout-btn" id="logout-btn">
            <span class="dropdown-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    `;
  }

  renderLoginSection() {
    return `
      <div class="login-section">
        <a href="/login" class="login-btn">
          <div class="login-icon">🔐</div>
          <div class="login-text">
            <div class="login-title">Sign In</div>
            <div class="login-subtitle">Access your account</div>
          </div>
        </a>
      </div>
    `;
  }

  attachEventListeners() {
    const sidebar = document.getElementById("sidebar-nav");
    const trigger = sidebar.querySelector(".sidebar-trigger");

    // Hover to show - expanded trigger area
    sidebar.addEventListener("mouseenter", () => {
      this.showSidebar();
    });

    // Also trigger on hover near left edge of screen - larger trigger area
    document.addEventListener("mousemove", (e) => {
      if (e.clientX <= 10 && !sidebar.classList.contains("expanded")) {
        this.showSidebar();
      }
    });

    // Touch support for mobile devices
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      
      // Show sidebar if touch starts within 20px of left edge
      if (touchStartX <= 20 && !sidebar.classList.contains("expanded")) {
        this.showSidebar();
      }
    }, { passive: true });
    
    document.addEventListener("touchmove", (e) => {
      if (!sidebar.classList.contains("expanded")) return;
      
      const touchX = e.touches[0].clientX;
      const deltaX = touchX - touchStartX;
      
      // Allow swipe right to keep sidebar open, swipe left to close
      if (deltaX < -50) {
        this.hideSidebar();
      }
    }, { passive: true });

    // Hide when leaving
    sidebar.addEventListener("mouseleave", () => {
      this.hideSidebar();
    });
    
    // Hide when touching outside on mobile
    document.addEventListener("touchstart", (e) => {
      if (sidebar.classList.contains("expanded") && 
          !sidebar.contains(e.target) && 
          e.touches[0].clientX > 240) {
        this.hideSidebar();
      }
    }, { passive: true });

    // Theme toggle
    const themeToggle = sidebar.querySelector("#theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        if (typeof window.changeTheme === "function") {
          // Use legacy theme system if available
          window.changeTheme();
        } else if (typeof window.theme !== "undefined" && window.theme.toggle) {
          // Use v9 theme system
          window.theme.toggle();
        } else {
          // Fallback - manual theme toggle
          this.toggleTheme();
        }
      });
    }

    // Fullscreen toggle
    const fullscreenToggle = sidebar.querySelector("#fullscreen-toggle");
    if (fullscreenToggle) {
      fullscreenToggle.addEventListener("click", () => {
        this.toggleFullscreen();
      });
    }

    // Premium upgrade button - removed as per user request

    // Navigation links
    sidebar.querySelectorAll(".sidebar-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        // Force full page reload for navigation
        window.location.href = link.getAttribute("href");
      });
    });

    // User dropdown functionality
    this.setupUserDropdown(sidebar);
  }

  setupUserDropdown(sidebar) {
    const userInfo = sidebar.querySelector("#user-info");
    const userDropdown = sidebar.querySelector("#user-dropdown");
    const logoutBtn = sidebar.querySelector("#logout-btn");

    if (userInfo && userDropdown) {
      // Toggle dropdown on click
      userInfo.addEventListener("click", (e) => {
        e.stopPropagation();
        const isVisible = userDropdown.style.display !== "none";
        userDropdown.style.display = isVisible ? "none" : "block";
        userInfo.classList.toggle("active", !isVisible);
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!userInfo.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.style.display = "none";
          userInfo.classList.remove("active");
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await this.handleLogout();
      });
    }
  }

  async handleLogout() {
    try {
      // Show loading state
      const logoutBtn = document.querySelector("#logout-btn");
      if (logoutBtn) {
        logoutBtn.innerHTML = '<span class="dropdown-icon">⏳</span><span>Signing out...</span>';
        logoutBtn.disabled = true;
      }

      // Handle KeyAuth logout
      if (window.keyAuthManager && window.keyAuthManager.isAuthenticated()) {
        window.keyAuthManager.clearSession();
      }

      // Call regular logout endpoint
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
          }
        });
      } catch (e) {
        // Ignore regular logout errors if KeyAuth is primary
      }

      // Clear all local storage/session storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('sg_auth_token');
      localStorage.removeItem('keyauth_session');
      sessionStorage.removeItem('sg_auth_token');
      sessionStorage.removeItem('sg-authenticated');

      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback - force reload to clear session
      window.location.reload();
    }
  }

  showSidebar() {
    const sidebar = document.getElementById("sidebar-nav");
    sidebar.classList.add("expanded");
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
        const sidebar = document.getElementById("sidebar-nav");
        sidebar.classList.remove("expanded");
      }
    }, 300);
  }

  toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);

    // Update theme toggle icon
    const themeIcon = document.querySelector("#theme-toggle .action-icon");
    if (themeIcon) {
      themeIcon.textContent = newTheme === "dark" ? "☀️" : "🌙";
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request failed:", err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  injectStyles() {
    const styleId = "sidebar-nav-styles";

    // Remove existing styles
    const existingStyles = document.getElementById(styleId);
    if (existingStyles) {
      existingStyles.remove();
    }

    const style = document.createElement("style");
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
        transform: translateX(-290px);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        display: flex;
        flex-direction: column;
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
        min-height: 0; /* Allow flex children to shrink */
      }

      .sidebar-trigger {
        position: absolute;
        top: 0;
        right: -40px;
        width: 40px;
        height: 100%;
        background: transparent;
        cursor: pointer;
        z-index: 10001;
      }

      /* Add hover indicator - completely hidden by default */
      .sidebar-nav::after {
        content: '▶';
        position: absolute;
        top: 50%;
        right: -25px;
        transform: translateY(-50%);
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        width: 20px;
        height: 40px;
        border-radius: 0 10px 10px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 10000;
        pointer-events: none;
      }

      .sidebar-nav:hover::after {
        opacity: 0;
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
        overflow-y: auto; /* Allow scrolling if content overflows */
        max-height: calc(100vh - 250px); /* Ensure content fits within viewport */
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

      /* Premium link with gradient animation */
      .premium-gradient-link {
        background: linear-gradient(-45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd);
        background-size: 400% 400%;
        animation: gradientShift 3s ease infinite;
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        position: relative;
        overflow: hidden;
      }

      .premium-gradient-link:hover {
        animation-duration: 1.5s;
        transform: translateX(4px) scale(1.02);
        box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
      }

      .premium-gradient-link::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
      }

      .premium-gradient-link:hover::before {
        left: 100%;
      }

      .premium-gradient-link .link-icon {
        animation: starPulse 2s ease-in-out infinite;
      }

      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      @keyframes starPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }

      /* Actions Section */
      .sidebar-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: auto; /* Push to bottom */
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0; /* Prevent shrinking */
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
          width: 240px;
          transform: translateX(-240px);
        }
        
        .sidebar-content {
          padding: 12px;
        }
        
        .sidebar-brand {
          margin-bottom: 20px;
          padding: 8px;
        }
        
        .brand-name {
          font-size: 16px;
        }
        
        .sidebar-link {
          padding: 12px 14px;
          gap: 10px;
        }
        
        .link-icon {
          font-size: 16px;
          width: 18px;
        }
        
        .link-text {
          font-size: 13px;
        }

        .sidebar-trigger {
          right: -30px;
          width: 30px;
        }

        .sidebar-nav::after {
          right: -18px;
          width: 16px;
          height: 30px;
          font-size: 8px;
        }
        
        .sidebar-action {
          padding: 10px 14px;
          gap: 10px;
        }
        
        .action-icon {
          font-size: 14px;
          width: 16px;
        }
        
        .action-text {
          font-size: 12px;
        }
      }
      
      @media (max-width: 480px) {
        .sidebar-nav {
          width: 220px;
          transform: translateX(-220px);
        }
        
        .sidebar-content {
          padding: 10px;
        }
        
        .sidebar-brand {
          flex-direction: column;
          text-align: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .brand-icon {
          font-size: 28px;
        }
        
        .brand-name {
          font-size: 14px;
        }
        
        .brand-version {
          font-size: 10px;
        }
        
        .sidebar-link {
          padding: 10px 12px;
          flex-direction: column;
          text-align: center;
          gap: 6px;
        }
        
        .link-icon {
          font-size: 18px;
          width: auto;
        }
        
        .link-text {
          font-size: 11px;
        }
        
        .sidebar-action {
          padding: 8px 12px;
          flex-direction: column;
          text-align: center;
          gap: 6px;
        }
        
        .action-icon {
          font-size: 16px;
          width: auto;
        }
        
        .action-text {
          font-size: 10px;
        }
      }
      
      /* Touch device improvements */
      @media (hover: none) and (pointer: coarse) {
        .sidebar-nav {
          /* Larger touch targets on touch devices */
        }
        
        .sidebar-link,
        .sidebar-action {
          min-height: 44px; /* Apple's recommended minimum touch target */
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }
        
        .sidebar-trigger {
          width: 44px; /* Larger touch area */
        }
        
        /* Show navigation hint on touch devices */
        .sidebar-nav::after {
          opacity: 0.3;
          content: '☰';
          font-size: 14px;
          background: rgba(99, 102, 241, 0.8);
        }
        
        /* Wider trigger area on very left edge for touch */
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 20px;
          height: 100vh;
          z-index: 9999;
          background: transparent;
          pointer-events: auto;
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

      /* User Section Styles */
      .user-section, .login-section {
        margin-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 20px;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      }

      .user-info:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .user-info.active {
        background: rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.3);
      }

      .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 14px;
        flex-shrink: 0;
      }

      .user-details {
        flex: 1;
        min-width: 0;
      }

      .user-name {
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
        line-height: 1.2;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .user-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
      }

      .user-role {
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .premium-badge {
        background: linear-gradient(135deg, #ffd700, #ffb347);
        color: #1a1a2e;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        animation: premiumGlow 2s ease-in-out infinite alternate;
      }

      @keyframes premiumGlow {
        0% { box-shadow: 0 0 4px rgba(255, 215, 0, 0.3); }
        100% { box-shadow: 0 0 8px rgba(255, 215, 0, 0.6); }
      }

      .user-dropdown-arrow {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.6);
        transition: transform 0.2s ease;
        flex-shrink: 0;
      }

      .user-info.active .user-dropdown-arrow {
        transform: rotate(180deg);
      }

      .user-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(30, 30, 60, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 8px 0;
        margin-top: 4px;
        z-index: 1000;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        max-height: 300px;
        overflow-y: auto;
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        transition: all 0.2s ease;
        border: none;
        background: none;
        font-size: 14px;
        width: 100%;
        cursor: pointer;
      }

      .dropdown-item:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
      }

      .dropdown-item.logout-btn:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }

      .dropdown-icon {
        font-size: 16px;
        width: 20px;
        text-align: center;
        flex-shrink: 0;
      }

      .dropdown-separator {
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
        margin: 4px 0;
      }

      /* Login Section Styles */
      .login-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #ffffff;
        text-decoration: none;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      }

      .login-btn:hover {
        background: linear-gradient(135deg, #5b5cf5, #9333ea);
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
      }

      .login-icon {
        font-size: 20px;
        flex-shrink: 0;
      }

      .login-text {
        flex: 1;
      }

      .login-title {
        font-size: 14px;
        font-weight: 600;
        line-height: 1.2;
        margin-bottom: 2px;
      }

      .login-subtitle {
        font-size: 12px;
        opacity: 0.8;
        line-height: 1;
      }

      /* Light theme adjustments for user section */
      [data-theme="light"] .user-section,
      [data-theme="light"] .login-section {
        border-bottom-color: rgba(0, 0, 0, 0.1);
      }

      [data-theme="light"] .user-info {
        background: rgba(0, 0, 0, 0.05);
        border-color: rgba(0, 0, 0, 0.1);
      }

      [data-theme="light"] .user-info:hover {
        background: rgba(0, 0, 0, 0.08);
        border-color: rgba(0, 0, 0, 0.2);
      }

      [data-theme="light"] .user-info.active {
        background: rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.3);
      }

      [data-theme="light"] .user-name {
        color: #1a1a2e;
      }

      [data-theme="light"] .user-meta {
        color: rgba(0, 0, 0, 0.7);
      }

      [data-theme="light"] .user-role {
        background: rgba(0, 0, 0, 0.1);
      }

      [data-theme="light"] .user-dropdown-arrow {
        color: rgba(0, 0, 0, 0.6);
      }

      [data-theme="light"] .user-dropdown {
        background: rgba(255, 255, 255, 0.95);
        border-color: rgba(0, 0, 0, 0.1);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }

      [data-theme="light"] .dropdown-item {
        color: rgba(0, 0, 0, 0.8);
      }

      [data-theme="light"] .dropdown-item:hover {
        background: rgba(0, 0, 0, 0.08);
        color: #000000;
      }

      [data-theme="light"] .dropdown-separator {
        background: rgba(0, 0, 0, 0.1);
      }
    `;

    document.head.appendChild(style);
  }

  // Public method to update active page
  setActivePage(page) {
    const sidebar = document.getElementById("sidebar-nav");
    if (sidebar) {
      sidebar.querySelectorAll(".sidebar-link").forEach((link) => {
        link.classList.remove("active");
        const tempAnchor = document.createElement("a");
        tempAnchor.href = link.getAttribute("href");
        if (
          page === tempAnchor.pathname ||
          link.getAttribute("data-page") === page
        ) {
          link.classList.add("active");
        }
      });
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", async () => {
    window.sidebarNav = new NavigationBar();
  });
} else {
  window.sidebarNav = new NavigationBar();
}

// Global function to update active page
window.updateNavbarActivePage = function (page) {
  if (window.sidebarNav) {
    window.sidebarNav.setActivePage(page);
  }
};

// Mark module as loaded for loading system
if (typeof window.markModuleLoaded === "function") {
  window.markModuleLoaded("navbar");
}
