/**
 * Cookie-based storage system for SlowGuardian v9
 * Provides better persistence across sessions than localStorage
 */

class CookieStorage {
  constructor() {
    this.prefix = "sg_";
    this.defaultExpireDays = 365; // 1 year
  }

  /**
   * Set a cookie value
   * @param {string} key - The key to store
   * @param {any} value - The value to store (will be JSON.stringify'd)
   * @param {number} days - Days until expiration (default: 365)
   */
  setItem(key, value, days = this.defaultExpireDays) {
    try {
      const expireDate = new Date();
      expireDate.setTime(expireDate.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = "expires=" + expireDate.toUTCString();

      const cookieValue =
        typeof value === "string" ? value : JSON.stringify(value);
      document.cookie = `${this.prefix}${key}=${encodeURIComponent(cookieValue)};${expires};path=/;SameSite=Lax`;

      // Also set in localStorage as backup
      try {
        localStorage.setItem(key, cookieValue);
      } catch (e) {
        console.warn("localStorage not available, using cookies only");
      }

      return true;
    } catch (error) {
      console.error("Error setting cookie:", error);
      return false;
    }
  }

  /**
   * Get a cookie value
   * @param {string} key - The key to retrieve
   * @param {any} defaultValue - Default value if not found
   * @returns {any} The stored value or default
   */
  getItem(key, defaultValue = null) {
    try {
      // First try cookies
      const cookieKey = this.prefix + key;
      const cookies = document.cookie.split(";");

      for (let cookie of cookies) {
        let [cookieName, cookieValue] = cookie.split("=");
        cookieName = cookieName.trim();

        if (cookieName === cookieKey) {
          try {
            const decodedValue = decodeURIComponent(cookieValue);
            // Try to parse as JSON, fall back to string
            try {
              return JSON.parse(decodedValue);
            } catch {
              return decodedValue;
            }
          } catch (error) {
            console.warn("Error parsing cookie value:", error);
          }
        }
      }

      // Fallback to localStorage
      try {
        const localValue = localStorage.getItem(key);
        if (localValue !== null) {
          // Migrate to cookies
          this.setItem(key, localValue);
          try {
            return JSON.parse(localValue);
          } catch {
            return localValue;
          }
        }
      } catch (e) {
        console.warn("localStorage not available");
      }

      return defaultValue;
    } catch (error) {
      console.error("Error getting cookie:", error);
      return defaultValue;
    }
  }

  /**
   * Remove a cookie
   * @param {string} key - The key to remove
   */
  removeItem(key) {
    try {
      // Remove from cookies
      document.cookie = `${this.prefix}${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;

      // Remove from localStorage backup
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn("localStorage not available");
      }

      return true;
    } catch (error) {
      console.error("Error removing cookie:", error);
      return false;
    }
  }

  /**
   * Clear all SlowGuardian cookies
   */
  clear() {
    try {
      const cookies = document.cookie.split(";");

      for (let cookie of cookies) {
        const cookieName = cookie.split("=")[0].trim();
        if (cookieName.startsWith(this.prefix)) {
          const key = cookieName.substring(this.prefix.length);
          this.removeItem(key);
        }
      }

      // Also clear localStorage
      try {
        Object.keys(localStorage).forEach((key) => {
          if (this.shouldManageKey(key)) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn("localStorage not available");
      }

      return true;
    } catch (error) {
      console.error("Error clearing cookies:", error);
      return false;
    }
  }

  /**
   * Check if we should manage this key
   * @param {string} key - The key to check
   * @returns {boolean} True if we should manage this key
   */
  shouldManageKey(key) {
    const managedKeys = [
      "theme",
      "ab",
      "selectedOption",
      "CustomName",
      "CustomIcon",
      "engine",
      "dy",
      "Particles",
      "ad",
      "Gcustom",
      "Gpinned",
      "screenshotProtection",
      "onboardingComplete",
    ];
    return managedKeys.includes(key);
  }

  /**
   * Migrate all localStorage data to cookies
   */
  migrate() {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (this.shouldManageKey(key)) {
          const value = localStorage.getItem(key);
          if (value !== null) {
            this.setItem(key, value);
          }
        }
      });
      console.log("Successfully migrated localStorage to cookies");
    } catch (error) {
      console.error("Error migrating to cookies:", error);
    }
  }

  /**
   * Get all stored settings as an object
   * @returns {object} All settings
   */
  getAllSettings() {
    const settings = {};
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split("=");
      const trimmedName = cookieName.trim();

      if (trimmedName.startsWith(this.prefix)) {
        const key = trimmedName.substring(this.prefix.length);
        settings[key] = this.getItem(key);
      }
    }

    return settings;
  }

  /**
   * Import settings from an object
   * @param {object} settings - Settings to import
   */
  importSettings(settings) {
    try {
      Object.entries(settings).forEach(([key, value]) => {
        if (this.shouldManageKey(key)) {
          this.setItem(key, value);
        }
      });
      return true;
    } catch (error) {
      console.error("Error importing settings:", error);
      return false;
    }
  }
}

// Create global instance
window.cookieStorage = new CookieStorage();

// Auto-migrate on first load
document.addEventListener("DOMContentLoaded", function () {
  // Only migrate if we haven't done it before
  if (!window.cookieStorage.getItem("migrated")) {
    window.cookieStorage.migrate();
    window.cookieStorage.setItem("migrated", true);
  }
});

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = CookieStorage;
}
