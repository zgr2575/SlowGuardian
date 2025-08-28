/**
 * SlowGuardian v9 Onboarding System
 */

class OnboardingSystem {
  constructor() {
    this.currentStep = 0;
    this.steps = [
      {
        title: "Welcome to SlowGuardian v9! 🚀",
        content: `
          <div class="onboarding-intro">
            <h3>Welcome to the completely rewritten SlowGuardian v9!</h3>
            <ul class="feature-list">
              <li>✨ Modern, breathtaking UI design</li>
              <li>⚡ Powerful plugin system</li>
              <li>🚀 Enhanced performance</li>
              <li>🛡️ Better security features</li>
              <li>📱 Mobile-friendly design</li>
            </ul>
            <p><strong>Press / to quickly focus the search bar.</strong></p>
          </div>
        `,
        buttons: ["Get Started"]
      },
      {
        title: "Choose Your Theme 🎨",
        content: `
          <div class="onboarding-themes">
            <h3>Select your preferred theme:</h3>
            <div class="theme-grid">
              <div class="theme-option" data-theme="default">
                <div class="theme-preview theme-preview-default"></div>
                <span>Default</span>
              </div>
              <div class="theme-option" data-theme="cyberpunk">
                <div class="theme-preview theme-preview-cyberpunk"></div>
                <span>Cyberpunk</span>
              </div>
              <div class="theme-option" data-theme="ocean">
                <div class="theme-preview theme-preview-ocean"></div>
                <span>Ocean</span>
              </div>
              <div class="theme-option" data-theme="sunset">
                <div class="theme-preview theme-preview-sunset"></div>
                <span>Sunset</span>
              </div>
              <div class="theme-option" data-theme="catppuccinMocha">
                <div class="theme-preview theme-preview-catppuccin"></div>
                <span>Catppuccin</span>
              </div>
            </div>
          </div>
        `,
        buttons: ["Previous", "Continue"]
      },
      {
        title: "Privacy & Security Settings 🔒",
        content: `
          <div class="onboarding-security">
            <h3>Configure your privacy settings:</h3>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" id="onboard-ab-cloak" checked>
                <span class="setting-text">
                  <strong>About:Blank Cloaking</strong><br>
                  Hide your browsing activity with about:blank popups
                </span>
              </label>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" id="onboard-tab-cloak" checked>
                <span class="setting-text">
                  <strong>Tab Cloaking</strong><br>
                  Disguise your browser tab as Google Drive or other sites
                </span>
              </label>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" id="onboard-particles" checked>
                <span class="setting-text">
                  <strong>Background Particles</strong><br>
                  Enable animated background particles for visual appeal
                </span>
              </label>
            </div>
          </div>
        `,
        buttons: ["Previous", "Continue"]
      },
      {
        title: "All Set! 🎉",
        content: `
          <div class="onboarding-complete">
            <h3>SlowGuardian v9 is ready to use!</h3>
            <div class="completion-summary">
              <h4>Quick Tips:</h4>
              <ul>
                <li>🔍 Use the search bar to browse websites or search the web</li>
                <li>🎮 Check out the Games and Apps sections for quick access</li>
                <li>⚙️ Visit Settings to customize your experience further</li>
                <li>🛡️ Your privacy settings are now configured</li>
                <li>📱 SlowGuardian works great on mobile devices too!</li>
                <li>🎨 You can create custom themes in the Settings</li>
              </ul>
            </div>
            <p><strong>Enjoy your enhanced browsing experience!</strong></p>
          </div>
        `,
        buttons: ["Finish"]
      }
    ];
    
    this.init();
  }

  init() {
    // Check if onboarding was already completed or if first-boot setup is running
    if (localStorage.getItem('sg-onboarding-completed') === 'true' || 
        localStorage.getItem('setup-completed') === 'true' ||
        getCookie('setup-completed') === 'true') {
      return;
    }

    // Don't run onboarding on developer page (first-boot setup handles it)
    if (window.location.pathname.includes('/developer')) {
      return;
    }

    // Wait a bit for the page to load properly and ensure no other modals are present
    setTimeout(() => {
      // Double-check no setup modal is present
      if (!document.getElementById('first-boot-setup')) {
        this.createOnboardingModal();
        this.showStep(0);
      }
    }, 1500);
  }

