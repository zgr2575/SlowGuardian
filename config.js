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

  // Developer Mode Settings - ADMIN CONFIGURATION
  developerMode: {
    enabled: true, // Enable developer/admin features
    defaultAdminCredentials: {
      username: 'admin',
      password: 'SlowGuardian2024!' // CHANGE THIS IN PRODUCTION!
    },
    features: {
      userTracking: true, // Track online users and sessions
      siteBlocking: true, // Enable per-user website blocking
      globalPause: true, // Enable global site pausing
      adminPanel: true // Enable admin control panel
    }
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

  // Development Settings
  debug: process.env.NODE_ENV !== "production",
  logLevel: process.env.LOG_LEVEL || "info",
};

export default config;
