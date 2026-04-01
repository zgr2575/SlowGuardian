/**
 * Admin Panel JavaScript - Developer Mode Features
 * Handles administrative controls, user management, and site monitoring
 */

class AdminPanel {
  constructor() {
    this.authToken = null;
    this.isLoggedIn = false;
    this.refreshInterval = null;

    this.initializeElements();
    this.attachEventListeners();
    this.checkAdminMode();
  }

  initializeElements() {
    // Admin panel elements
    this.adminPanel = document.getElementById("admin-panel");
    this.adminLogin = document.getElementById("admin-login");
    this.adminDashboard = document.getElementById("admin-dashboard");
    this.adminUsername = document.getElementById("admin-username");
    this.adminPassword = document.getElementById("admin-password");
    this.adminLoginBtn = document.getElementById("admin-login-btn");
    this.adminLogoutBtn = document.getElementById("admin-logout-btn");

    // Stats elements
    this.onlineUsersCount = document.getElementById("online-users-count");
    this.totalAdminsCount = document.getElementById("total-admins-count");
    this.siteStatus = document.getElementById("site-status");

    // Control buttons
    this.pauseSiteBtn = document.getElementById("pause-site-btn");
    this.unpauseSiteBtn = document.getElementById("unpause-site-btn");
    this.refreshStatsBtn = document.getElementById("refresh-stats-btn");
    this.viewUsersBtn = document.getElementById("view-users-btn");
    this.manageAccountsBtn = document.getElementById("manage-accounts-btn");

    // Modal elements
    this.userManagementModal = document.getElementById("user-management-modal");
    this.accountManagementModal = document.getElementById(
      "account-management-modal"
    );
    this.pauseModal = document.getElementById("pause-modal");
    this.userList = document.getElementById("user-list");
    this.adminList = document.getElementById("admin-list");
  }