  createOnboardingModal() {
    // Remove any existing onboarding modal
    const existingModal = document.getElementById('onboarding-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'onboarding-modal';
    modal.className = 'onboarding-modal';
    modal.innerHTML = `
      <div class="onboarding-overlay"></div>
      <div class="onboarding-container">
        <div class="onboarding-header">
          <h2 id="onboarding-title">Welcome to SlowGuardian v9!</h2>
          <div class="onboarding-progress">
            <div class="progress-bar">
              <div class="progress-fill" id="progress-fill"></div>
            </div>
            <span class="progress-text" id="progress-text">1 of 4</span>
          </div>
        </div>
        <div class="onboarding-content" id="onboarding-content">
          <div class="onboarding-intro">
            <h3>Loading onboarding...</h3>
          </div>
        </div>
        <div class="onboarding-footer">
          <div class="onboarding-buttons" id="onboarding-buttons">
            <button class="btn btn-primary">Loading...</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.setupEventListeners();
    
    console.log('Onboarding modal created and added to DOM');
    
    // Ensure modal is visible
    modal.style.display = 'flex';
    modal.style.zIndex = '10001'; // Higher than first-boot setup
  }

  setupEventListeners() {
    // Theme selection
    document.addEventListener('click', (e) => {
      if (e.target.closest('.theme-option')) {
        const themeOption = e.target.closest('.theme-option');
        const theme = themeOption.dataset.theme;
        
        // Remove active class from all theme options
        document.querySelectorAll('.theme-option').forEach(option => {
          option.classList.remove('active');
        });
        
        // Add active class to selected theme
        themeOption.classList.add('active');
        
        // Apply theme
        localStorage.setItem('theme', theme);
        this.applyTheme(theme);
      }
    });
  }

  showStep(stepIndex) {
    this.currentStep = stepIndex;
    const step = this.steps[stepIndex];
    
    console.log(`Showing onboarding step ${stepIndex}:`, step.title);
    
    // Update content
    const titleElement = document.getElementById('onboarding-title');
    const contentElement = document.getElementById('onboarding-content');
    
    if (titleElement) {
      titleElement.textContent = step.title;
    } else {
      console.error('Title element not found');
    }
    
    if (contentElement) {
      contentElement.innerHTML = step.content;
    } else {
      console.error('Content element not found');
    }
    
    // Update progress
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill && progressText) {
      const progress = ((stepIndex + 1) / this.steps.length) * 100;
      progressFill.style.width = progress + '%';
      progressText.textContent = `${stepIndex + 1} of ${this.steps.length}`;
    }
    
    // Update buttons
    this.updateButtons(step.buttons);
  }

  updateButtons(buttons) {
    const buttonContainer = document.getElementById('onboarding-buttons');
    if (!buttonContainer) {
      console.error('Button container not found');
      return;
    }
    
    buttonContainer.innerHTML = '';
    
    buttons.forEach(buttonText => {
      const button = document.createElement('button');
      button.className = 'btn ' + (buttonText === 'Finish' || buttonText === 'Get Started' || buttonText === 'Continue' ? 'btn-primary' : 'btn-secondary');
      button.textContent = buttonText;
      button.style.cssText = `
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 500;
        font-size: 14px;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 100px;
      `;
      
      if (button.classList.contains('btn-primary')) {
        button.style.background = 'var(--accent-primary, #4f46e5)';
        button.style.color = 'white';
      } else {
        button.style.background = 'var(--bg-quaternary, #374151)';
        button.style.color = 'var(--text-secondary, #9ca3af)';
        button.style.border = '1px solid var(--border-primary, #4b5563)';
      }
      
      button.addEventListener('click', () => this.handleButtonClick(buttonText));
      buttonContainer.appendChild(button);
    });
    
    console.log(`Created ${buttons.length} buttons:`, buttons);
  }

  handleButtonClick(buttonText) {
    switch (buttonText) {
      case 'Get Started':
      case 'Continue':
        if (this.currentStep === 2) {
          // Save privacy settings
          this.savePrivacySettings();
        }
        this.nextStep();
        break;
      case 'Previous':
        this.previousStep();
        break;
      case 'Finish':
        this.completeOnboarding();
        break;
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.showStep(this.currentStep + 1);
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }

  savePrivacySettings() {
    const abCloak = document.getElementById('onboard-ab-cloak').checked;
    const tabCloak = document.getElementById('onboard-tab-cloak').checked;
    const particles = document.getElementById('onboard-particles').checked;
    
    localStorage.setItem('ab', abCloak.toString());
    localStorage.setItem('tab-cloak-enabled', tabCloak.toString());
    localStorage.setItem('Particles', particles.toString());
  }

  applyTheme(theme) {
    // Remove existing theme
    const existingTheme = document.querySelector('link[href*="/themes/"]');
    if (existingTheme) {
      existingTheme.remove();
    }

    if (theme && theme !== 'default') {
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

  completeOnboarding() {
    localStorage.setItem('sg-onboarding-completed', 'true');
    
    // Remove modal
    const modal = document.getElementById('onboarding-modal');
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);

    // Show success notification
    if (window.showNotification) {
      window.showNotification('Welcome to SlowGuardian v9! Setup complete.', 'success');
    }
  }
}

// Initialize onboarding when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OnboardingSystem();
});

// Helper function to get cookies (if not already defined)
if (typeof getCookie === 'undefined') {
  window.getCookie = function(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };
}