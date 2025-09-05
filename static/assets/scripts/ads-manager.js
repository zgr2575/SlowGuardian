/**
 * SlowGuardian v9 Ads Manager
 * Comprehensive Google AdSense integration system for monetization
 * Supports responsive ads, auto ads, and multiple placement strategies
 */

class AdsManager {
  constructor() {
    this.adsEnabled = this.getAdsSetting();
    this.adsenseConfig = this.loadAdsenseConfig();
    this.adProviders = {
      google: {
        enabled: true,
        publisherId: this.adsenseConfig.publisherId,
        autoAds: this.adsenseConfig.autoAds,
        slots: new Map(),
        testMode: this.adsenseConfig.testMode,
      },
      media: {
        enabled: true,
        networkId: "", // Custom network fallback
        slots: new Map(),
      },
    };

    this.adContainers = new Map();
    this.videoAdQueue = [];
    this.displayAdQueue = [];
    this.adBlockDetected = false;
    this.adsenseReady = false;
    this.autoAdsLoaded = false;

    this.init();
  }

  loadAdsenseConfig() {
    // Load AdSense configuration from server or localStorage
    const defaultConfig = {
      publisherId: "", // Will be loaded from server config
      autoAds: true,
      testMode: true, // Default to test mode
      slots: {
        header: "",
        sidebar: "",
        footer: "",
        content: "",
        mobile: "",
        video: "",
      },
      settings: {
        enableLazyLoading: true,
        enableResponsive: true,
        enablePageLevel: true,
      },
      tracking: {
        enableAnalytics: true,
        customEvents: true,
        revenueTracking: true,
      },
    };

    // Try to load from server config endpoint
    if (typeof fetch !== "undefined") {
      fetch("/api/adsense-config")
        .then((response) => response.json())
        .then((config) => {
          Object.assign(defaultConfig, config);
          this.updateAdsenseConfig(defaultConfig);
        })
        .catch(() => {
          // Fallback to localStorage or environment
          const storedConfig = localStorage.getItem("adsense-config");
          if (storedConfig) {
            try {
              Object.assign(defaultConfig, JSON.parse(storedConfig));
            } catch (e) {
              console.warn("📢 Invalid stored AdSense config, using defaults");
            }
          }
        });
    }

    return defaultConfig;
  }

  updateAdsenseConfig(config) {
    this.adsenseConfig = config;
    this.adProviders.google.publisherId = config.publisherId;
    this.adProviders.google.autoAds = config.autoAds;
    this.adProviders.google.testMode = config.testMode;

    // Save to localStorage for offline access
    localStorage.setItem("adsense-config", JSON.stringify(config));

    // Reinitialize if already loaded
    if (this.adsenseReady) {
      this.initializeAdsense();
    }
  }

  init() {
    if (!this.adsEnabled) {
      console.log("📢 Ads disabled by admin configuration");
      // Still mark as loaded even if disabled
      if (typeof window.markModuleLoaded === "function") {
        window.markModuleLoaded("ads-manager");
      }
      return;
    }

    this.detectAdBlock();
    this.loadAdProviders();
    this.setupAdContainers();
    this.setupVideoAds();
    this.initPremiumSystem();
    this.setupStrategicAdPlacements();
    this.initServerSideAds();

    console.log("📢 SlowGuardian Ads Manager initialized");

    // Mark module as loaded
    if (typeof window.markModuleLoaded === "function") {
      window.markModuleLoaded("ads-manager");
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

    // Load AdSense script with enhanced configuration
    const script = document.createElement("script");
    script.async = true;
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    script.crossOrigin = "anonymous";

    // Add publisher ID as data attribute if available
    if (this.adProviders.google.publisherId) {
      script.setAttribute(
        "data-ad-client",
        this.adProviders.google.publisherId
      );
    }

    script.onload = () => {
      this.adsenseReady = true;
      this.initializeAdsense();
      console.log("📢 Google AdSense loaded successfully");
    };

    script.onerror = () => {
      // Enhanced error handling
      console.warn(
        "📢 Google AdSense failed to load - check network or ad blocker"
      );
      this.adProviders.google.enabled = false;
      this.showAdsenseErrorFallback();
    };

    document.head.appendChild(script);
  }

  initializeAdsense() {
    if (!this.adsenseReady || !this.adProviders.google.publisherId) return;

    // Initialize Auto Ads if enabled
    if (this.adProviders.google.autoAds && !this.autoAdsLoaded) {
      this.enableAutoAds();
    }

    // Initialize manual ad slots
    this.refreshAllAds();

    // Setup AdSense configuration
    if (window.adsbygoogle) {
      // Configure page-level settings
      window.adsbygoogle.push({
        google_ad_client: this.adProviders.google.publisherId,
        enable_page_level_ads: this.adsenseConfig.settings.enablePageLevel,
        overlays: { bottom: true }, // Enable overlay ads
      });
    }

    console.log(
      "📢 Google AdSense initialized with publisher:",
      this.adProviders.google.publisherId
    );
  }

  enableAutoAds() {
    if (!this.adProviders.google.publisherId) {
      console.warn("📢 Cannot enable Auto Ads - publisher ID not configured");
      return;
    }

    // Add Auto Ads script tag
    const autoAdsScript = document.createElement("script");
    autoAdsScript.async = true;
    autoAdsScript.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
      this.adProviders.google.publisherId;
    autoAdsScript.crossOrigin = "anonymous";

    autoAdsScript.onload = () => {
      // Enable Auto Ads
      (window.adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: this.adProviders.google.publisherId,
        enable_page_level_ads: true,
        tag_partner: "site_kit",
      });

      this.autoAdsLoaded = true;
      console.log("📢 Google Auto Ads enabled");
    };

    document.head.appendChild(autoAdsScript);
  }

