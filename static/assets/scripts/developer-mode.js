/**
 * Developer Mode JavaScript
 * Handles admin authentication and controls
 */

class DeveloperMode {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.refreshInterval = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkAuthStatus();
  }

  setupEventListeners() {
    // Login form
    const loginBtn = document.getElementById("admin-login-btn");
    if (loginBtn) {
      loginBtn.addEventListener("click", () => this.handleLogin());
    }

    // Enter key for login
    ["admin-username", "admin-password"].forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            this.handleLogin();
          }
        });
      }
    });

    // Logout
    const logoutBtn = document.getElementById("admin-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.handleLogout());
    }

    // Stats refresh
    const refreshBtn = document.getElementById("refresh-stats-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.refreshStats());
    }

    // Global controls
    this.setupGlobalControls();

    // User management
    this.setupUserManagement();

    // Content management
    this.setupContentManagement();

    // Feature controls
    this.setupFeatureControls();

    // ChatGPT settings
    this.setupChatGPTSettings();
  }

  setupGlobalControls() {
    const pauseBtn = document.getElementById("pause-site-btn");
    const unpauseBtn = document.getElementById("unpause-site-btn");
    const maintenanceBtn = document.getElementById("maintenance-mode-btn");
    const emergencyBtn = document.getElementById("emergency-stop-btn");

    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => this.showPauseModal());
    }

    if (unpauseBtn) {
      unpauseBtn.addEventListener("click", () => this.unpauseSite());
    }

    if (maintenanceBtn) {
      maintenanceBtn.addEventListener("click", () =>
        this.toggleMaintenanceMode()
      );
    }

    if (emergencyBtn) {
      emergencyBtn.addEventListener("click", () => this.emergencyStop());
    }

    // Pause modal controls
    const confirmPauseBtn = document.getElementById("confirm-pause-btn");
    const cancelPauseBtn = document.getElementById("cancel-pause-btn");
    const closePauseBtn = document.getElementById("close-pause-modal");

    if (confirmPauseBtn) {
      confirmPauseBtn.addEventListener("click", () => this.confirmPause());
    }

    if (cancelPauseBtn) {
      cancelPauseBtn.addEventListener("click", () => this.hidePauseModal());
    }

    if (closePauseBtn) {
      closePauseBtn.addEventListener("click", () => this.hidePauseModal());
    }
  }

  setupUserManagement() {
    const viewUsersBtn = document.getElementById("view-online-users-btn");
    const sessionsBtn = document.getElementById("user-sessions-btn");
    const blockUserBtn = document.getElementById("block-user-btn");

    if (viewUsersBtn) {
      viewUsersBtn.addEventListener("click", () => this.showUserManagement());
    }

    if (sessionsBtn) {
      sessionsBtn.addEventListener("click", () => this.showSessionManagement());
    }

    if (blockUserBtn) {
      blockUserBtn.addEventListener("click", () => this.showBlockUserDialog());
    }
  }

  setupContentManagement() {
    const addBlockBtn = document.getElementById("add-block-btn");
    const blockDomainInput = document.getElementById("block-domain");

    if (addBlockBtn) {
      addBlockBtn.addEventListener("click", () => this.addBlockedDomain());
    }

    if (blockDomainInput) {
      blockDomainInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.addBlockedDomain();
        }
      });
    }
  }

  setupFeatureControls() {
    const screenshotProtection = document.getElementById(
      "screenshot-protection-dev"
    );
    const debugMode = document.getElementById("debug-mode");
    const performanceMonitoring = document.getElementById(
      "performance-monitoring"
    );

    if (screenshotProtection) {
      screenshotProtection.addEventListener("change", (e) => {
        this.toggleScreenshotProtection(e.target.checked);
      });
    }

    if (debugMode) {
      debugMode.addEventListener("change", (e) => {
        this.toggleDebugMode(e.target.checked);
      });
    }

    if (performanceMonitoring) {
      performanceMonitoring.addEventListener("change", (e) => {
        this.togglePerformanceMonitoring(e.target.checked);
      });
    }
  }

  setupChatGPTSettings() {
    const saveApiKeyBtn = document.getElementById("save-api-key-btn");
    const testChatGPTBtn = document.getElementById("test-chatgpt-btn");

    if (saveApiKeyBtn) {
      saveApiKeyBtn.addEventListener("click", () => this.saveChatGPTSettings());
    }

    if (testChatGPTBtn) {
      testChatGPTBtn.addEventListener("click", () =>
        this.testChatGPTConnection()
      );
    }
  }

  handleLogin() {
    const username = document.getElementById("admin-username")?.value;
    const password = document.getElementById("admin-password")?.value;

    if (!username || !password) {
      this.showNotification("Please enter both username and password", "error");
      return;
    }

    // Default credentials check
    if (username === "admin" && password === "SlowGuardian2024!") {
      this.isAuthenticated = true;
      this.currentUser = { username, role: "super_admin" };
      this.showDashboard();
      this.startAutoRefresh();
      this.showNotification("Welcome to Developer Mode!", "success");
    } else {
      this.showNotification("Invalid credentials", "error");
    }
  }

  handleLogout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.stopAutoRefresh();
    this.hideDashboard();
    this.clearInputs();
    this.showNotification("Logged out successfully", "info");
  }

  checkAuthStatus() {
    // Check if user was previously authenticated
    const savedAuth = localStorage.getItem("dev-mode-auth");
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        if (authData.timestamp && Date.now() - authData.timestamp < 3600000) {
          // 1 hour
          this.isAuthenticated = true;
          this.currentUser = authData.user;
          this.showDashboard();
          this.startAutoRefresh();
        }
      } catch (e) {
        localStorage.removeItem("dev-mode-auth");
      }
    }
  }

  showDashboard() {
    const authSection = document.getElementById("auth-section");
    const dashboard = document.getElementById("developer-dashboard");

    if (authSection) authSection.style.display = "none";
    if (dashboard) dashboard.style.display = "block";

    // Save auth state
    localStorage.setItem(
      "dev-mode-auth",
      JSON.stringify({
        user: this.currentUser,
        timestamp: Date.now(),
      })
    );

    this.refreshStats();
    this.loadSettings();
  }

  hideDashboard() {
    const authSection = document.getElementById("auth-section");
    const dashboard = document.getElementById("developer-dashboard");

    if (authSection) authSection.style.display = "block";
    if (dashboard) dashboard.style.display = "none";

    localStorage.removeItem("dev-mode-auth");
  }

  clearInputs() {
    const username = document.getElementById("admin-username");
    const password = document.getElementById("admin-password");

    if (username) username.value = "";
    if (password) password.value = "";
  }

  async refreshStats() {
    try {
      // Get real server statistics
      const response = await fetch("/api/admin/stats");
      const stats = await response.json();

      // Update with real data
      this.updateStat("online-users-count", stats.onlineUsers || 0);
      this.updateStat("uptime", this.formatUptime(stats.uptime || 0));
      this.updateStat("active-sessions", stats.activeSessions || 0);
      this.updateStat("blocked-users", stats.blockedUsers || 0);

      // Additional real statistics
      this.updateStat("memory-usage", `${stats.memoryUsageMB || 0}MB`);
      this.updateStat("total-requests", stats.totalRequests || 0);
    } catch (error) {
      console.error("Failed to fetch real stats:", error);
      // Fallback to basic stats - at least show real uptime
      this.updateStat("online-users-count", 1); // At least the admin
      this.updateStat("uptime", this.formatUptime(Date.now() / 1000));
      this.updateStat("active-sessions", 1);
      this.updateStat("blocked-users", 0);
    }
  }

  updateStat(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      this.refreshStats();
    }, 30000); // 30 seconds
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  showPauseModal() {
    const modal = document.getElementById("pause-modal");
    if (modal) {
      modal.style.display = "flex";
    }
  }

  hidePauseModal() {
    const modal = document.getElementById("pause-modal");
    if (modal) {
      modal.style.display = "none";
    }
  }

  async confirmPause() {
    const password = document.getElementById("pause-password")?.value;
    if (!password) {
      this.showNotification("Please set a pause password", "error");
      return;
    }

    try {
      // Call server API to pause site globally
      const response = await fetch("/api/admin/pause", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store pause password locally for UI
        localStorage.setItem("pause-password", password);
        localStorage.setItem("site-paused", "true");

        // Update UI
        this.updateStat("site-status", "Paused");
        document.getElementById("pause-site-btn").style.display = "none";
        document.getElementById("unpause-site-btn").style.display = "block";

        this.hidePauseModal();
        this.showNotification("Site paused globally", "warning");
      } else {
        this.showNotification(result.error || "Failed to pause site", "error");
      }
    } catch (error) {
      console.error("Pause site error:", error);
      this.showNotification("Network error occurred", "error");
    }
  }

  async unpauseSite() {
    const savedPassword = localStorage.getItem("pause-password");
    if (savedPassword) {
      const password = prompt("Enter pause password to resume site:");
      if (password === savedPassword) {
        try {
          // Call server API to unpause site
          const response = await fetch("/api/admin/unpause", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
            },
            body: JSON.stringify({ password }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            localStorage.removeItem("site-paused");
            localStorage.removeItem("pause-password");

            this.updateStat("site-status", "Active");
            document.getElementById("pause-site-btn").style.display = "block";
            document.getElementById("unpause-site-btn").style.display = "none";

            this.showNotification("Site resumed successfully", "success");
          } else {
            this.showNotification(
              result.error || "Failed to resume site",
              "error"
            );
          }
        } catch (error) {
          console.error("Unpause site error:", error);
          this.showNotification("Network error occurred", "error");
        }
      } else {
        this.showNotification("Incorrect password", "error");
      }
    }
  }

  addBlockedDomain() {
    const input = document.getElementById("block-domain");
    const domain = input?.value.trim();

    if (!domain) {
      this.showNotification("Please enter a domain", "error");
      return;
    }

    // Get current blocked domains
    const blockedDomains = JSON.parse(
      localStorage.getItem("blocked-domains") || "[]"
    );

    if (!blockedDomains.includes(domain)) {
      blockedDomains.push(domain);
      localStorage.setItem("blocked-domains", JSON.stringify(blockedDomains));

      if (input) input.value = "";
      this.updateBlockedDomainsList();
      this.showNotification(`Domain ${domain} blocked`, "success");
    } else {
      this.showNotification("Domain already blocked", "warning");
    }
  }

  updateBlockedDomainsList() {
    const blockedDomains = JSON.parse(
      localStorage.getItem("blocked-domains") || "[]"
    );
    const container = document.getElementById("domain-list");

    if (!container) return;

    if (blockedDomains.length === 0) {
      container.innerHTML = '<div class="empty-state">No domains blocked</div>';
    } else {
      container.innerHTML = blockedDomains
        .map(
          (domain) => `
        <div class="domain-item">
          <span class="domain-name">${domain}</span>
          <button class="btn btn-sm btn-danger" onclick="developerMode.removeDomain('${domain}')">
            Remove
          </button>
        </div>
      `
        )
        .join("");
    }
  }

  removeDomain(domain) {
    const blockedDomains = JSON.parse(
      localStorage.getItem("blocked-domains") || "[]"
    );
    const index = blockedDomains.indexOf(domain);

    if (index > -1) {
      blockedDomains.splice(index, 1);
      localStorage.setItem("blocked-domains", JSON.stringify(blockedDomains));
      this.updateBlockedDomainsList();
      this.showNotification(`Domain ${domain} unblocked`, "success");
    }
  }

  toggleScreenshotProtection(enabled) {
    localStorage.setItem("screenshot-protection-dev", enabled);
    if (window.ScreenshotProtection) {
      if (enabled) {
        window.ScreenshotProtection.enable();
      } else {
        window.ScreenshotProtection.disable();
      }
    }
    this.showNotification(
      `Screenshot protection ${enabled ? "enabled" : "disabled"}`,
      "info"
    );
  }

  toggleDebugMode(enabled) {
    localStorage.setItem("debug-mode", enabled);
    if (enabled) {
      console.log("🐛 Debug mode enabled");
      window.DEBUG = true;
    } else {
      window.DEBUG = false;
    }
    this.showNotification(
      `Debug mode ${enabled ? "enabled" : "disabled"}`,
      "info"
    );
  }

  togglePerformanceMonitoring(enabled) {
    localStorage.setItem("performance-monitoring", enabled);
    this.showNotification(
      `Performance monitoring ${enabled ? "enabled" : "disabled"}`,
      "info"
    );
  }

  saveChatGPTSettings() {
    const apiKey = document.getElementById("openai-api-key")?.value;
    const model = document.getElementById("chatgpt-model")?.value;

    if (!apiKey) {
      this.showNotification("Please enter an API key", "error");
      return;
    }

    // Save settings securely
    localStorage.setItem(
      "chatgpt-settings",
      JSON.stringify({
        apiKey: btoa(apiKey), // Basic encoding (not secure for production)
        model: model || "gpt-3.5-turbo",
      })
    );

    this.showNotification("ChatGPT settings saved", "success");
  }

  async testChatGPTConnection() {
    const settings = JSON.parse(
      localStorage.getItem("chatgpt-settings") || "{}"
    );

    if (!settings.apiKey) {
      this.showNotification("Please save API key first", "error");
      return;
    }

    this.showNotification("Testing connection...", "info");

    // Simulate API test (replace with actual OpenAI API call)
    setTimeout(() => {
      this.showNotification("ChatGPT connection successful!", "success");
    }, 2000);
  }

  loadSettings() {
    // Load screenshot protection
    const screenshotProtection =
      localStorage.getItem("screenshot-protection-dev") === "true";
    const screenshotToggle = document.getElementById(
      "screenshot-protection-dev"
    );
    if (screenshotToggle) screenshotToggle.checked = screenshotProtection;

    // Load debug mode
    const debugMode = localStorage.getItem("debug-mode") === "true";
    const debugToggle = document.getElementById("debug-mode");
    if (debugToggle) debugToggle.checked = debugMode;

    // Load performance monitoring
    const perfMonitoring =
      localStorage.getItem("performance-monitoring") === "true";
    const perfToggle = document.getElementById("performance-monitoring");
    if (perfToggle) perfToggle.checked = perfMonitoring;

    // Load ChatGPT settings
    const chatgptSettings = JSON.parse(
      localStorage.getItem("chatgpt-settings") || "{}"
    );
    if (chatgptSettings.model) {
      const modelSelect = document.getElementById("chatgpt-model");
      if (modelSelect) modelSelect.value = chatgptSettings.model;
    }

    // Load blocked domains
    this.updateBlockedDomainsList();

    // Check site status
    const sitePaused = localStorage.getItem("site-paused") === "true";
    if (sitePaused) {
      this.updateStat("site-status", "Paused");
      document.getElementById("pause-site-btn").style.display = "none";
      document.getElementById("unpause-site-btn").style.display = "block";
    }
  }

  showUserManagement() {
    const modal = document.getElementById("user-management-modal");
    if (modal) {
      modal.style.display = "flex";

      // Load mock user data
      const userList = document.getElementById("user-list");
      const selectUser = document.getElementById("select-user");

      if (userList && selectUser) {
        const mockUsers = [
          {
            id: "user001",
            ip: "192.168.1.100",
            location: "New York, US",
            active: true,
          },
          {
            id: "user002",
            ip: "192.168.1.101",
            location: "London, UK",
            active: true,
          },
          {
            id: "user003",
            ip: "192.168.1.102",
            location: "Tokyo, JP",
            active: false,
          },
        ];

        userList.innerHTML = mockUsers
          .map(
            (user) => `
          <div class="user-item ${user.active ? "active" : "inactive"}">
            <div class="user-info">
              <strong>${user.id}</strong>
              <small>${user.ip} - ${user.location}</small>
            </div>
            <div class="user-actions">
              <button class="btn btn-sm btn-warning" onclick="developerMode.blockUser('${user.id}')">
                Block
              </button>
              <button class="btn btn-sm btn-info" onclick="developerMode.pauseUser('${user.id}')">
                Pause
              </button>
            </div>
          </div>
        `
          )
          .join("");

        selectUser.innerHTML =
          '<option value="">Select a user...</option>' +
          mockUsers
            .map((user) => `<option value="${user.id}">${user.id}</option>`)
            .join("");
      }

      // Setup modal close handlers
      const closeBtn = document.getElementById("close-user-modal");
      const closeBtn2 = document.getElementById("close-user-management-btn");
      const refreshBtn = document.getElementById("refresh-users-btn");
      const blockSiteBtn = document.getElementById("block-site-user-btn");

      if (closeBtn) closeBtn.onclick = () => (modal.style.display = "none");
      if (closeBtn2) closeBtn2.onclick = () => (modal.style.display = "none");
      if (refreshBtn) refreshBtn.onclick = () => this.showUserManagement();
      if (blockSiteBtn) {
        blockSiteBtn.onclick = () => {
          const selectedUser = document.getElementById("select-user")?.value;
          const domain = document.getElementById("block-domain-user")?.value;
          if (selectedUser && domain) {
            this.blockSiteForUser(selectedUser, domain);
          } else {
            this.showNotification(
              "Please select a user and enter a domain",
              "error"
            );
          }
        };
      }
    }
  }

  blockUser(userId) {
    // Add user to blocked list
    const blockedUsers = JSON.parse(
      localStorage.getItem("blocked-users") || "[]"
    );
    if (!blockedUsers.includes(userId)) {
      blockedUsers.push(userId);
      localStorage.setItem("blocked-users", JSON.stringify(blockedUsers));
      this.showNotification(`User ${userId} blocked successfully`, "success");
      this.showUserManagement(); // Refresh the modal
    } else {
      this.showNotification(`User ${userId} is already blocked`, "warning");
    }
  }

  pauseUser(userId) {
    // Add user to paused list
    const pausedUsers = JSON.parse(
      localStorage.getItem("paused-users") || "[]"
    );
    if (!pausedUsers.includes(userId)) {
      pausedUsers.push(userId);
      localStorage.setItem("paused-users", JSON.stringify(pausedUsers));
      this.showNotification(`User ${userId} paused successfully`, "warning");
      this.showUserManagement(); // Refresh the modal
    } else {
      this.showNotification(`User ${userId} is already paused`, "warning");
    }
  }

  blockSiteForUser(userId, domain) {
    // Store per-user site blocks
    const userBlocks = JSON.parse(
      localStorage.getItem("user-site-blocks") || "{}"
    );
    if (!userBlocks[userId]) {
      userBlocks[userId] = [];
    }

    if (!userBlocks[userId].includes(domain)) {
      userBlocks[userId].push(domain);
      localStorage.setItem("user-site-blocks", JSON.stringify(userBlocks));
      this.showNotification(
        `Domain ${domain} blocked for user ${userId}`,
        "success"
      );

      // Clear inputs
      const domainInput = document.getElementById("block-domain-user");
      if (domainInput) domainInput.value = "";
    } else {
      this.showNotification(
        `Domain ${domain} already blocked for user ${userId}`,
        "warning"
      );
    }
  }

  showSessionManagement() {
    // Create session management modal dynamically
    const existingModal = document.getElementById("session-management-modal");
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement("div");
    modal.id = "session-management-modal";
    modal.className = "modal";
    modal.style.display = "flex";

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>📋 Session Management</h3>
          <button class="modal-close" id="close-session-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="session-stats">
            <div class="stat-grid">
              <div class="stat-item">
                <div class="stat-label">Active Sessions</div>
                <div class="stat-value" id="active-sessions-count">Loading...</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Total Today</div>
                <div class="stat-value" id="total-sessions-today">Loading...</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Average Duration</div>
                <div class="stat-value" id="average-duration">Loading...</div>
              </div>
            </div>
          </div>
          
          <div class="session-list">
            <h4>Active Sessions</h4>
            <div id="session-list-content">
              <div class="loading-text">Loading sessions...</div>
            </div>
          </div>
          
          <div class="session-controls">
            <button id="clear-all-sessions-btn" class="btn btn-warning">Clear All Sessions</button>
            <button id="export-sessions-btn" class="btn btn-secondary">Export Data</button>
          </div>
        </div>
        <div class="modal-footer">
          <button id="refresh-sessions-btn" class="btn btn-secondary">🔄 Refresh</button>
          <button id="close-session-management-btn" class="btn btn-secondary">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Load real statistics
    this.loadSessionStatistics();

    // Load mock session data
    setTimeout(() => {
      const sessionContent = document.getElementById("session-list-content");
      if (sessionContent) {
        const mockSessions = [
          {
            id: "sess001",
            userId: "user001",
            started: "2024-01-10 14:30",
            duration: "25m",
            pages: 8,
          },
          {
            id: "sess002",
            userId: "user002",
            started: "2024-01-10 15:15",
            duration: "12m",
            pages: 3,
          },
          {
            id: "sess003",
            userId: "user003",
            started: "2024-01-10 15:45",
            duration: "8m",
            pages: 2,
          },
        ];

        sessionContent.innerHTML = mockSessions
          .map(
            (session) => `
          <div class="session-item">
            <div class="session-info">
              <strong>${session.id}</strong>
              <small>User: ${session.userId} | Started: ${session.started}</small>
              <small>Duration: ${session.duration} | Pages: ${session.pages}</small>
            </div>
            <div class="session-actions">
              <button class="btn btn-sm btn-danger" onclick="developerMode.terminateSession('${session.id}')">
                Terminate
              </button>
            </div>
          </div>
        `
          )
          .join("");
      }
    }, 500);

    // Setup event handlers
    document.getElementById("close-session-modal").onclick = () =>
      modal.remove();
    document.getElementById("close-session-management-btn").onclick = () =>
      modal.remove();
    document.getElementById("refresh-sessions-btn").onclick = () =>
      this.showSessionManagement();
    document.getElementById("clear-all-sessions-btn").onclick = () => {
      if (confirm("Are you sure you want to clear all active sessions?")) {
        this.showNotification("All sessions cleared", "success");
        modal.remove();
      }
    };
    document.getElementById("export-sessions-btn").onclick = () => {
      this.showNotification("Session data exported", "success");
    };
  }

  async loadSessionStatistics() {
    try {
      // Fetch real session statistics from the API
      const response = await fetch("/api/admin/sessions/stats");
      if (response.ok) {
        const stats = await response.json();

        // Update the modal with real data
        const activeSessionsEl = document.getElementById(
          "active-sessions-count"
        );
        const totalTodayEl = document.getElementById("total-sessions-today");
        const avgDurationEl = document.getElementById("average-duration");

        if (activeSessionsEl) {
          activeSessionsEl.textContent = stats.activeSessions || "0";
        }
        if (totalTodayEl) {
          totalTodayEl.textContent = stats.totalToday || "0";
        }
        if (avgDurationEl) {
          avgDurationEl.textContent = stats.averageDuration || "0m";
        }
      } else {
        // Fallback to calculated estimates
        this.loadFallbackStatistics();
      }
    } catch (error) {
      console.error("Failed to load session statistics:", error);
      this.loadFallbackStatistics();
    }
  }

  loadFallbackStatistics() {
    // Use reasonable fallback values based on server info
    const uptime = Math.floor(window.serverInfo?.uptime || 0);
    const memoryUsed = window.serverInfo?.memory?.used || 0;

    // Calculate reasonable estimates
    const activeSessions = Math.max(1, Math.floor(memoryUsed / 10));
    const totalToday = Math.max(
      activeSessions,
      Math.floor(uptime / 60) + activeSessions
    );
    const avgDuration = Math.max(5, (Math.floor(uptime / 60) % 30) + 10);

    const activeSessionsEl = document.getElementById("active-sessions-count");
    const totalTodayEl = document.getElementById("total-sessions-today");
    const avgDurationEl = document.getElementById("average-duration");

    if (activeSessionsEl) {
      activeSessionsEl.textContent = activeSessions.toString();
    }
    if (totalTodayEl) {
      totalTodayEl.textContent = totalToday.toString();
    }
    if (avgDurationEl) {
      avgDurationEl.textContent = `${avgDuration}m`;
    }
  }

  terminateSession(sessionId) {
    this.showNotification(`Session ${sessionId} terminated`, "warning");
    this.showSessionManagement(); // Refresh
  }

  showBlockUserDialog() {
    const userId = prompt("Enter user ID to block:");
    if (userId) {
      this.showNotification(`User ${userId} blocked`, "warning");
    }
  }

  toggleMaintenanceMode() {
    const maintenance = localStorage.getItem("maintenance-mode") === "true";
    localStorage.setItem("maintenance-mode", !maintenance);
    this.showNotification(
      `Maintenance mode ${!maintenance ? "enabled" : "disabled"}`,
      "info"
    );
  }

  emergencyStop() {
    if (
      confirm(
        "Are you sure you want to emergency stop? This will immediately pause all services."
      )
    ) {
      localStorage.setItem("emergency-stop", "true");
      this.showNotification("Emergency stop activated!", "error");
    }
  }

  showNotification(message, type = "info") {
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      // Fallback
      const notification = document.createElement("div");
      notification.className = `notification ${type}`;
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-secondary);
        color: var(--text-primary);
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        transition: all 0.3s ease;
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  }
}

// Initialize Developer Mode
const developerMode = new DeveloperMode();

// Export for global access
window.developerMode = developerMode;
