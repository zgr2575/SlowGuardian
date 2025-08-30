/**
 * SlowGuardian v9 Ads Manager
 * Comprehensive advertising system for monetization
 */

class AdsManager {
  constructor() {
    this.adsEnabled = this.getAdsSetting();
    this.adProviders = {
      google: {
        enabled: true,
        clientId: "", // Will be set by admin
        slots: new Map(),
      },
      media: {
        enabled: true,
        networkId: "", // Custom network
        slots: new Map(),
      },
    };

    this.adContainers = new Map();
    this.videoAdQueue = [];
    this.displayAdQueue = [];
    this.adBlockDetected = false;

    this.init();
  }

  init() {
    if (!this.adsEnabled) {
      console.log("📢 Ads disabled by admin configuration");
      // Still mark as loaded even if disabled
      if (typeof window.markModuleLoaded === 'function') {
        window.markModuleLoaded('ads-manager');
      }
      return;
    }

    this.detectAdBlock();
    this.loadAdProviders();
    this.setupAdContainers();
    this.setupVideoAds();

    console.log("📢 SlowGuardian Ads Manager initialized");
    
    // Mark module as loaded
    if (typeof window.markModuleLoaded === 'function') {
      window.markModuleLoaded('ads-manager');
    }
  }

  getAdsSetting() {
    // Check if user is a developer (only developers can disable ads)
    if (!this.isDeveloper()) {
      // Non-developers always have ads enabled
      return true;
    }

    // Check if ads are enabled in settings (for developers only)
    return (
      getCookie("ads-enabled") !== "false" &&
      localStorage.getItem("ads-enabled") !== "false"
    );
  }

  isDeveloper() {
    // Check for admin authentication
    const adminToken = sessionStorage.getItem("admin-token");
    if (adminToken) {
      return true;
    }

    // Check for developer mode cookie
    const devMode = getCookie("developer-mode");
    if (devMode === "true") {
      return true;
    }

    // Check if admin panel is active
    if (window.adminPanel && window.adminPanel.isLoggedIn) {
      return true;
    }

    return false;
  }

  detectAdBlock() {
    // Create a test ad element to detect ad blockers
    const testAd = document.createElement("div");
    testAd.innerHTML = "&nbsp;";
    testAd.className = "adsbox";
    testAd.style.cssText =
      "position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;";
    document.body.appendChild(testAd);

    setTimeout(() => {
      if (testAd.offsetHeight === 0) {
        this.adBlockDetected = true;
        this.showAdBlockMessage();
        console.warn("📢 Ad blocker detected");
      }
      document.body.removeChild(testAd);
    }, 100);
  }

