/**
 * SlowGuardian v9 - First Boot Setup System
 * Guided configuration for developers and administrators
 */

class FirstBootSetup {
  constructor() {
    this.isFirstBoot =
      !getCookie("setup-completed") && !localStorage.getItem("setup-completed");
    this.currentStep = 0;
    this.setupData = {};
    this.init();
  }

  init() {
    // Only show first-boot setup if accessing developer page or developer mode is explicitly requested
    const isDeveloperPage = window.location.pathname.includes("/developer");
    const isDeveloperIntent = new URLSearchParams(window.location.search).has(
      "developer-setup"
    );

    if (this.isFirstBoot && (isDeveloperPage || isDeveloperIntent)) {
      // Prevent regular onboarding from running
      localStorage.setItem("sg-onboarding-completed", "true");
      this.showSetupWizard();
    }
  }

  showSetupWizard() {
    console.log("🚀 Starting First Boot Setup...");

    // Create setup modal
    const setupModal = document.createElement("div");
    setupModal.id = "first-boot-setup";
    setupModal.className = "setup-modal";
    setupModal.innerHTML = `
      <div class="setup-container">
        <div class="setup-header">
          <h1>🛡️ Welcome to SlowGuardian v9</h1>
          <p>Let's get your proxy server configured</p>
          <div class="setup-progress">
            <div class="progress-bar">
              <div class="progress-fill" id="setup-progress"></div>
            </div>
            <span class="progress-text" id="progress-text">Step 1 of 6</span>
          </div>
        </div>
        
        <div class="setup-content" id="setup-content">
          <!-- Steps will be inserted here -->
        </div>
        
        <div class="setup-footer">
          <button class="btn btn-secondary" id="setup-prev" disabled>Previous</button>
          <button class="btn btn-primary" id="setup-next">Next</button>
          <button class="btn btn-success" id="setup-finish" style="display: none;">Complete Setup</button>
        </div>
      </div>
    `;

    // Add styles
    this.addSetupStyles();

    // Add to page
    document.body.appendChild(setupModal);

    // Setup event listeners
    this.setupEventListeners();

    // Show first step
    this.showStep(0);
  }