  showAdsenseErrorFallback() {
    // Show user-friendly message when AdSense fails
    const errorContainer = document.createElement("div");
    errorContainer.className = "adsense-error-notice";
    errorContainer.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
        color: white;
        padding: 15px;
        border-radius: 8px;
        text-align: center;
        margin: 20px;
        font-size: 14px;
        box-shadow: 0 4px 15px rgba(255,107,107,0.3);
      ">
        <div style="font-weight: bold; margin-bottom: 8px;">🚨 Ad Service Temporarily Unavailable</div>
        <div style="opacity: 0.9;">Our ad service is currently experiencing issues. Please refresh the page or try again later.</div>
        <button onclick="location.reload()" style="
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
        ">Refresh Page</button>
      </div>
    `;

    // Add to top of page
    document.body.insertBefore(errorContainer, document.body.firstChild);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorContainer.parentNode) {
        errorContainer.remove();
      }
    }, 10000);
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
    if (!container || !this.adProviders.google.publisherId) return;

    // Determine the appropriate ad slot based on container and size
    const adSlot = this.getAdSlotForContainer(containerId, size);

    const adElement = document.createElement("ins");
    adElement.className = "adsbygoogle";
    adElement.style.display = "block";
    adElement.setAttribute(
      "data-ad-client",
      this.adProviders.google.publisherId
    );

    // Use specific slot if available, otherwise use auto ads
    if (adSlot) {
      adElement.setAttribute("data-ad-slot", adSlot);
    } else {
      adElement.setAttribute("data-ad-format", "auto");
      adElement.setAttribute("data-full-width-responsive", "true");
    }

    // Configure responsive behavior
    if (this.adsenseConfig.settings.enableResponsive) {
      adElement.setAttribute("data-full-width-responsive", "true");
    }

    // Configure lazy loading
    if (this.adsenseConfig.settings.enableLazyLoading) {
      adElement.setAttribute("data-ad-loading", "lazy");
    }

    // Test mode configuration
    if (this.adProviders.google.testMode) {
      adElement.setAttribute("data-adtest", "on");
    }

    container.appendChild(adElement);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});

      // Track ad placement for analytics
      this.trackAdPlacement(containerId, size, "google");
    } catch (error) {
      console.warn("📢 Google Ad failed to load:", error);
      this.loadCustomDisplayAd(containerId, size);
    }
  }

  getAdSlotForContainer(containerId, size) {
    // Map container IDs to configured ad slots
    const slotMap = {
      header: this.adsenseConfig.slots.header,
      footer: this.adsenseConfig.slots.footer,
      sidebar: this.adsenseConfig.slots.sidebar,
      content: this.adsenseConfig.slots.content,
      mobile: this.adsenseConfig.slots.mobile,
      video: this.adsenseConfig.slots.video,
    };

    // Check if container ID contains any slot keywords
    for (const [key, slot] of Object.entries(slotMap)) {
      if (containerId.toLowerCase().includes(key) && slot) {
        return slot;
      }
    }

    // Default based on size
    if (size === "728x90" && this.adsenseConfig.slots.header) {
      return this.adsenseConfig.slots.header;
    } else if (size === "160x600" && this.adsenseConfig.slots.sidebar) {
      return this.adsenseConfig.slots.sidebar;
    }

    return null; // Use auto ads
  }

  trackAdPlacement(containerId, size, provider) {
    if (!this.adsenseConfig.tracking.enableAnalytics) return;

    const placementData = {
      containerId,
      size,
      provider,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    };

    // Send to analytics endpoint
    fetch("/api/ads/track-placement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(placementData),
    }).catch((error) => {
      console.warn("Failed to track ad placement:", error);
    });

    // Also track custom events if enabled
    if (
      this.adsenseConfig.tracking.customEvents &&
      typeof gtag !== "undefined"
    ) {
      gtag("event", "ad_placement", {
        container_id: containerId,
        ad_size: size,
        ad_provider: provider,
      });
    }
  }

  refreshAllAds() {
    // Refresh all AdSense ads on the page
    if (window.adsbygoogle && this.adsenseReady) {
      try {
        // Push refresh command for all ads
        window.adsbygoogle.push(function () {
          // This will refresh all ads on the page
        });
        console.log("📢 Refreshed all Google Ads");
      } catch (error) {
        console.warn("📢 Failed to refresh ads:", error);
      }
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

  // Public API methods for AdSense management
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

  // AdSense Configuration Management
  configureAdsense(config) {
    if (!this.isDeveloper()) {
      console.warn("📢 AdSense configuration restricted to developers only");
      return false;
    }

    this.updateAdsenseConfig(config);

    // Reinitialize with new configuration
    if (this.adsenseReady) {
      this.refreshAllAds();
    }

    console.log("📢 AdSense configuration updated");
    return true;
  }

  setPublisherId(publisherId) {
    if (!this.isDeveloper()) {
      console.warn("📢 Publisher ID change restricted to developers only");
      return false;
    }

    if (!publisherId || !publisherId.startsWith("ca-pub-")) {
      console.error(
        "📢 Invalid publisher ID format. Must start with 'ca-pub-'"
      );
      return false;
    }

    this.adsenseConfig.publisherId = publisherId;
    this.adProviders.google.publisherId = publisherId;
    localStorage.setItem("adsense-config", JSON.stringify(this.adsenseConfig));

    console.log("📢 Publisher ID updated to:", publisherId);
    return true;
  }

  configureAdSlots(slots) {
    if (!this.isDeveloper()) {
      console.warn("📢 Ad slot configuration restricted to developers only");
      return false;
    }

    Object.assign(this.adsenseConfig.slots, slots);
    localStorage.setItem("adsense-config", JSON.stringify(this.adsenseConfig));

    console.log("📢 Ad slots configured:", slots);
    return true;
  }

  toggleAutoAds(enabled) {
    if (!this.isDeveloper()) {
      console.warn("📢 Auto Ads toggle restricted to developers only");
      return false;
    }

    this.adsenseConfig.autoAds = enabled;
    this.adProviders.google.autoAds = enabled;

    if (enabled && this.adsenseReady && !this.autoAdsLoaded) {
      this.enableAutoAds();
    }

    localStorage.setItem("adsense-config", JSON.stringify(this.adsenseConfig));
    console.log("📢 Auto Ads", enabled ? "enabled" : "disabled");
    return true;
  }

  toggleTestMode(enabled) {
    if (!this.isDeveloper()) {
      console.warn("📢 Test mode toggle restricted to developers only");
      return false;
    }

    this.adsenseConfig.testMode = enabled;
    this.adProviders.google.testMode = enabled;

    localStorage.setItem("adsense-config", JSON.stringify(this.adsenseConfig));
    console.log("📢 Test mode", enabled ? "enabled" : "disabled");
    return true;
  }

  // Revenue Tracking and Analytics
  getAdMetrics() {
    return fetch("/api/ads/metrics")
      .then((response) => response.json())
      .then((data) => {
        console.log("📢 Ad metrics retrieved:", data);
        return data;
      })
      .catch((error) => {
        console.warn("Failed to retrieve ad metrics:", error);
        return null;
      });
  }

  getRevenueReport(period = "30d") {
    if (!this.isDeveloper()) {
      console.warn("📢 Revenue reports restricted to developers only");
      return Promise.resolve(null);
    }

    return fetch(`/api/ads/revenue?period=${period}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(`📢 Revenue report (${period}):`, data);
        return data;
      })
      .catch((error) => {
        console.warn("Failed to retrieve revenue report:", error);
        return null;
      });
  }

  // Administration Interface
  showAdminPanel() {
    if (!this.isDeveloper()) {
      console.warn("📢 Admin panel access restricted to developers only");
      return;
    }

    this.createAdminModal();
  }

  createAdminModal() {
    const modal = document.createElement("div");
    modal.className = "adsense-admin-modal";
    modal.innerHTML = `
      <div class="admin-overlay" onclick="this.parentElement.remove()"></div>
      <div class="admin-content">
        <div class="admin-header">
          <h2>🚀 AdSense Administration</h2>
          <button onclick="this.closest('.adsense-admin-modal').remove()" class="close-btn">×</button>
        </div>
        <div class="admin-body">
          <div class="config-section">
            <h3>Publisher Configuration</h3>
            <div class="input-group">
              <label>Publisher ID:</label>
              <input type="text" id="publisher-id" placeholder="ca-pub-XXXXXXXXXXXXXXXX" 
                     value="${this.adsenseConfig.publisherId || ""}" />
              <button onclick="window.adsManager.setPublisherId(document.getElementById('publisher-id').value)">
                Update
              </button>
            </div>
          </div>
          
          <div class="config-section">
            <h3>Ad Slots</h3>
            <div class="slots-grid">
              <div class="input-group">
                <label>Header Slot:</label>
                <input type="text" id="slot-header" placeholder="Slot ID" 
                       value="${this.adsenseConfig.slots.header || ""}" />
              </div>
              <div class="input-group">
                <label>Sidebar Slot:</label>
                <input type="text" id="slot-sidebar" placeholder="Slot ID" 
                       value="${this.adsenseConfig.slots.sidebar || ""}" />
              </div>
              <div class="input-group">
                <label>Footer Slot:</label>
                <input type="text" id="slot-footer" placeholder="Slot ID" 
                       value="${this.adsenseConfig.slots.footer || ""}" />
              </div>
              <div class="input-group">
                <label>Content Slot:</label>
                <input type="text" id="slot-content" placeholder="Slot ID" 
                       value="${this.adsenseConfig.slots.content || ""}" />
              </div>
            </div>
            <button onclick="window.adsManager.updateSlotsFromForm()">Update Slots</button>
          </div>
          
          <div class="config-section">
            <h3>Settings</h3>
            <div class="settings-grid">
              <label class="toggle">
                <input type="checkbox" id="auto-ads" ${this.adsenseConfig.autoAds ? "checked" : ""} 
                       onchange="window.adsManager.toggleAutoAds(this.checked)">
                <span>Auto Ads</span>
              </label>
              <label class="toggle">
                <input type="checkbox" id="test-mode" ${this.adsenseConfig.testMode ? "checked" : ""} 
                       onchange="window.adsManager.toggleTestMode(this.checked)">
                <span>Test Mode</span>
              </label>
              <label class="toggle">
                <input type="checkbox" id="lazy-loading" ${this.adsenseConfig.settings.enableLazyLoading ? "checked" : ""}>
                <span>Lazy Loading</span>
              </label>
              <label class="toggle">
                <input type="checkbox" id="responsive-ads" ${this.adsenseConfig.settings.enableResponsive ? "checked" : ""}>
                <span>Responsive Ads</span>
              </label>
            </div>
          </div>
          
          <div class="config-section">
            <h3>Actions</h3>
            <div class="actions-grid">
              <button onclick="window.adsManager.refreshAllAds()" class="action-btn">
                🔄 Refresh All Ads
              </button>
              <button onclick="window.adsManager.getAdMetrics().then(m => alert(JSON.stringify(m, null, 2)))" class="action-btn">
                📊 View Metrics
              </button>
              <button onclick="window.adsManager.getRevenueReport().then(r => alert(JSON.stringify(r, null, 2)))" class="action-btn">
                💰 Revenue Report
              </button>
              <button onclick="location.reload()" class="action-btn">
                🔃 Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .adsense-admin-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10003;
      }
      .admin-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
      }
      .admin-content {
        position: relative;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        background: #1a1a2e;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }
      .admin-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .admin-header h2 {
        margin: 0;
      }
      .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
      }
      .admin-body {
        padding: 20px;
        max-height: 60vh;
        overflow-y: auto;
        color: white;
      }
      .config-section {
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      .config-section h3 {
        margin-top: 0;
        color: #667eea;
      }
      .input-group {
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .input-group label {
        min-width: 120px;
        font-weight: bold;
      }
      .input-group input[type="text"] {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        background: rgba(255,255,255,0.1);
        color: white;
      }
      .input-group button, .action-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .slots-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 15px;
      }
      .settings-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 15px;
      }
      .toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }
      .toggle input[type="checkbox"] {
        width: 16px;
        height: 16px;
      }
      .actions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .action-btn {
        padding: 12px;
        text-align: center;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(modal);
  }

  updateSlotsFromForm() {
    const slots = {
      header: document.getElementById("slot-header").value,
      sidebar: document.getElementById("slot-sidebar").value,
      footer: document.getElementById("slot-footer").value,
      content: document.getElementById("slot-content").value,
    };

    this.configureAdSlots(slots);
    alert("Ad slots updated successfully!");
  }

  showProxyVideoAd(url, callback) {
    console.log("📢 Showing video ad before proxy load...");
    this.showVideoAd(() => {
      console.log("📢 Video ad completed, loading proxy...");
      if (callback) callback(url);
    });
  }

  // Initialize Premium Subscription System
  initPremiumSystem() {
    this.premiumFeatures = {
      adFree: false,
      unlimitedBandwidth: false,
      priorityServers: false,
      customThemes: false,
      advancedSettings: false,
      downloadManager: false,
      cloudSave: false,
      dedicatedSupport: false
    };

    // Check if user has premium subscription
    this.checkPremiumStatus();
    this.setupPremiumUI();
  }

  checkPremiumStatus() {
    const premium = localStorage.getItem('slowguardian-premium');
    const premiumExpiry = localStorage.getItem('slowguardian-premium-expiry');
    
    if (premium === 'true' && premiumExpiry) {
      const expiryDate = new Date(premiumExpiry);
      if (expiryDate > new Date()) {
        this.activatePremiumFeatures();
        return true;
      } else {
        // Premium expired
        localStorage.removeItem('slowguardian-premium');
        localStorage.removeItem('slowguardian-premium-expiry');
      }
    }
    return false;
  }

  activatePremiumFeatures() {
    this.premiumFeatures = {
      adFree: true,
      unlimitedBandwidth: true,
      priorityServers: true,
      customThemes: true,
      advancedSettings: true,
      downloadManager: true,
      cloudSave: true,
      dedicatedSupport: true
    };

    // Disable ads for premium users
    this.adsEnabled = false;
    
    console.log("🌟 SlowGuardian+ Premium activated!");
    this.showPremiumWelcome();
  }

  setupPremiumUI() {
    if (!this.checkPremiumStatus()) {
      this.showPremiumUpgradePrompts();
    }
  }

  showPremiumWelcome() {
    if (window.showNotification) {
      window.showNotification(
        "🌟 Welcome to SlowGuardian+ Premium! Enjoy ad-free browsing and premium features.",
        "success"
      );
    }
  }

  showPremiumUpgradePrompts() {
    // Don't show premium prompts if user already has premium
    if (typeof window.isPremiumActive === 'function' && window.isPremiumActive()) {
      return;
    }
    
    // Add premium upgrade buttons throughout the UI
    this.addPremiumBadges();
    this.createUpgradeModal();
  }

  addPremiumBadges() {
    // Don't show premium branding if user already has premium
    if (typeof window.isPremiumActive === 'function' && window.isPremiumActive()) {
      return;
    }
    
    // Add "Get Premium" button to the sidebar navigation
    const sidebar = document.querySelector('.sidebar-nav .nav-links');
    
    if (sidebar) {
      // Create premium button for sidebar
      const premiumButton = document.createElement('button');
      premiumButton.className = 'nav-link premium-nav-btn';
      premiumButton.innerHTML = `
        <div class="nav-icon">⭐</div>
        <span class="nav-text">Get Premium</span>
      `;
      premiumButton.onclick = () => this.showUpgradeModal();
      
      // Add premium button at the bottom of navigation
      sidebar.appendChild(premiumButton);
    } else {
      // Fallback: Add floating button if sidebar not found
      const upgradeButton = document.createElement('div');
      upgradeButton.className = 'premium-upgrade-btn';
      upgradeButton.innerHTML = `
        <div class="premium-badge">
          <span class="premium-icon">⭐</span>
          <span class="premium-text">Get Premium</span>
          <span class="premium-benefit">Ad-Free Experience</span>
        </div>
      `;
      upgradeButton.onclick = () => this.showUpgradeModal();
      
      // Position as floating button in bottom-right
      upgradeButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        cursor: pointer;
      `;
      
      document.body.appendChild(upgradeButton);
    }
  }

  createUpgradeModal() {
    const modal = document.createElement('div');
    modal.id = 'premium-upgrade-modal';
    modal.className = 'premium-modal hidden';
    modal.innerHTML = `
      <div class="premium-modal-content">
        <div class="premium-modal-header">
          <h2>🌟 Upgrade to SlowGuardian+ Premium</h2>
          <button class="premium-close" onclick="this.parentElement.parentElement.parentElement.classList.add('hidden')">&times;</button>
        </div>
        <div class="premium-features">
          <div class="feature-grid">
            <div class="feature-item">
              <span class="feature-icon">🚫</span>
              <h3>Ad-Free Experience</h3>
              <p>Browse without any advertisements</p>
            </div>
            <div class="feature-item">
              <span class="feature-icon">⚡</span>
              <h3>Priority Servers</h3>
              <p>Access to fastest proxy servers</p>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🎨</span>
              <h3>Custom Themes</h3>
              <p>Personalize your browsing experience</p>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📦</span>
              <h3>Download Manager</h3>
              <p>Advanced file download capabilities</p>
            </div>
            <div class="feature-item">
              <span class="feature-icon">☁️</span>
              <h3>Cloud Save</h3>
              <p>Sync settings across devices</p>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🛟</span>
              <h3>Premium Support</h3>
              <p>Priority customer service</p>
            </div>
          </div>
        </div>
        <div class="premium-pricing">
          <div class="pricing-plan">
            <h3>Monthly</h3>
            <div class="price">$4.99<span>/month</span></div>
            <button class="premium-btn" onclick="window.adsManager.initiatePurchase('monthly')">Get Premium</button>
          </div>
          <div class="pricing-plan featured">
            <h3>Yearly</h3>
            <div class="price">$39.99<span>/year</span></div>
            <div class="savings">Save 33%!</div>
            <button class="premium-btn" onclick="window.adsManager.initiatePurchase('yearly')">Get Premium</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  showUpgradeModal() {
    const modal = document.getElementById('premium-upgrade-modal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  initiatePurchase(plan) {
    console.log(`🌟 Initiating premium purchase: ${plan}`);
    
    // Create payment method selection modal
    const paymentModal = document.createElement('div');
    paymentModal.className = 'premium-modal';
    paymentModal.innerHTML = `
      <div class="premium-modal-content">
        <div class="premium-modal-header">
          <h2>💳 Payment Method</h2>
          <button class="premium-close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
        </div>
        <div style="padding: 20px; text-align: center;">
          <h3>Select Payment Method for ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</h3>
          <p style="color: #666; margin-bottom: 30px;">
            Price: ${plan === 'monthly' ? '$4.99/month' : '$39.99/year (Save 33%)'}
          </p>
          
          <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
            <button onclick="window.adsManager.initiatePayment('cashapp', '${plan}')" 
                    style="background: #00d632; color: white; border: none; padding: 15px 25px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; min-width: 150px;">
              💰 CashApp
            </button>
            <button onclick="window.adsManager.initiatePayment('paypal', '${plan}')" 
                    style="background: #0070ba; color: white; border: none; padding: 15px 25px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; min-width: 150px;">
              🏦 PayPal
            </button>
          </div>
          
          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            Secure payment processing via "Pay a Friend" feature
          </p>
        </div>
      </div>
    `;
    
    document.body.appendChild(paymentModal);
  }

  initiatePayment(method, plan) {
    const price = plan === 'monthly' ? '$4.99' : '$39.99';
    
    if (method === 'cashapp') {
      alert(`CashApp Payment Selected!\n\nPlan: ${plan}\nAmount: ${price}\n\nYou will be redirected to CashApp to complete the "Pay a Friend" transaction. After payment, contact support with your transaction ID for account upgrade.`);
    } else if (method === 'paypal') {
      alert(`PayPal Payment Selected!\n\nPlan: ${plan}\nAmount: ${price}\n\nYou will be redirected to PayPal to complete the "Pay a Friend" transaction. After payment, contact support with your transaction ID for account upgrade.`);
    }
    
    // Remove payment modal
    const paymentModal = document.querySelector('.premium-modal');
    if (paymentModal) {
      paymentModal.remove();
    }
  }

  // Strategic Ad Placement System
  setupStrategicAdPlacements() {
    this.adPlacements = {
      header: { enabled: true, frequency: 'always' },
      sidebar: { enabled: true, frequency: 'always' },
      content: { enabled: true, frequency: 'every-3-items' },
      footer: { enabled: true, frequency: 'always' },
      interstitial: { enabled: true, frequency: 'every-5-pages' },
      games: { enabled: true, frequency: 'every-5-items' },
      apps: { enabled: true, frequency: 'every-5-items' }
    };

    this.currentAdCount = 0;
    this.targetAdsPerPage = 4; // Minimum 4 ads per page

    this.injectStrategicAds();
  }

  injectStrategicAds() {
    if (this.checkPremiumStatus()) {
      console.log("📢 Premium user detected - skipping ad injection");
      return;
    }

    // Inject ads in different locations
    this.injectHeaderAd();
    this.injectSidebarAd();
    this.injectContentAds();
    this.injectFooterAd();
    this.injectGamePageAds();
    this.ensureMinimumAdCount();
  }

  injectHeaderAd() {
    const header = document.querySelector('.header, .navbar, .top-bar');
    if (header && this.currentAdCount < this.targetAdsPerPage) {
      const adContainer = this.createAdContainer('header-ad', 'leaderboard');
      header.appendChild(adContainer);
      this.currentAdCount++;
    }
  }

  injectSidebarAd() {
    const sidebar = document.querySelector('.sidebar, .nav-sidebar');
    if (sidebar && this.currentAdCount < this.targetAdsPerPage) {
      const adContainer = this.createAdContainer('sidebar-ad', 'skyscraper');
      sidebar.appendChild(adContainer);
      this.currentAdCount++;
    }
  }

  injectContentAds() {
    const contentAreas = document.querySelectorAll('.content, .main-content, .page-content');
    contentAreas.forEach((content, index) => {
      if (this.currentAdCount < this.targetAdsPerPage) {
        const adContainer = this.createAdContainer(`content-ad-${index}`, 'rectangle');
        content.appendChild(adContainer);
        this.currentAdCount++;
      }
    });
  }

  injectFooterAd() {
    const footer = document.querySelector('.footer, .bottom-bar');
    if (footer && this.currentAdCount < this.targetAdsPerPage) {
      const adContainer = this.createAdContainer('footer-ad', 'leaderboard');
      footer.appendChild(adContainer);
      this.currentAdCount++;
    }
  }

  injectGamePageAds() {
    // Special handling for games and apps pages
    const gameGrid = document.getElementById('games-grid');
    const appGrid = document.getElementById('apps-grid');
    
    if (gameGrid) {
      this.injectGridAds(gameGrid, 'game');
    }
    
    if (appGrid) {
      this.injectGridAds(appGrid, 'app');
    }
  }

  injectGridAds(grid, type) {
    const items = grid.children;
    const adEvery = 5; // Every 5 items

    for (let i = adEvery; i < items.length; i += adEvery + 1) {
      const adContainer = this.createAdContainer(`${type}-grid-ad-${i}`, 'medium-rectangle');
      adContainer.classList.add('grid-ad-item');
      
      // Insert ad after every 5th item
      if (items[i]) {
        grid.insertBefore(adContainer, items[i]);
        this.currentAdCount++;
      }
    }
  }

  ensureMinimumAdCount() {
    // If we don't have enough ads, add more
    while (this.currentAdCount < this.targetAdsPerPage) {
      const mainContent = document.querySelector('.main-content, .content, body');
      if (mainContent) {
        const adContainer = this.createAdContainer(`fallback-ad-${this.currentAdCount}`, 'rectangle');
        mainContent.appendChild(adContainer);
        this.currentAdCount++;
      } else {
        break; // Avoid infinite loop if no content area found
      }
    }
    
    console.log(`📢 Injected ${this.currentAdCount} strategic ad placements`);
  }

  createAdContainer(id, format) {
    const container = document.createElement('div');
    container.id = id;
    container.className = `ad-container ad-${format}`;
    container.setAttribute('data-ad-format', format);
    
    // Add styling for different ad formats
    const styles = {
      'leaderboard': 'width: 728px; height: 90px; margin: 10px auto;',
      'skyscraper': 'width: 160px; height: 600px; margin: 10px;',
      'rectangle': 'width: 336px; height: 280px; margin: 10px;',
      'medium-rectangle': 'width: 300px; height: 250px; margin: 10px;'
    };
    
    container.style.cssText = styles[format] || styles['rectangle'];
    
    // Add responsive behavior
    container.style.maxWidth = '100%';
    container.style.overflow = 'hidden';
    
    // Placeholder content when ads don't load
    container.innerHTML = `
      <div class="ad-placeholder" style="
        width: 100%; 
        height: 100%; 
        background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #666;
        border: 1px solid #ddd;
        border-radius: 4px;
      ">
        Advertisement
      </div>
    `;
    
    return container;
  }

  // Server-side ad serving for ad blocker detection
  initServerSideAds() {
    if (this.adBlockDetected) {
      this.loadServerSideAds();
      this.showAdBlockerMessage();
    }
  }

  loadServerSideAds() {
    console.log("📢 Loading server-side ads due to ad blocker detection");
    
    // Replace client-side ads with server-rendered alternatives
    document.querySelectorAll('.ad-container').forEach(container => {
      this.loadServerSideAd(container);
    });
  }

  loadServerSideAd(container) {
    // In a real implementation, this would fetch ads from your server
    fetch('/api/server-ads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format: container.getAttribute('data-ad-format'),
        placement: container.id
      })
    })
    .then(response => response.json())
    .then(ad => {
      if (ad && ad.content) {
        container.innerHTML = ad.content;
      }
    })
    .catch(() => {
      // Fallback to promotional content
      this.loadPromotionalContent(container);
    });
  }

  loadPromotionalContent(container) {
    // Show non-premium promotional content when external ads fail
    container.innerHTML = `
      <div class="promotional-content" style="
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 20px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <h3 style="margin: 0 0 10px 0; font-size: 18px;">🚀 Support SlowGuardian</h3>
        <p style="margin: 0 0 15px 0; font-size: 14px; opacity: 0.9;">
          Help us keep this service free and accessible
        </p>
        <button onclick="window.open('https://github.com/zgr2575/SlowGuardian', '_blank')" style="
          background: white;
          color: #4f46e5;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
        ">
          Learn More
        </button>
      </div>
    `;
  }

  showAdBlockerMessage() {
    // Create a polite ad blocker notification
    const notification = document.createElement('div');
    notification.className = 'adblocker-notification';
    notification.innerHTML = `
      <div class="adblocker-content">
        <h3>🛡️ Ad Blocker Detected</h3>
        <p>We noticed you're using an ad blocker. Please consider:</p>
        <div class="adblocker-options">
          <button onclick="this.parentElement.parentElement.parentElement.style.display='none'">
            Continue with ads blocked
          </button>
          <button onclick="window.adsManager.showUpgradeModal()">
            🌟 Get Ad-Free Premium
          </button>
        </div>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }
    }, 10000);
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

  // Add helpful console commands for AdSense management
  if (typeof window.console !== "undefined") {
    setTimeout(() => {
      console.log(`
🚀 SlowGuardian AdSense Management Console
==========================================

Available Commands:
- adsense.config()        → Show current configuration
- adsense.setup(id)       → Quick setup with Publisher ID
- adsense.admin()         → Open admin panel  
- adsense.metrics()       → View ad metrics
- adsense.revenue()       → View revenue report (admin)
- adsense.refresh()       → Refresh all ads
- adsense.test()          → Toggle test mode
- adsense.help()          → Show this help again

Example: adsense.setup('ca-pub-1234567890123456')
      `);
    }, 2000);
  }
});