  attachEventListeners() {
    // Admin authentication
    if (this.adminLoginBtn) {
      this.adminLoginBtn.addEventListener("click", () => this.handleLogin());
    }

    if (this.adminLogoutBtn) {
      this.adminLogoutBtn.addEventListener("click", () => this.handleLogout());
    }

    // Enter key for login
    if (this.adminPassword) {
      this.adminPassword.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.handleLogin();
        }
      });
    }

    // Control buttons
    if (this.pauseSiteBtn) {
      this.pauseSiteBtn.addEventListener("click", () => this.showPauseModal());
    }

    if (this.unpauseSiteBtn) {
      this.unpauseSiteBtn.addEventListener("click", () => this.unpauseSite());
    }

    if (this.refreshStatsBtn) {
      this.refreshStatsBtn.addEventListener("click", () => this.refreshStats());
    }

    if (this.viewUsersBtn) {
      this.viewUsersBtn.addEventListener("click", () =>
        this.showUserManagement()
      );
    }

    if (this.manageAccountsBtn) {
      this.manageAccountsBtn.addEventListener("click", () =>
        this.showAccountManagement()
      );
    }

    // Modal event listeners
    this.attachModalEventListeners();
  }

  attachModalEventListeners() {
    // User Management Modal
    const closeUserModal = document.getElementById("close-user-modal");
    const closeUserManagementBtn = document.getElementById(
      "close-user-management-btn"
    );
    const refreshUsersBtn = document.getElementById("refresh-users-btn");
    const blockSiteBtn = document.getElementById("block-site-btn");

    if (closeUserModal)
      closeUserModal.addEventListener("click", () =>
        this.hideModal(this.userManagementModal)
      );
    if (closeUserManagementBtn)
      closeUserManagementBtn.addEventListener("click", () =>
        this.hideModal(this.userManagementModal)
      );
    if (refreshUsersBtn)
      refreshUsersBtn.addEventListener("click", () => this.loadUsers());
    if (blockSiteBtn)
      blockSiteBtn.addEventListener("click", () => this.blockSiteForUser());

    // Account Management Modal
    const closeAccountModal = document.getElementById("close-account-modal");
    const closeAccountManagementBtn = document.getElementById(
      "close-account-management-btn"
    );
    const refreshAccountsBtn = document.getElementById("refresh-accounts-btn");
    const createAdminBtn = document.getElementById("create-admin-btn");

    if (closeAccountModal)
      closeAccountModal.addEventListener("click", () =>
        this.hideModal(this.accountManagementModal)
      );
    if (closeAccountManagementBtn)
      closeAccountManagementBtn.addEventListener("click", () =>
        this.hideModal(this.accountManagementModal)
      );
    if (refreshAccountsBtn)
      refreshAccountsBtn.addEventListener("click", () =>
        this.loadAdminAccounts()
      );
    if (createAdminBtn)
      createAdminBtn.addEventListener("click", () => this.createAdminAccount());

    // Pause Modal
    const closePauseModal = document.getElementById("close-pause-modal");
    const confirmPauseBtn = document.getElementById("confirm-pause-btn");
    const cancelPauseBtn = document.getElementById("cancel-pause-btn");

    if (closePauseModal)
      closePauseModal.addEventListener("click", () =>
        this.hideModal(this.pauseModal)
      );
    if (confirmPauseBtn)
      confirmPauseBtn.addEventListener("click", () => this.pauseSite());
    if (cancelPauseBtn)
      cancelPauseBtn.addEventListener("click", () =>
        this.hideModal(this.pauseModal)
      );
  }

  checkAdminMode() {
    // Check if developer mode is enabled by trying to access admin config
    fetch("/api/config")
      .then((response) => response.json())
      .then((config) => {
        if (config.developerMode && config.developerMode.enabled) {
          this.showAdminPanel();
        }
      })
      .catch((error) => {
        console.log("Developer mode not available:", error);
      });
  }

  showAdminPanel() {
    if (this.adminPanel) {
      this.adminPanel.style.display = "block";
    }
  }

  async handleLogin() {
    const username = this.adminUsername?.value.trim();
    const password = this.adminPassword?.value;

    if (!username || !password) {
      this.showNotification("Please enter both username and password", "error");
      return;
    }

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.authToken = data.token;
        this.isLoggedIn = true;

        // Store admin token for other components to check
        sessionStorage.setItem("admin-token", data.token);
        setCookie("developer-mode", "true", 1); // Set for 1 day

        this.showDashboard();
        this.startRefreshInterval();
        this.showNotification(
          "Successfully logged in to admin panel",
          "success"
        );

        // Clear password field
        if (this.adminPassword) this.adminPassword.value = "";
      } else {
        this.showNotification(data.error || "Login failed", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      this.showNotification("Login failed: Network error", "error");
    }
  }

  handleLogout() {
    this.authToken = null;
    this.isLoggedIn = false;

    // Clear admin tokens and developer mode
    sessionStorage.removeItem("admin-token");
    deleteCookie("developer-mode");

    this.stopRefreshInterval();
    this.showLogin();
    this.showNotification("Logged out of admin panel", "info");
  }

  showLogin() {
    if (this.adminLogin) this.adminLogin.style.display = "block";
    if (this.adminDashboard) this.adminDashboard.style.display = "none";
  }

  showDashboard() {
    if (this.adminLogin) this.adminLogin.style.display = "none";
    if (this.adminDashboard) this.adminDashboard.style.display = "block";
    this.refreshStats();
  }

  startRefreshInterval() {
    this.refreshInterval = setInterval(() => {
      this.refreshStats();
    }, 30000); // Refresh every 30 seconds
  }

  stopRefreshInterval() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  async refreshStats() {
    if (!this.isLoggedIn || !this.authToken) return;

    try {
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (this.onlineUsersCount)
          this.onlineUsersCount.textContent = data.stats.onlineUsers;
        if (this.totalAdminsCount)
          this.totalAdminsCount.textContent = data.stats.totalAdmins;
        if (this.siteStatus)
          this.siteStatus.textContent = data.stats.isPaused
            ? "Paused"
            : "Active";

        // Update pause/unpause buttons
        if (data.stats.isPaused) {
          if (this.pauseSiteBtn) this.pauseSiteBtn.style.display = "none";
          if (this.unpauseSiteBtn)
            this.unpauseSiteBtn.style.display = "inline-block";
        } else {
          if (this.pauseSiteBtn)
            this.pauseSiteBtn.style.display = "inline-block";
          if (this.unpauseSiteBtn) this.unpauseSiteBtn.style.display = "none";
        }
      }
    } catch (error) {
      console.error("Failed to refresh stats:", error);
    }
  }

  showPauseModal() {
    this.showModal(this.pauseModal);
  }

  async pauseSite() {
    const pausePassword = document.getElementById("pause-password")?.value;

    if (!pausePassword) {
      this.showNotification("Please enter a pause password", "error");
      return;
    }

    try {
      const response = await fetch("/api/admin/pause", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: pausePassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.showNotification("Site paused globally", "success");
        this.hideModal(this.pauseModal);
        this.refreshStats();

        // Clear password field
        const passwordField = document.getElementById("pause-password");
        if (passwordField) passwordField.value = "";
      } else {
        this.showNotification(data.error || "Failed to pause site", "error");
      }
    } catch (error) {
      console.error("Failed to pause site:", error);
      this.showNotification("Failed to pause site: Network error", "error");
    }
  }

  async unpauseSite() {
    const password = prompt("Enter the pause password to unpause the site:");

    if (!password) return;

    try {
      const response = await fetch("/api/admin/unpause", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        this.showNotification("Site unpaused successfully", "success");
        this.refreshStats();
      } else {
        const data = await response.json();
        this.showNotification(data.error || "Failed to unpause site", "error");
      }
    } catch (error) {
      console.error("Failed to unpause site:", error);
      this.showNotification("Failed to unpause site: Network error", "error");
    }
  }

  async showUserManagement() {
    this.showModal(this.userManagementModal);
    this.loadUsers();
  }

  async loadUsers() {
    if (!this.userList) return;

    this.userList.innerHTML =
      '<div class="loading-text">Loading users...</div>';

    try {
      const response = await fetch("/api/admin/sessions", {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.renderUsers(data.users);
        this.populateUserSelect(data.users);
      } else {
        this.userList.innerHTML =
          '<div class="error-text">Failed to load users</div>';
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      this.userList.innerHTML = '<div class="error-text">Network error</div>';
    }
  }

  renderUsers(users) {
    if (!this.userList) return;

    if (users.length === 0) {
      this.userList.innerHTML =
        '<div class="no-data">No users currently online</div>';
      return;
    }

    const userCards = users
      .map(
        (user) => `
      <div class="user-card">
        <div class="user-info">
          <strong>${user.username}</strong>
          <div class="user-details">
            <span>IP: ${user.ip}</span>
            <span>Last seen: ${new Date(user.lastSeen).toLocaleString()}</span>
          </div>
        </div>
        <div class="user-actions">
          <button class="btn btn-sm btn-warning" onclick="adminPanel.blockUser('${user.userId}')">Block</button>
          <button class="btn btn-sm btn-danger" onclick="adminPanel.viewBlockedSites('${user.userId}')">View Blocked</button>
        </div>
      </div>
    `
      )
      .join("");

    this.userList.innerHTML = userCards;
  }

  populateUserSelect(users) {
    const selectUser = document.getElementById("select-user");
    if (!selectUser) return;

    selectUser.innerHTML = '<option value="">Select a user...</option>';
    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.userId;
      option.textContent = `${user.username} (${user.ip})`;
      selectUser.appendChild(option);
    });
  }

  async blockUser(userId) {
    const reason =
      prompt("Enter reason for blocking (optional):") || "Blocked by admin";

    try {
      const response = await fetch(`/api/admin/users/${userId}/block`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.showNotification(`User blocked: ${userId}`, "success");
        this.loadUsers();
      } else {
        this.showNotification(data.error || "Failed to block user", "error");
      }
    } catch (error) {
      console.error("Failed to block user:", error);
      this.showNotification("Failed to block user: Network error", "error");
    }
  }

  async blockSiteForUser() {
    const selectUser = document.getElementById("select-user");
    const blockDomain = document.getElementById("block-domain");

    if (!selectUser || !blockDomain) return;

    const userId = selectUser.value;
    const domain = blockDomain.value.trim();

    if (!userId) {
      this.showNotification("Please select a user", "error");
      return;
    }

    if (!domain) {
      this.showNotification("Please enter a domain to block", "error");
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/block-site`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.showNotification(`Domain ${domain} blocked for user`, "success");
        blockDomain.value = "";
      } else {
        this.showNotification(data.error || "Failed to block site", "error");
      }
    } catch (error) {
      console.error("Failed to block site:", error);
      this.showNotification("Failed to block site: Network error", "error");
    }
  }

  async showAccountManagement() {
    this.showModal(this.accountManagementModal);
    this.loadAdminAccounts();
  }

  async loadAdminAccounts() {
    if (!this.adminList) return;

    this.adminList.innerHTML =
      '<div class="loading-text">Loading accounts...</div>';

    try {
      const response = await fetch("/api/admin/accounts", {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.renderAdminAccounts(data.admins);
      } else {
        this.adminList.innerHTML =
          '<div class="error-text">Failed to load accounts</div>';
      }
    } catch (error) {
      console.error("Failed to load admin accounts:", error);
      this.adminList.innerHTML = '<div class="error-text">Network error</div>';
    }
  }

  renderAdminAccounts(admins) {
    if (!this.adminList) return;

    const adminCards = admins
      .map(
        (admin) => `
      <div class="admin-card">
        <div class="admin-info">
          <strong>${admin.username}</strong>
          <span class="role-badge role-${admin.role}">${admin.role}</span>
        </div>
        <div class="admin-actions">
          <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteAdmin('${admin.adminId}')">Delete</button>
        </div>
      </div>
    `
      )
      .join("");

    this.adminList.innerHTML = adminCards;
  }

  async createAdminAccount() {
    const username = document
      .getElementById("new-admin-username")
      ?.value.trim();
    const password = document.getElementById("new-admin-password")?.value;
    const role = document.getElementById("new-admin-role")?.value;

    if (!username || !password) {
      this.showNotification("Please enter username and password", "error");
      return;
    }

    try {
      const response = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.showNotification("Admin account created successfully", "success");
        this.loadAdminAccounts();

        // Clear form
        document.getElementById("new-admin-username").value = "";
        document.getElementById("new-admin-password").value = "";
        document.getElementById("new-admin-role").value = "admin";
      } else {
        this.showNotification(
          data.error || "Failed to create account",
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to create admin account:", error);
      this.showNotification("Failed to create account: Network error", "error");
    }
  }

  async deleteAdmin(adminId) {
    if (!confirm("Are you sure you want to delete this admin account?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/accounts/${adminId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.showNotification("Admin account deleted", "success");
        this.loadAdminAccounts();
      } else {
        this.showNotification(
          data.error || "Failed to delete account",
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to delete admin account:", error);
      this.showNotification("Failed to delete account: Network error", "error");
    }
  }

  showModal(modal) {
    if (modal) {
      modal.style.display = "flex";
    }
  }

  hideModal(modal) {
    if (modal) {
      modal.style.display = "none";
    }
  }

  showNotification(message, type = "info") {
    // Use the existing notification system if available
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      alert(message);
    }
  }
}

// Initialize admin panel when DOM is loaded
let adminPanel;
document.addEventListener("DOMContentLoaded", () => {
  adminPanel = new AdminPanel();
});

// Make admin panel globally available
window.adminPanel = adminPanel;
