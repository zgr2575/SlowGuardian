const config = {
  // Server Configuration
  version: 9, // SlowGuardian v9
  port: process.env.PORT || 8080,

  // Security Settings - DEVELOPER CONFIGURATION
  // Set challenge to true and configure users below to enable KEY authentication
  challenge: false, // Set to true to enable password protection
  users: {
    // Add users in format username: 'password'
    // Example: admin: 'securepassword123',
    // Example: developer: 'mypassword',
  },
  envusers: false, // Environment-based user management (deprecated)

  // KeyAuth API Configuration - NEW AUTHENTICATION SYSTEM
  keyauth: {
    enabled: false, // Set to true to enable KeyAuth authentication
    name: process.env.KEYAUTH_NAME || "SlowGuardian", // Your KeyAuth application name
    ownerId: process.env.KEYAUTH_OWNER_ID || "", // Your KeyAuth owner ID
    secret: process.env.KEYAUTH_SECRET || "", // Your KeyAuth application secret
    version: "1.0", // Your application version in KeyAuth
    requireLicense: false, // Set to true if users need license keys
    allowRegistration: true, // Allow new user registrations
    sessionTimeout: 24 * 60 * 60 * 1000, // Session timeout in milliseconds (24 hours)
  },

  // Developer Mode Settings - ADMIN CONFIGURATION
  developerMode: {
    enabled: true, // Enable developer/admin features
    defaultAdminCredentials: {
      username: "admin",
      password: "SlowGuardian2025!", // CHANGE THIS IN PRODUCTION!
    },
    features: {
      userTracking: true, // Track online users and sessions
      siteBlocking: true, // Enable per-user website blocking
      globalPause: true, // Enable global site pausing
      adminPanel: true, // Enable admin control panel
    },
  },

  // Feature Flags
  routes: true, // Enable frontend routes (set false for bare server only)
  local: true, // Enable local asset serving
  plugins: true, // Enable plugin system

  // Proxy Configuration
  bare: {
    path: "/o/",
    version: 3,
  },

  // Google AdSense Configuration
  adsense: {
    enabled: true, // Enable Google AdSense
    publisherId: process.env.GOOGLE_ADSENSE_PUBLISHER_ID || "", // ca-pub-XXXXXXXXXXXXXXXX
    autoAds: true, // Enable Auto Ads
    slots: {
      // Display Ad Slots - Configure these in AdSense dashboard
      header: process.env.ADSENSE_SLOT_HEADER || "", // Header banner slot
      sidebar: process.env.ADSENSE_SLOT_SIDEBAR || "", // Sidebar slots
      footer: process.env.ADSENSE_SLOT_FOOTER || "", // Footer banner slot
      content: process.env.ADSENSE_SLOT_CONTENT || "", // In-content slots
      mobile: process.env.ADSENSE_SLOT_MOBILE || "", // Mobile-optimized slots
      video: process.env.ADSENSE_SLOT_VIDEO || "", // Video ad slots
    },
    settings: {
      enableLazyLoading: true, // Enable lazy loading for better performance
      enableResponsive: true, // Enable responsive ads
      enablePageLevel: true, // Enable page-level ads
      testMode: process.env.NODE_ENV !== "production", // Enable test mode in development
    },
    tracking: {
      enableAnalytics: true, // Track ad performance
      customEvents: true, // Custom event tracking
      revenueTracking: true, // Revenue tracking
    },
  },

  // Development Settings
  debug: process.env.NODE_ENV !== "production",
  logLevel: process.env.LOG_LEVEL || "info",
};

export default config;