// AdSense Console Helper
window.adsense = {
  config: () => {
    if (!window.adsManager) return console.error("Ads Manager not loaded");
    console.table(window.adsManager.adsenseConfig);
    return window.adsManager.adsenseConfig;
  },

  setup: (publisherId) => {
    if (!window.adsManager) return console.error("Ads Manager not loaded");
    if (!publisherId)
      return console.error(
        'Publisher ID required: adsense.setup("ca-pub-XXXXXXXXXXXXXXXX")'
      );

    const success = window.adsManager.setPublisherId(publisherId);
    if (success) {
      console.log("✅ Publisher ID configured successfully!");
      console.log("💡 Run adsense.admin() to configure ad slots");
    }
    return success;
  },

  admin: () => {
    if (!window.adsManager) return console.error("Ads Manager not loaded");
    window.adsManager.showAdminPanel();
    console.log("✅ Admin panel opened");
  },

  metrics: async () => {
    if (!window.adsManager) return console.error("Ads Manager not loaded");
    const metrics = await window.adsManager.getAdMetrics();
    console.table(metrics);
    return metrics;
  },

  revenue: async (period = "30d") => {
    if (!window.adsManager) return console.error("Ads Manager not loaded");
    const revenue = await window.adsManager.getRevenueReport(period);
    console.table(revenue);
    return revenue;
  },

  refresh: () => {
    if (!window.adsManager) return console.error("Ads Manager not loaded");
    window.adsManager.refreshAllAds();
    console.log("✅ All ads refreshed");
  },

  test: (enabled) => {
    if (!window.adsManager) return console.error("Ads Manager not loaded");
    if (typeof enabled === "undefined") {
      enabled = !window.adsManager.adsenseConfig.testMode;
    }
    const success = window.adsManager.toggleTestMode(enabled);
    if (success) {
      console.log(`✅ Test mode ${enabled ? "enabled" : "disabled"}`);
    }
    return success;
  },

  help: () => {
    console.log(`
🚀 SlowGuardian AdSense Management Console
==========================================

Configuration Commands:
  adsense.config()              - Show current AdSense configuration
  adsense.setup(publisherId)    - Quick setup with Publisher ID
  adsense.admin()               - Open visual admin panel

Analytics Commands:
  adsense.metrics()             - View current ad performance metrics
  adsense.revenue(period)       - View revenue report (30d, 7d, 1d)

Management Commands:
  adsense.refresh()             - Refresh all ads on page
  adsense.test(true/false)      - Toggle test mode on/off

Setup Example:
  1. adsense.setup('ca-pub-1234567890123456')
  2. adsense.admin()
  3. Configure slots in the admin panel
  4. adsense.metrics() to check performance

For detailed setup instructions, see: /docs/ADSENSE-SETUP.md
    `);
  },
};

// Export for modules
if (typeof module !== "undefined") {
  module.exports = AdsManager;
}