  addSetupStyles() {
    const styles = document.createElement("style");
    styles.id = "setup-styles";
    styles.textContent = `
      .setup-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
      }
      
      .setup-container {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border-radius: 20px;
        padding: 30px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .setup-header {
        text-align: center;
        margin-bottom: 30px;
      }
      
      .setup-header h1 {
        color: #fff;
        margin: 0 0 10px 0;
        font-size: 2.5rem;
      }
      
      .setup-header p {
        color: #aaa;
        margin: 0 0 20px 0;
        font-size: 1.1rem;
      }
      
      .setup-progress {
        margin: 20px 0;
      }
      
      .progress-bar {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        height: 8px;
        overflow: hidden;
        margin-bottom: 10px;
      }
      
      .progress-fill {
        background: linear-gradient(90deg, #6366f1, #8b5cf6);
        height: 100%;
        width: 16.67%;
        transition: width 0.3s ease;
      }
      
      .progress-text {
        color: #aaa;
        font-size: 0.9rem;
      }
      
      .setup-content {
        min-height: 300px;
        color: #fff;
      }
      
      .setup-step {
        display: none;
      }
      
      .setup-step.active {
        display: block;
        animation: fadeIn 0.3s ease;
      }
      
      .setup-step h2 {
        color: #6366f1;
        margin-bottom: 20px;
      }
      
      .setup-option {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 15px;
        margin: 10px 0;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .setup-option:hover {
        border-color: #6366f1;
        background: rgba(99, 102, 241, 0.1);
      }
      
      .setup-option.selected {
        border-color: #6366f1;
        background: rgba(99, 102, 241, 0.2);
      }
      
      .setup-option h3 {
        margin: 0 0 5px 0;
        color: #fff;
      }
      
      .setup-option p {
        margin: 0;
        color: #aaa;
        font-size: 0.9rem;
      }
      
      .setup-input {
        width: 100%;
        padding: 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: #fff;
        font-size: 1rem;
        margin: 10px 0;
      }
      
      .setup-input:focus {
        outline: none;
        border-color: #6366f1;
      }
      
      .setup-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .btn-primary {
        background: #6366f1;
        color: white;
      }
      
      .btn-primary:hover {
        background: #5b5df0;
      }
      
      .btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: #aaa;
      }
      
      .btn-secondary:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
      }
      
      .btn-success {
        background: #10b981;
        color: white;
      }
      
      .btn-success:hover {
        background: #059669;
      }
      
      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(styles);
  }

  setupEventListeners() {
    const prevBtn = document.getElementById("setup-prev");
    const nextBtn = document.getElementById("setup-next");
    const finishBtn = document.getElementById("setup-finish");

    prevBtn.addEventListener("click", () => this.previousStep());
    nextBtn.addEventListener("click", () => this.nextStep());
    finishBtn.addEventListener("click", () => this.completeSetup());
  }

  showStep(stepIndex) {
    this.currentStep = stepIndex;
    const content = document.getElementById("setup-content");
    const progressFill = document.getElementById("setup-progress");
    const progressText = document.getElementById("progress-text");
    const prevBtn = document.getElementById("setup-prev");
    const nextBtn = document.getElementById("setup-next");
    const finishBtn = document.getElementById("setup-finish");

    // Update progress
    const progress = ((stepIndex + 1) / 6) * 100;
    progressFill.style.width = progress + "%";
    progressText.textContent = `Step ${stepIndex + 1} of 6`;

    // Update buttons
    prevBtn.disabled = stepIndex === 0;
    nextBtn.style.display = stepIndex === 5 ? "none" : "inline-block";
    finishBtn.style.display = stepIndex === 5 ? "inline-block" : "none";

    // Show appropriate step
    content.innerHTML = this.getStepContent(stepIndex);

    // Add event listeners for step-specific elements
    this.setupStepListeners(stepIndex);
  }

  getStepContent(stepIndex) {
    const steps = [
      // Step 1: Welcome & Admin Setup
      `
        <div class="setup-step active">
          <h2>👋 Administrator Setup</h2>
          <p>First, let's create your administrator account for developer mode.</p>
          
          <div class="form-group">
            <label>Admin Username:</label>
            <input type="text" class="setup-input" id="admin-username" value="admin" placeholder="Enter admin username">
          </div>
          
          <div class="form-group">
            <label>Admin Password:</label>
            <input type="password" class="setup-input" id="admin-password" value="SlowGuardian2024!" placeholder="Enter secure password">
          </div>
          
          <div class="form-group">
            <label>Developer Mode:</label>
            <div class="setup-option selected" data-value="enabled">
              <h3>✅ Enable Developer Mode</h3>
              <p>Enables advanced admin controls, user management, and debugging tools</p>
            </div>
            <div class="setup-option" data-value="disabled">
              <h3>❌ Disable Developer Mode</h3>
              <p>Standard proxy mode without administrative features</p>
            </div>
          </div>
        </div>
      `,

      // Step 2: Performance Settings
      `
        <div class="setup-step active">
          <h2>⚡ Performance Configuration</h2>
          <p>Configure SlowGuardian for your hardware capabilities.</p>
          
          <div class="setup-option selected" data-value="high">
            <h3>🚀 High Performance</h3>
            <p>Full visual effects, animations, and features (modern hardware)</p>
          </div>
          
          <div class="setup-option" data-value="balanced">
            <h3>⚖️ Balanced</h3>
            <p>Moderate effects with good performance (standard laptops)</p>
          </div>
          
          <div class="setup-option" data-value="performance">
            <h3>🔋 Performance Mode</h3>
            <p>Minimal effects, optimized for older or low-end devices</p>
          </div>
        </div>
      `,

      // Step 3: Security Settings
      `
        <div class="setup-step active">
          <h2>🔒 Security Configuration</h2>
          <p>Configure security and privacy features.</p>
          
          <div class="form-group">
            <div class="setup-option" data-value="screenshot-protection">
              <h3>📸 Screenshot Protection</h3>
              <p>Hide content when screenshots are detected (Developer Mode only)</p>
            </div>
            
            <div class="setup-option" data-value="about-blank">
              <h3>🕳️ About:Blank Cloaking</h3>
              <p>Automatically open in about:blank popup for stealth browsing</p>
            </div>
            
            <div class="setup-option" data-value="tab-cloaking">
              <h3>🎭 Tab Cloaking</h3>
              <p>Disguise browser tab as common educational sites</p>
            </div>
          </div>
        </div>
      `,

      // Step 4: Plugin Configuration
      `
        <div class="setup-step active">
          <h2>🔌 Plugin Configuration</h2>
          <p>Choose which plugins to enable (you can change this later).</p>
          
          <div class="setup-option" data-value="none">
            <h3>🚫 No Plugins</h3>
            <p>Start with a clean interface (recommended for beginners)</p>
          </div>
          
          <div class="setup-option selected" data-value="essential">
            <h3>⭐ Essential Plugins</h3>
            <p>Notes manager, bookmarks, and basic productivity tools</p>
          </div>
          
          <div class="setup-option" data-value="all">
            <h3>🎛️ All Plugins</h3>
            <p>Enable all available plugins for maximum functionality</p>
          </div>
        </div>
      `,

      // Step 5: Theme Selection
      `
        <div class="setup-step active">
          <h2>🎨 Theme Selection</h2>
          <p>Choose your preferred visual theme.</p>
          
          <div class="setup-option selected" data-value="dark">
            <h3>🌙 Dark Theme</h3>
            <p>Modern dark interface (default)</p>
          </div>
          
          <div class="setup-option" data-value="cyberpunk">
            <h3>🌈 Cyberpunk</h3>
            <p>Neon accents with futuristic styling</p>
          </div>
          
          <div class="setup-option" data-value="ocean">
            <h3>🌊 Ocean</h3>
            <p>Blue theme with wave-like animations</p>
          </div>
          
          <div class="setup-option" data-value="sunset">
            <h3>🌅 Sunset</h3>
            <p>Warm orange/red gradient theme</p>
          </div>
        </div>
      `,

      // Step 6: Completion
      `
        <div class="setup-step active">
          <h2>🎉 Setup Complete!</h2>
          <p>Your SlowGuardian v9 proxy server is now configured and ready to use.</p>
          
          <div class="setup-summary">
            <h3>Configuration Summary:</h3>
            <ul id="config-summary">
              <!-- Summary will be populated here -->
            </ul>
          </div>
          
          <div class="setup-next-steps">
            <h3>🚀 Quick Start:</h3>
            <ul>
              <li><strong>Home Page:</strong> Browse the web securely</li>
              <li><strong>Apps:</strong> Access popular web applications</li>
              <li><strong>Games:</strong> Play games through the proxy</li>
              <li><strong>Settings:</strong> Customize your experience</li>
              <li><strong>Developer Mode:</strong> Access admin controls (if enabled)</li>
            </ul>
          </div>
        </div>
      `,
    ];

    return steps[stepIndex];
  }

  setupStepListeners(stepIndex) {
    // Add click listeners for options
    document.querySelectorAll(".setup-option").forEach((option) => {
      option.addEventListener("click", () => {
        // Handle single selection vs multiple selection based on step
        if (stepIndex === 2) {
          // Security step allows multiple
          option.classList.toggle("selected");
        } else {
          // Other steps are single selection
          document
            .querySelectorAll(".setup-option")
            .forEach((opt) => opt.classList.remove("selected"));
          option.classList.add("selected");
        }
      });
    });

    // Step-specific setup
    if (stepIndex === 5) {
      this.populateConfigSummary();
    }
  }

  nextStep() {
    // Save current step data
    this.saveStepData(this.currentStep);

    if (this.currentStep < 5) {
      this.showStep(this.currentStep + 1);
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }

  saveStepData(stepIndex) {
    switch (stepIndex) {
      case 0: // Admin setup
        this.setupData.adminUsername =
          document.getElementById("admin-username")?.value || "admin";
        this.setupData.adminPassword =
          document.getElementById("admin-password")?.value ||
          "SlowGuardian2024!";
        this.setupData.developerMode =
          document.querySelector(".setup-option.selected")?.dataset.value ===
          "enabled";
        break;

      case 1: // Performance
        this.setupData.performanceMode =
          document.querySelector(".setup-option.selected")?.dataset.value ||
          "high";
        break;

      case 2: // Security
        this.setupData.securityFeatures = Array.from(
          document.querySelectorAll(".setup-option.selected")
        ).map((el) => el.dataset.value);
        break;

      case 3: // Plugins
        this.setupData.pluginConfig =
          document.querySelector(".setup-option.selected")?.dataset.value ||
          "essential";
        break;

      case 4: // Theme
        this.setupData.theme =
          document.querySelector(".setup-option.selected")?.dataset.value ||
          "dark";
        break;
    }
  }

  populateConfigSummary() {
    const summary = document.getElementById("config-summary");
    if (!summary) return;

    summary.innerHTML = `
      <li><strong>Admin:</strong> ${this.setupData.adminUsername} (Developer Mode: ${this.setupData.developerMode ? "Enabled" : "Disabled"})</li>
      <li><strong>Performance:</strong> ${this.setupData.performanceMode} mode</li>
      <li><strong>Security:</strong> ${this.setupData.securityFeatures?.length || 0} features enabled</li>
      <li><strong>Plugins:</strong> ${this.setupData.pluginConfig} configuration</li>
      <li><strong>Theme:</strong> ${this.setupData.theme}</li>
    `;
  }

  async completeSetup() {
    console.log("🎉 Completing setup with data:", this.setupData);

    try {
      // Apply configuration
      await this.applyConfiguration();

      // Mark setup as completed
      setCookie("setup-completed", "true", 365);
      localStorage.setItem("setup-completed", "true");

      // Show success message
      this.showSuccessMessage();

      // Close setup after delay
      setTimeout(() => {
        document.getElementById("first-boot-setup").remove();
        document.getElementById("setup-styles").remove();

        // Reload page to apply all settings
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Setup failed:", error);
      alert(
        "Setup failed. Please try again or configure manually in Settings."
      );
    }
  }

  async applyConfiguration() {
    // Apply performance mode
    if (this.setupData.performanceMode === "performance") {
      setCookie("performance-mode", "true", 365);
    }

    // Apply theme
    setCookie("theme", this.setupData.theme, 365);

    // Apply security features
    if (this.setupData.securityFeatures?.includes("about-blank")) {
      setCookie("aboutBlankCloaking", "true", 365);
    }

    if (this.setupData.securityFeatures?.includes("tab-cloaking")) {
      setCookie("tabCloaking", "true", 365);
    }

    // Apply plugin configuration
    const enabledPlugins = [];
    if (this.setupData.pluginConfig === "essential") {
      enabledPlugins.push("notes-manager", "bookmark-system");
    } else if (this.setupData.pluginConfig === "all") {
      enabledPlugins.push(
        "notes-manager",
        "bookmark-system",
        "password-manager",
        "download-manager",
        "theme-creator"
      );
    }
    setCookie("enabled-plugins", JSON.stringify(enabledPlugins), 365);

    // Save admin credentials (in a real app, this would be more secure)
    if (this.setupData.developerMode) {
      setCookie(
        "admin-credentials",
        btoa(
          JSON.stringify({
            username: this.setupData.adminUsername,
            password: this.setupData.adminPassword,
          })
        ),
        365
      );
      setCookie("developer-mode", "true", 365);
    }
  }

  showSuccessMessage() {
    const content = document.getElementById("setup-content");
    content.innerHTML = `
      <div class="setup-step active" style="text-align: center;">
        <h2>✅ Configuration Applied!</h2>
        <p>SlowGuardian v9 has been successfully configured.</p>
        <p>The page will reload in a few seconds to apply all settings.</p>
        <div style="margin: 20px 0; font-size: 2rem;">🚀</div>
      </div>
    `;

    // Hide buttons
    document.querySelector(".setup-footer").style.display = "none";
  }
}

// Initialize first boot setup
document.addEventListener("DOMContentLoaded", () => {
  new FirstBootSetup();
});

// Helper function to get/set cookies (if not already defined)
if (typeof getCookie === "undefined") {
  window.getCookie = function (name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
}

if (typeof setCookie === "undefined") {
  window.setCookie = function (name, value, days) {
    const expires = days
      ? `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}`
      : "";
    document.cookie = `${name}=${value}${expires}; path=/`;
  };
}
