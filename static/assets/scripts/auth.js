/**
 * SlowGuardian v9 Authentication System
 */

class AuthSystem {
  constructor() {
    this.isEnabled = localStorage.getItem('sg-auth-enabled') === 'true';
    this.username = localStorage.getItem('sg-auth-username');
    this.password = localStorage.getItem('sg-auth-password');
    this.isAuthenticated = sessionStorage.getItem('sg-authenticated') === 'true';
    
    this.init();
  }

  init() {
    // Only show login if auth is enabled and user is not authenticated
    if (this.isEnabled && !this.isAuthenticated && this.username && this.password) {
      this.showLoginScreen();
    }
  }

  showLoginScreen() {
    const loginOverlay = document.createElement('div');
    loginOverlay.id = 'auth-overlay';
    loginOverlay.className = 'auth-overlay';
    loginOverlay.innerHTML = `
      <div class="auth-container">
        <div class="auth-header">
          <div class="auth-logo">
            <span class="brand-icon">🛡️</span>
            <span class="brand-text">SlowGuardian</span>
            <span class="brand-version">v9</span>
          </div>
          <h2>Authentication Required</h2>
          <p>Please enter your credentials to access SlowGuardian</p>
        </div>
        
        <form class="auth-form" id="auth-form">
          <div class="auth-field">
            <label for="auth-username">Username</label>
            <input 
              type="text" 
              id="auth-username" 
              name="username" 
              required 
              autocomplete="username"
              placeholder="Enter your username"
            />
          </div>
          
          <div class="auth-field">
            <label for="auth-password">Password</label>
            <input 
              type="password" 
              id="auth-password" 
              name="password" 
              required 
              autocomplete="current-password"
              placeholder="Enter your password"
            />
          </div>
          
          <div class="auth-error" id="auth-error" style="display: none;">
            Invalid username or password. Please try again.
          </div>
          
          <button type="submit" class="auth-submit">
            <span class="auth-submit-text">Sign In</span>
            <span class="auth-submit-loading" style="display: none;">
              <span class="loading-spinner"></span>
              Authenticating...
            </span>
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Secure access to your proxy service</p>
          <div class="auth-features">
            <span>🔒 Encrypted Connection</span>
            <span>🛡️ Privacy Protected</span>
            <span>⚡ Fast Access</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(loginOverlay);
    this.setupAuthListeners();
    
    // Focus username field
    setTimeout(() => {
      document.getElementById('auth-username').focus();
    }, 100);
  }

  setupAuthListeners() {
    const form = document.getElementById('auth-form');
    const errorDiv = document.getElementById('auth-error');
    const submitBtn = form.querySelector('.auth-submit');
    const submitText = submitBtn.querySelector('.auth-submit-text');
    const submitLoading = submitBtn.querySelector('.auth-submit-loading');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const username = document.getElementById('auth-username').value.trim();
      const password = document.getElementById('auth-password').value;
      
      // Show loading state
      submitText.style.display = 'none';
      submitLoading.style.display = 'flex';
      submitBtn.disabled = true;
      errorDiv.style.display = 'none';
      
      // Simulate authentication delay
      setTimeout(() => {
        if (this.authenticate(username, password)) {
          this.onAuthSuccess();
        } else {
          this.onAuthFailure();
        }
        
        // Reset button state
        submitText.style.display = 'block';
        submitLoading.style.display = 'none';
        submitBtn.disabled = false;
      }, 1000);
    });

    // Enter key handling
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && document.getElementById('auth-overlay')) {
        form.dispatchEvent(new Event('submit'));
      }
    });
  }

  authenticate(username, password) {
    return username === this.username && password === this.password;
  }

  onAuthSuccess() {
    // Mark as authenticated for this session
    sessionStorage.setItem('sg-authenticated', 'true');
    
    // Remove auth overlay with animation
    const overlay = document.getElementById('auth-overlay');
    overlay.style.opacity = '0';
    overlay.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      overlay.remove();
    }, 300);

    // Show success notification
    setTimeout(() => {
      if (window.showNotification) {
        window.showNotification('Welcome back! You have been authenticated.', 'success');
      }
    }, 400);
  }

  onAuthFailure() {
    const errorDiv = document.getElementById('auth-error');
    const usernameField = document.getElementById('auth-username');
    const passwordField = document.getElementById('auth-password');
    
    // Show error
    errorDiv.style.display = 'block';
    
    // Add error classes
    usernameField.classList.add('error');
    passwordField.classList.add('error');
    
    // Clear password field
    passwordField.value = '';
    
    // Focus username field
    usernameField.focus();
    usernameField.select();
    
    // Remove error classes after a delay
    setTimeout(() => {
      usernameField.classList.remove('error');
      passwordField.classList.remove('error');
    }, 3000);
  }

  // Method to enable authentication (called from settings)
  static enable(username, password) {
    localStorage.setItem('sg-auth-enabled', 'true');
    localStorage.setItem('sg-auth-username', username);
    localStorage.setItem('sg-auth-password', password);
    
    if (window.showNotification) {
      window.showNotification('Authentication enabled successfully', 'success');
    }
  }

  // Method to disable authentication
  static disable() {
    localStorage.removeItem('sg-auth-enabled');
    localStorage.removeItem('sg-auth-username');
    localStorage.removeItem('sg-auth-password');
    sessionStorage.removeItem('sg-authenticated');
    
    if (window.showNotification) {
      window.showNotification('Authentication disabled', 'info');
    }
  }

  // Method to check if user is authenticated
  static isAuthenticated() {
    const isEnabled = localStorage.getItem('sg-auth-enabled') === 'true';
    const isAuth = sessionStorage.getItem('sg-authenticated') === 'true';
    
    // If auth is not enabled, consider user as authenticated
    return !isEnabled || isAuth;
  }

  // Method to logout
  static logout() {
    sessionStorage.removeItem('sg-authenticated');
    window.location.reload();
  }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
  new AuthSystem();
});

// Make AuthSystem available globally
window.AuthSystem = AuthSystem;