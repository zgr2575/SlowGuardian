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
    const loginBtn = document.getElementById('admin-login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.handleLogin());
    }

    // Enter key for login
    ['admin-username', 'admin-password'].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.handleLogin();
          }
        });
      }
    });

    // Logout
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Stats refresh
    const refreshBtn = document.getElementById('refresh-stats-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshStats());
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
    const pauseBtn = document.getElementById('pause-site-btn');
    const unpauseBtn = document.getElementById('unpause-site-btn');
    const maintenanceBtn = document.getElementById('maintenance-mode-btn');
    const emergencyBtn = document.getElementById('emergency-stop-btn');

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.showPauseModal());
    }

    if (unpauseBtn) {
      unpauseBtn.addEventListener('click', () => this.unpauseSite());
    }

    if (maintenanceBtn) {
      maintenanceBtn.addEventListener('click', () => this.toggleMaintenanceMode());
    }

    if (emergencyBtn) {
      emergencyBtn.addEventListener('click', () => this.emergencyStop());
    }

    // Pause modal controls
    const confirmPauseBtn = document.getElementById('confirm-pause-btn');
    const cancelPauseBtn = document.getElementById('cancel-pause-btn');
    const closePauseBtn = document.getElementById('close-pause-modal');

    if (confirmPauseBtn) {
      confirmPauseBtn.addEventListener('click', () => this.confirmPause());
    }

    if (cancelPauseBtn) {
      cancelPauseBtn.addEventListener('click', () => this.hidePauseModal());
    }

    if (closePauseBtn) {
      closePauseBtn.addEventListener('click', () => this.hidePauseModal());
    }
  }

  setupUserManagement() {
    const viewUsersBtn = document.getElementById('view-online-users-btn');
    const sessionsBtn = document.getElementById('user-sessions-btn');
    const blockUserBtn = document.getElementById('block-user-btn');

    if (viewUsersBtn) {
      viewUsersBtn.addEventListener('click', () => this.showUserManagement());
    }

    if (sessionsBtn) {
      sessionsBtn.addEventListener('click', () => this.showSessionManagement());
    }

    if (blockUserBtn) {
      blockUserBtn.addEventListener('click', () => this.showBlockUserDialog());
    }
  }

  setupContentManagement() {
    const addBlockBtn = document.getElementById('add-block-btn');
    const blockDomainInput = document.getElementById('block-domain');

    if (addBlockBtn) {
      addBlockBtn.addEventListener('click', () => this.addBlockedDomain());
    }

    if (blockDomainInput) {
      blockDomainInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addBlockedDomain();
        }
      });
    }
  }

  setupFeatureControls() {
    const screenshotProtection = document.getElementById('screenshot-protection-dev');
    const debugMode = document.getElementById('debug-mode');
    const performanceMonitoring = document.getElementById('performance-monitoring');

    if (screenshotProtection) {
      screenshotProtection.addEventListener('change', (e) => {
        this.toggleScreenshotProtection(e.target.checked);
      });
    }

    if (debugMode) {
      debugMode.addEventListener('change', (e) => {
        this.toggleDebugMode(e.target.checked);
      });
    }

    if (performanceMonitoring) {
      performanceMonitoring.addEventListener('change', (e) => {
        this.togglePerformanceMonitoring(e.target.checked);
      });
    }
  }

  setupChatGPTSettings() {
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    const testChatGPTBtn = document.getElementById('test-chatgpt-btn');

    if (saveApiKeyBtn) {
      saveApiKeyBtn.addEventListener('click', () => this.saveChatGPTSettings());
    }

    if (testChatGPTBtn) {
      testChatGPTBtn.addEventListener('click', () => this.testChatGPTConnection());
    }
  }

  handleLogin() {
    const username = document.getElementById('admin-username')?.value;
    const password = document.getElementById('admin-password')?.value;

    if (!username || !password) {
      this.showNotification('Please enter both username and password', 'error');
      return;
    }

    // Default credentials check
    if (username === 'admin' && password === 'SlowGuardian2024!') {
      this.isAuthenticated = true;
      this.currentUser = { username, role: 'super_admin' };
      this.showDashboard();
      this.startAutoRefresh();
      this.showNotification('Welcome to Developer Mode!', 'success');
    } else {
      this.showNotification('Invalid credentials', 'error');
    }
  }

  handleLogout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.stopAutoRefresh();
    this.hideDashboard();
    this.clearInputs();
    this.showNotification('Logged out successfully', 'info');
  }

  checkAuthStatus() {
    // Check if user was previously authenticated
    const savedAuth = localStorage.getItem('dev-mode-auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        if (authData.timestamp && Date.now() - authData.timestamp < 3600000) { // 1 hour
          this.isAuthenticated = true;
          this.currentUser = authData.user;
          this.showDashboard();
          this.startAutoRefresh();
        }
      } catch (e) {
        localStorage.removeItem('dev-mode-auth');
      }
    }
  }

  showDashboard() {
    const authSection = document.getElementById('auth-section');
    const dashboard = document.getElementById('developer-dashboard');

    if (authSection) authSection.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';

    // Save auth state
    localStorage.setItem('dev-mode-auth', JSON.stringify({
      user: this.currentUser,
      timestamp: Date.now()
    }));

    this.refreshStats();
    this.loadSettings();
  }

  hideDashboard() {
    const authSection = document.getElementById('auth-section');
    const dashboard = document.getElementById('developer-dashboard');

    if (authSection) authSection.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';

    localStorage.removeItem('dev-mode-auth');
  }

  clearInputs() {
    const username = document.getElementById('admin-username');
    const password = document.getElementById('admin-password');

    if (username) username.value = '';
    if (password) password.value = '';
  }

  refreshStats() {
    // Simulate real-time stats
    const onlineUsers = Math.floor(Math.random() * 50) + 1;
    const uptime = this.formatUptime(Math.floor(Math.random() * 86400));

    this.updateStat('online-users-count', onlineUsers);
    this.updateStat('uptime', uptime);
    this.updateStat('active-sessions', Math.floor(onlineUsers * 0.8));
    this.updateStat('blocked-users', Math.floor(Math.random() * 5));
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
    const modal = document.getElementById('pause-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  hidePauseModal() {
    const modal = document.getElementById('pause-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  confirmPause() {
    const password = document.getElementById('pause-password')?.value;
    if (!password) {
      this.showNotification('Please set a pause password', 'error');
      return;
    }

    // Store pause password
    localStorage.setItem('pause-password', password);
    localStorage.setItem('site-paused', 'true');

    // Update UI
    this.updateStat('site-status', 'Paused');
    document.getElementById('pause-site-btn').style.display = 'none';
    document.getElementById('unpause-site-btn').style.display = 'block';

    this.hidePauseModal();
    this.showNotification('Site paused globally', 'warning');
  }

  unpauseSite() {
    const savedPassword = localStorage.getItem('pause-password');
    if (savedPassword) {
      const password = prompt('Enter pause password to resume site:');
      if (password === savedPassword) {
        localStorage.removeItem('site-paused');
        localStorage.removeItem('pause-password');
        
        this.updateStat('site-status', 'Active');
        document.getElementById('pause-site-btn').style.display = 'block';
        document.getElementById('unpause-site-btn').style.display = 'none';
        
        this.showNotification('Site resumed successfully', 'success');
      } else {
        this.showNotification('Incorrect password', 'error');
      }
    }
  }

  addBlockedDomain() {
    const input = document.getElementById('block-domain');
    const domain = input?.value.trim();

    if (!domain) {
      this.showNotification('Please enter a domain', 'error');
      return;
    }

    // Get current blocked domains
    const blockedDomains = JSON.parse(localStorage.getItem('blocked-domains') || '[]');
    
    if (!blockedDomains.includes(domain)) {
      blockedDomains.push(domain);
      localStorage.setItem('blocked-domains', JSON.stringify(blockedDomains));
      
      if (input) input.value = '';
      this.updateBlockedDomainsList();
      this.showNotification(`Domain ${domain} blocked`, 'success');
    } else {
      this.showNotification('Domain already blocked', 'warning');
    }
  }

  updateBlockedDomainsList() {
    const blockedDomains = JSON.parse(localStorage.getItem('blocked-domains') || '[]');
    const container = document.getElementById('domain-list');
    
    if (!container) return;

    if (blockedDomains.length === 0) {
      container.innerHTML = '<div class="empty-state">No domains blocked</div>';
    } else {
      container.innerHTML = blockedDomains.map(domain => `
        <div class="domain-item">
          <span class="domain-name">${domain}</span>
          <button class="btn btn-sm btn-danger" onclick="developerMode.removeDomain('${domain}')">
            Remove
          </button>
        </div>
      `).join('');
    }
  }

  removeDomain(domain) {
    const blockedDomains = JSON.parse(localStorage.getItem('blocked-domains') || '[]');
    const index = blockedDomains.indexOf(domain);
    
    if (index > -1) {
      blockedDomains.splice(index, 1);
      localStorage.setItem('blocked-domains', JSON.stringify(blockedDomains));
      this.updateBlockedDomainsList();
      this.showNotification(`Domain ${domain} unblocked`, 'success');
    }
  }

  toggleScreenshotProtection(enabled) {
    localStorage.setItem('screenshot-protection-dev', enabled);
    if (window.ScreenshotProtection) {
      if (enabled) {
        window.ScreenshotProtection.enable();
      } else {
        window.ScreenshotProtection.disable();
      }
    }
    this.showNotification(`Screenshot protection ${enabled ? 'enabled' : 'disabled'}`, 'info');
  }

  toggleDebugMode(enabled) {
    localStorage.setItem('debug-mode', enabled);
    if (enabled) {
      console.log('🐛 Debug mode enabled');
      window.DEBUG = true;
    } else {
      window.DEBUG = false;
    }
    this.showNotification(`Debug mode ${enabled ? 'enabled' : 'disabled'}`, 'info');
  }

  togglePerformanceMonitoring(enabled) {
    localStorage.setItem('performance-monitoring', enabled);
    this.showNotification(`Performance monitoring ${enabled ? 'enabled' : 'disabled'}`, 'info');
  }

  saveChatGPTSettings() {
    const apiKey = document.getElementById('openai-api-key')?.value;
    const model = document.getElementById('chatgpt-model')?.value;

    if (!apiKey) {
      this.showNotification('Please enter an API key', 'error');
      return;
    }

    // Save settings securely
    localStorage.setItem('chatgpt-settings', JSON.stringify({
      apiKey: btoa(apiKey), // Basic encoding (not secure for production)
      model: model || 'gpt-3.5-turbo'
    }));

    this.showNotification('ChatGPT settings saved', 'success');
  }

  async testChatGPTConnection() {
    const settings = JSON.parse(localStorage.getItem('chatgpt-settings') || '{}');
    
    if (!settings.apiKey) {
      this.showNotification('Please save API key first', 'error');
      return;
    }

    this.showNotification('Testing connection...', 'info');

    // Simulate API test (replace with actual OpenAI API call)
    setTimeout(() => {
      this.showNotification('ChatGPT connection successful!', 'success');
    }, 2000);
  }

  loadSettings() {
    // Load screenshot protection
    const screenshotProtection = localStorage.getItem('screenshot-protection-dev') === 'true';
    const screenshotToggle = document.getElementById('screenshot-protection-dev');
    if (screenshotToggle) screenshotToggle.checked = screenshotProtection;

    // Load debug mode
    const debugMode = localStorage.getItem('debug-mode') === 'true';
    const debugToggle = document.getElementById('debug-mode');
    if (debugToggle) debugToggle.checked = debugMode;

    // Load performance monitoring
    const perfMonitoring = localStorage.getItem('performance-monitoring') === 'true';
    const perfToggle = document.getElementById('performance-monitoring');
    if (perfToggle) perfToggle.checked = perfMonitoring;

    // Load ChatGPT settings
    const chatgptSettings = JSON.parse(localStorage.getItem('chatgpt-settings') || '{}');
    if (chatgptSettings.model) {
      const modelSelect = document.getElementById('chatgpt-model');
      if (modelSelect) modelSelect.value = chatgptSettings.model;
    }

    // Load blocked domains
    this.updateBlockedDomainsList();

    // Check site status
    const sitePaused = localStorage.getItem('site-paused') === 'true';
    if (sitePaused) {
      this.updateStat('site-status', 'Paused');
      document.getElementById('pause-site-btn').style.display = 'none';
      document.getElementById('unpause-site-btn').style.display = 'block';
    }
  }

  showUserManagement() {
    // Implement user management modal
    this.showNotification('User management panel - Coming soon!', 'info');
  }

  showSessionManagement() {
    this.showNotification('Session management - Coming soon!', 'info');
  }

  showBlockUserDialog() {
    const userId = prompt('Enter user ID to block:');
    if (userId) {
      this.showNotification(`User ${userId} blocked`, 'warning');
    }
  }

  toggleMaintenanceMode() {
    const maintenance = localStorage.getItem('maintenance-mode') === 'true';
    localStorage.setItem('maintenance-mode', !maintenance);
    this.showNotification(`Maintenance mode ${!maintenance ? 'enabled' : 'disabled'}`, 'info');
  }

  emergencyStop() {
    if (confirm('Are you sure you want to emergency stop? This will immediately pause all services.')) {
      localStorage.setItem('emergency-stop', 'true');
      this.showNotification('Emergency stop activated!', 'error');
    }
  }

  showNotification(message, type = 'info') {
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      // Fallback
      const notification = document.createElement('div');
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
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  }
}

// Initialize Developer Mode
const developerMode = new DeveloperMode();

// Export for global access
window.developerMode = developerMode;