  showAdBlockMessage() {
    const message = document.createElement("div");
    message.className = "adblock-notice";
    message.innerHTML = `
      <div class="adblock-content">
        <h3>🛡️ Ad Blocker Detected</h3>
        <p>SlowGuardian is free thanks to ads. Please consider disabling your ad blocker to support us!</p>
        <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
      </div>
    `;
    message.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      text-align: center;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;

    const style = document.createElement("style");
    style.textContent = `
      .adblock-content h3 { margin: 0 0 10px 0; }
      .adblock-content p { margin: 0 0 10px 0; }
      .adblock-content button {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      }
      .adblock-content button:hover {
        background: rgba(255,255,255,0.3);
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(message);
  }

  loadAdProviders() {
    if (this.adBlockDetected) return;

    // Google AdSense
    this.loadGoogleAds();

    // Custom media networks
    this.loadMediaAds();
  }

  loadGoogleAds() {
    if (!this.adProviders.google.enabled) return;

    const script = document.createElement("script");
    script.async = true;
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    script.crossOrigin = "anonymous";

    script.onerror = () => {
      console.warn("📢 Google Ads failed to load");
      this.adProviders.google.enabled = false;
    };

    document.head.appendChild(script);
  }

  loadMediaAds() {
    // Custom ad network integration placeholder
    console.log("📢 Loading custom media ads...");
  }

  setupAdContainers() {
    // Create ad containers for each page
    this.createPageAds();
    this.createSidebarAds();
    this.createFooterAds();
  }

  createPageAds() {
    const pages = ["home", "apps", "games", "settings", "tabs"];

    pages.forEach((pageId) => {
      const pageElement = document.getElementById(`page-${pageId}`);
      if (pageElement) {
        this.addDisplayAd(pageElement, `${pageId}-header`, "top");
        this.addDisplayAd(pageElement, `${pageId}-content`, "middle");
      }
    });
  }

  createSidebarAds() {
    // Add sidebar ads that appear on all pages
    const sidebar = document.createElement("div");
    sidebar.className = "ads-sidebar";
    sidebar.innerHTML = `
      <div class="ad-container" id="sidebar-ad-1">
        <div class="ad-label">Advertisement</div>
        <div class="ad-content" id="sidebar-display-1"></div>
      </div>
      <div class="ad-container" id="sidebar-ad-2">
        <div class="ad-label">Advertisement</div>
        <div class="ad-content" id="sidebar-display-2"></div>
      </div>
    `;

    sidebar.style.cssText = `
      position: fixed;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      width: 160px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 20px;
    `;

    const adStyle = document.createElement("style");
    adStyle.textContent = `
      .ads-sidebar .ad-container {
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 8px;
        padding: 10px;
        text-align: center;
      }
      .ads-sidebar .ad-label {
        font-size: 10px;
        color: rgba(255,255,255,0.6);
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .ads-sidebar .ad-content {
        min-height: 120px;
        background: rgba(0,0,0,0.1);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255,255,255,0.4);
        font-size: 12px;
      }
      
      @media (max-width: 768px) {
        .ads-sidebar { display: none; }
      }
    `;
    document.head.appendChild(adStyle);
    document.body.appendChild(sidebar);

    // Load ads into sidebar
    this.loadDisplayAd("sidebar-display-1", "160x600");
    this.loadDisplayAd("sidebar-display-2", "160x600");
  }

  createFooterAds() {
    const footer = document.querySelector(".footer");
    if (footer) {
      const adContainer = document.createElement("div");
      adContainer.className = "footer-ads";
      adContainer.innerHTML = `
        <div class="ad-label">Advertisement</div>
        <div class="ad-content" id="footer-display-ad"></div>
      `;

      adContainer.style.cssText = `
        margin: 20px 0;
        text-align: center;
        padding: 20px;
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.1);
      `;

      footer.insertBefore(adContainer, footer.firstChild);
      this.loadDisplayAd("footer-display-ad", "728x90");
    }
  }

  addDisplayAd(container, adId, position = "top") {
    const adElement = document.createElement("div");
    adElement.className = "page-ad-container";
    adElement.innerHTML = `
      <div class="ad-label">Advertisement</div>
      <div class="ad-content" id="${adId}"></div>
    `;

    adElement.style.cssText = `
      margin: 20px auto;
      text-align: center;
      max-width: 728px;
      padding: 15px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.1);
    `;

    if (position === "top") {
      container.insertBefore(adElement, container.firstChild);
    } else if (position === "middle") {
      const middle = Math.floor(container.children.length / 2);
      container.insertBefore(adElement, container.children[middle]);
    } else {
      container.appendChild(adElement);
    }

    this.loadDisplayAd(adId, "728x90");
  }

  loadDisplayAd(containerId, size) {
    if (this.adBlockDetected) {
      this.showPlaceholderAd(containerId, size);
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) return;

    // Try Google Ads first
    if (this.adProviders.google.enabled) {
      this.loadGoogleDisplayAd(containerId, size);
    } else {
      // Fallback to custom ads
      this.loadCustomDisplayAd(containerId, size);
    }
  }

  loadGoogleDisplayAd(containerId, size) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const adElement = document.createElement("ins");
    adElement.className = "adsbygoogle";
    adElement.style.display = "block";
    adElement.setAttribute("data-ad-client", "ca-pub-YOUR_PUBLISHER_ID"); // Replace with actual ID
    adElement.setAttribute("data-ad-slot", "AUTO_SLOT"); // Replace with actual slot
    adElement.setAttribute("data-ad-format", "auto");
    adElement.setAttribute("data-full-width-responsive", "true");

    container.appendChild(adElement);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.warn("📢 Google Ad failed to load:", error);
      this.loadCustomDisplayAd(containerId, size);
    }
  }

  loadCustomDisplayAd(containerId, size) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Create custom ad content
    const adContent = document.createElement("div");
    adContent.innerHTML = `
      <div style="
        width: 100%;
        min-height: 90px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        border-radius: 6px;
        cursor: pointer;
        transition: transform 0.2s ease;
      " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
        <div style="text-align: center;">
          <div style="font-weight: bold; margin-bottom: 5px;">🚀 Upgrade Your Experience</div>
          <div style="font-size: 12px; opacity: 0.9;">Premium SlowGuardian Features Available</div>
        </div>
      </div>
    `;

    adContent.addEventListener("click", () => {
      this.handleAdClick("custom-upgrade");
    });

    container.appendChild(adContent);
  }

  showPlaceholderAd(containerId, size) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div style="
        padding: 20px;
        background: rgba(255,255,255,0.05);
        border: 2px dashed rgba(255,255,255,0.2);
        border-radius: 6px;
        color: rgba(255,255,255,0.5);
        text-align: center;
        font-size: 12px;
      ">
        Ad space (${size})<br>
        <small>Please disable ad blocker to support SlowGuardian</small>
      </div>
    `;
  }

  setupVideoAds() {
    // Setup video ads for proxy page loading
    this.createVideoAdModal();
  }

  createVideoAdModal() {
    const modal = document.createElement("div");
    modal.id = "video-ad-modal";
    modal.className = "video-ad-modal";
    modal.innerHTML = `
      <div class="video-ad-overlay"></div>
      <div class="video-ad-content">
        <div class="video-ad-header">
          <span class="video-ad-title">Advertisement</span>
          <span class="video-ad-skip" id="video-ad-skip" style="display: none;">Skip in <span id="skip-countdown">5</span>s</span>
        </div>
        <div class="video-ad-container">
          <div id="video-ad-player" class="video-ad-animated">
            <div class="ad-content-animated">
              <div class="logo">🛡️</div>
              <h2>SlowGuardian Premium</h2>
              <p>Experience the web without limits!</p>
              <div class="features">
                <div class="feature">✅ No Ads</div>
                <div class="feature">✅ Faster Speeds</div>
                <div class="feature">✅ Priority Support</div>
              </div>
              <div class="price">Just $4.99/month</div>
              <div class="progress-bar">
                <div class="progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="video-ad-controls">
          <button id="video-ad-close" style="display: none;">Continue to Site</button>
        </div>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .video-ad-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10001;
        display: none;
      }
      
      .video-ad-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(5px);
      }
      
      .video-ad-content {
        position: relative;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 800px;
        width: 90%;
        background: #1a1a2e;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }
      
      .video-ad-header {
        padding: 15px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .video-ad-title {
        font-weight: bold;
        font-size: 16px;
      }
      
      .video-ad-skip {
        font-size: 14px;
        background: rgba(255, 255, 255, 0.2);
        padding: 5px 10px;
        border-radius: 15px;
        cursor: pointer;
      }
      
      .video-ad-container {
        position: relative;
        padding-bottom: 56.25%; /* 16:9 aspect ratio */
        height: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        overflow: hidden;
      }
      
      .video-ad-animated {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
        animation: adPulse 3s ease-in-out infinite;
      }
      
      .ad-content-animated {
        padding: 20px;
        max-width: 500px;
      }
      
      .ad-content-animated .logo {
        font-size: 48px;
        margin-bottom: 20px;
        animation: logoFloat 2s ease-in-out infinite;
      }
      
      .ad-content-animated h2 {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 10px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      
      .ad-content-animated p {
        font-size: 18px;
        margin-bottom: 20px;
        opacity: 0.9;
      }
      
      .features {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      
      .feature {
        background: rgba(255,255,255,0.2);
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 14px;
        animation: featureSlide 1s ease-out infinite alternate;
      }
      
      .feature:nth-child(1) { animation-delay: 0s; }
      .feature:nth-child(2) { animation-delay: 0.3s; }
      .feature:nth-child(3) { animation-delay: 0.6s; }
      
      .price {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
        color: #ffd700;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      }
      
      .progress-bar {
        width: 100%;
        height: 4px;
        background: rgba(255,255,255,0.3);
        border-radius: 2px;
        overflow: hidden;
      }
      
      .progress-fill {
        height: 100%;
        background: #ffd700;
        width: 0%;
        animation: progressFill 5s linear forwards;
      }
      
      @keyframes adPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
      
      @keyframes logoFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes featureSlide {
        0% { transform: translateX(0px); }
        100% { transform: translateX(5px); }
      }
      
      @keyframes progressFill {
        0% { width: 0%; }
        100% { width: 100%; }
      }
      
      .video-ad-controls {
        padding: 15px 20px;
        text-align: center;
        background: #16213e;
      }
      
      #video-ad-close {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: transform 0.2s ease;
      }
      
      #video-ad-close:hover {
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(modal);

    this.setupVideoAdEvents();
  }

  setupVideoAdEvents() {
    const skipButton = document.getElementById("video-ad-skip");
    const closeButton = document.getElementById("video-ad-close");
    const modal = document.getElementById("video-ad-modal");

    let skipCountdown = 5;
    let countdownTimer;

    skipButton.addEventListener("click", () => {
      if (skipCountdown <= 0) {
        this.closeVideoAd();
      }
    });

    closeButton.addEventListener("click", () => {
      this.closeVideoAd();
    });

    // Auto-start countdown when modal shows
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          if (modal.style.display === "block" && !countdownTimer) {
            this.startAdCountdown();
          }
        }
      });
    });

    observer.observe(modal, { attributes: true });
  }

  startAdCountdown() {
    const skipButton = document.getElementById("video-ad-skip");
    const closeButton = document.getElementById("video-ad-close");
    let skipCountdown = 5;

    const countdownTimer = setInterval(() => {
      skipCountdown--;
      document.getElementById("skip-countdown").textContent = skipCountdown;

      if (skipCountdown <= 0) {
        clearInterval(countdownTimer);
        skipButton.innerHTML = "Skip Ad";
        skipButton.style.cursor = "pointer";
        skipButton.style.backgroundColor = "rgba(255,255,255,0.3)";
      }
    }, 1000);

    // Auto-close after 8 seconds total
    setTimeout(() => {
      closeButton.style.display = "block";
      skipButton.style.display = "none";
    }, 8000);
  }

  showVideoAd(callback) {
    if (this.adBlockDetected) {
      // Skip video ad if ad blocker detected
      if (callback) callback();
      return;
    }

    const modal = document.getElementById("video-ad-modal");

    modal.style.display = "block";

    // Store callback for when ad closes
    this.videoAdCallback = callback;

    // Reset UI elements
    document.getElementById("skip-countdown").textContent = "5";
    document.getElementById("video-ad-skip").style.display = "block";
    document.getElementById("video-ad-skip").innerHTML =
      'Skip in <span id="skip-countdown">5</span>s';
    document.getElementById("video-ad-close").style.display = "none";

    // Start the countdown automatically
    this.startAdCountdown();
  }

  closeVideoAd() {
    const modal = document.getElementById("video-ad-modal");

    modal.style.display = "none";

    // Execute callback
    if (this.videoAdCallback) {
      this.videoAdCallback();
      this.videoAdCallback = null;
    }
  }

  handleAdClick(adType) {
    console.log(`📢 Ad clicked: ${adType}`);

    // Track ad clicks for analytics
    this.trackAdEvent("click", adType);

    // Handle different ad types
    switch (adType) {
      case "custom-upgrade":
        this.showUpgradeModal();
        break;
      default:
        // External ad click
        break;
    }
  }

  showUpgradeModal() {
    const modal = document.createElement("div");
    modal.className = "upgrade-modal";
    modal.innerHTML = `
      <div class="upgrade-overlay" onclick="this.parentElement.remove()"></div>
      <div class="upgrade-content">
        <div class="upgrade-header">
          <h2>🚀 SlowGuardian Premium</h2>
          <button onclick="this.closest('.upgrade-modal').remove()" class="close-btn">×</button>
        </div>
        <div class="upgrade-body">
          <h3>Unlock Premium Features</h3>
          <ul>
            <li>✅ Ad-free experience</li>
            <li>✅ Faster proxy servers</li>
            <li>✅ Priority support</li>
            <li>✅ Advanced customization</li>
            <li>✅ Exclusive plugins</li>
          </ul>
          <div class="upgrade-price">$4.99/month</div>
          <button class="upgrade-btn" onclick="alert('Payment integration coming soon!')">Upgrade Now</button>
        </div>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .upgrade-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10002;
      }
      .upgrade-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
      }
      .upgrade-content {
        position: relative;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 400px;
        width: 90%;
        background: #1a1a2e;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }
      .upgrade-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .upgrade-header h2 {
        margin: 0;
      }
      .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
      }
      .upgrade-body {
        padding: 30px;
        text-align: center;
        color: white;
      }
      .upgrade-body h3 {
        margin-top: 0;
        color: #667eea;
      }
      .upgrade-body ul {
        text-align: left;
        margin: 20px 0;
      }
      .upgrade-body li {
        margin: 10px 0;
      }
      .upgrade-price {
        font-size: 24px;
        font-weight: bold;
        color: #667eea;
        margin: 20px 0;
      }
      .upgrade-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        width: 100%;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(modal);
  }

  trackAdEvent(event, adType) {
    // Send analytics data to server
    fetch("/api/ads/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event,
        adType,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    }).catch((error) => {
      console.warn("Failed to track ad event:", error);
    });
  }

  // Public API methods
  enableAds() {
    this.adsEnabled = true;
    setCookie("ads-enabled", "true");
    this.init();
  }

  disableAds() {
    // Only allow developers to disable ads
    if (!this.isDeveloper()) {
      console.warn("📢 Ad disabling restricted to developers only");
      return false;
    }

    this.adsEnabled = false;
    setCookie("ads-enabled", "false");

    // Remove all ad containers
    document
      .querySelectorAll(".page-ad-container, .ads-sidebar, .footer-ads")
      .forEach((el) => {
        el.remove();
      });

    return true;
  }

  showProxyVideoAd(url, callback) {
    console.log("📢 Showing video ad before proxy load...");
    this.showVideoAd(() => {
      console.log("📢 Video ad completed, loading proxy...");
      if (callback) callback(url);
    });
  }
}

// Initialize ads manager when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Only initialize if cookie utils are available
  if (typeof getCookie === "function") {
    window.adsManager = new AdsManager();
  } else {
    console.warn("Cookie utilities not available, delaying ads initialization");
    setTimeout(() => {
      window.adsManager = new AdsManager();
    }, 500);
  }
});

// Export for modules
if (typeof module !== "undefined") {
  module.exports = AdsManager;
}
