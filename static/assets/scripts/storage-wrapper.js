/**
 * Storage wrapper that prioritizes cookies but falls back to localStorage
 * Provides a unified interface for both storage methods
 */

// Create a unified storage interface
window.storage = {
  setItem: function(key, value) {
    if (window.cookieStorage) {
      return window.cookieStorage.setItem(key, value);
    } else {
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('Storage error:', error);
        return false;
      }
    }
  },

  getItem: function(key, defaultValue = null) {
    if (window.cookieStorage) {
      return window.cookieStorage.getItem(key, defaultValue);
    } else {
      try {
        const value = localStorage.getItem(key);
        if (value === null) return defaultValue;
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      } catch (error) {
        console.error('Storage error:', error);
        return defaultValue;
      }
    }
  },

  removeItem: function(key) {
    if (window.cookieStorage) {
      return window.cookieStorage.removeItem(key);
    } else {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Storage error:', error);
        return false;
      }
    }
  },

  clear: function() {
    if (window.cookieStorage) {
      return window.cookieStorage.clear();
    } else {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.error('Storage error:', error);
        return false;
      }
    }
  }
};

// Backward compatibility: override localStorage methods for existing code
if (window.cookieStorage) {
  // Create a proxy for localStorage that uses cookies
  const originalLocalStorage = window.localStorage;
  
  window.localStorage = new Proxy(originalLocalStorage, {
    get: function(target, prop) {
      if (prop === 'setItem') {
        return function(key, value) {
          window.storage.setItem(key, value);
        };
      } else if (prop === 'getItem') {
        return function(key) {
          return window.storage.getItem(key);
        };
      } else if (prop === 'removeItem') {
        return function(key) {
          window.storage.removeItem(key);
        };
      } else if (prop === 'clear') {
        return function() {
          window.storage.clear();
        };
      } else {
        return target[prop];
      }
    }
  });
}