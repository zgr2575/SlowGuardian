/**
 * Stealth Configuration for SlowGuardian Proxies
 * Makes proxy usage harder to detect and more resilient
 */

// Generate random identifiers to avoid detection
const generateRandomId = () => Math.random().toString(36).substring(2, 15);
const generateRandomPrefix = () =>
  "/" + Math.random().toString(36).substring(2, 8) + "/";

// Stealth configuration
const stealthConfig = {
  // Randomized paths to avoid detection patterns
  uvPrefix: generateRandomPrefix(),
  dyPrefix: generateRandomPrefix(),

  // Custom codecs to avoid standard XOR detection
  customCodec: {
    encode: (str) => {
      // Custom encoding that's harder to detect than XOR
      return btoa(encodeURIComponent(str))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    },
    decode: (str) => {
      // Reverse the custom encoding
      str = str.replace(/-/g, "+").replace(/_/g, "/");
      while (str.length % 4) str += "=";
      return decodeURIComponent(atob(str));
    },
  },

  // Stealth headers
  headers: {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.5",
    "accept-encoding": "gzip, deflate, br",
    dnt: "1",
    connection: "keep-alive",
    "upgrade-insecure-requests": "1",
  },

  // Random file names
  serviceWorkerName: "sw-" + generateRandomId() + ".js",
  handlerName: "handler-" + generateRandomId() + ".js",
  bundleName: "bundle-" + generateRandomId() + ".js",

  // Stealth mode settings
  hideConsoleErrors: true,
  obfuscateSourceMaps: true,
  customErrorPages: true,
  randomizeTimings: true,
};

// Enhanced Ultraviolet config with stealth features
self.__uv$config = {
  prefix: stealthConfig.uvPrefix,
  encodeUrl: stealthConfig.customCodec.encode,
  decodeUrl: stealthConfig.customCodec.decode,
  handler: stealthConfig.uvPrefix + stealthConfig.handlerName,
  client: stealthConfig.uvPrefix + "client.js",
  bundle: stealthConfig.uvPrefix + stealthConfig.bundleName,
  config: stealthConfig.uvPrefix + "config.js",
  sw: stealthConfig.uvPrefix + stealthConfig.serviceWorkerName,
  bare: {
    version: 2,
    path: "/o/",
  },
  // Additional stealth options
  stealth: {
    enabled: true,
    hideErrors: stealthConfig.hideConsoleErrors,
    customHeaders: stealthConfig.headers,
    randomizeUserAgent: true,
  },
};

// Enhanced Dynamic config with stealth features
self.__dynamic$config = {
  prefix: stealthConfig.dyPrefix,
  encoding: "base64", // More stealth than XOR
  mode: "production",
  logLevel: 0, // Suppress all logging
  bare: {
    version: 2,
    path: "/o/",
  },
  tab: {
    title: "New Tab",
    icon: "/favicon.ico",
    ua: stealthConfig.headers["user-agent"],
  },
  assets: {
    prefix: stealthConfig.dyPrefix,
    files: {
      handler: stealthConfig.handlerName,
      client: "client.js",
      worker: "worker.js",
      config: "config.js",
      inject: null,
    },
  },
  stealth: {
    enabled: true,
    hideConsoleOutput: true,
    customErrorPages: stealthConfig.customErrorPages,
    obfuscateJs: stealthConfig.obfuscateSourceMaps,
  },
  block: [],
};

// Export for use in other modules
if (typeof module !== "undefined") {
  module.exports = {
    stealthConfig,
    __uv$config: self.__uv$config,
    __dynamic$config: self.__dynamic$config,
  };
}

console.log("🔒 Stealth proxy configuration loaded");
