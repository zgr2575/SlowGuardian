/**
 * Utility functions for SlowGuardian v9
 */

// DOM utilities
export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);

export const createElement = (tag, attributes = {}, children = []) => {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else if (key.startsWith('on')) {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });
  
  return element;
};

// Event utilities
export const on = (element, event, handler) => {
  element.addEventListener(event, handler);
  return () => element.removeEventListener(event, handler);
};

export const once = (element, event, handler) => {
  element.addEventListener(event, handler, { once: true });
};

export const delegate = (parent, selector, event, handler) => {
  parent.addEventListener(event, (e) => {
    if (e.target.matches(selector)) {
      handler(e);
    }
  });
};

// Animation utilities
export const animate = (element, keyframes, options = {}) => {
  return element.animate(keyframes, {
    duration: 300,
    easing: 'ease-out',
    fill: 'forwards',
    ...options,
  });
};

export const fadeIn = (element, duration = 300) => {
  return animate(element, [
    { opacity: 0 },
    { opacity: 1 }
  ], { duration });
};

export const fadeOut = (element, duration = 300) => {
  return animate(element, [
    { opacity: 1 },
    { opacity: 0 }
  ], { duration });
};

export const slideUp = (element, duration = 300) => {
  return animate(element, [
    { transform: 'translateY(100%)', opacity: 0 },
    { transform: 'translateY(0)', opacity: 1 }
  ], { duration });
};

export const slideDown = (element, duration = 300) => {
  return animate(element, [
    { transform: 'translateY(-100%)', opacity: 0 },
    { transform: 'translateY(0)', opacity: 1 }
  ], { duration });
};

// Local storage utilities
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
};

// HTTP utilities
export const api = {
  get: async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  
  post: async (url, data) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  
  put: async (url, data) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  
  delete: async (url) => {
    const response = await fetch(url, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
};

// URL utilities
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

export const normalizeUrl = (input) => {
  input = input.trim();
  
  // If it looks like a search query, return it as-is for search handling
  if (!input.includes('.') || input.includes(' ')) {
    return input;
  }
  
  // Add protocol if missing
  if (!input.startsWith('http://') && !input.startsWith('https://')) {
    return `https://${input}`;
  }
  
  return input;
};

export const isSearchQuery = (input) => {
  return !input.includes('.') || input.includes(' ');
};

// Debounce utility
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle utility
export const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(null, args);
    }
  };
};

// Format utilities
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatTime = (seconds) => {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${remainingMinutes}m`;
  } else {
    const days = Math.floor(seconds / 86400);
    const remainingHours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${remainingHours}h`;
  }
};

// Theme utilities
export const theme = {
  current: () => document.documentElement.getAttribute('data-theme') || 'dark',
  
  set: (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
    storage.set('theme', themeName);
  },
  
  toggle: () => {
    const current = theme.current();
    const next = current === 'dark' ? 'light' : 'dark';
    theme.set(next);
    return next;
  },
  
  init: () => {
    const saved = storage.get('theme');
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    theme.set(saved || preferred);
  }
};

// Device utilities
export const device = {
  isMobile: () => window.innerWidth <= 768,
  isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
  isDesktop: () => window.innerWidth > 1024,
  
  hasTouch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  
  isOnline: () => navigator.onLine,
  
  getBattery: async () => {
    if ('getBattery' in navigator) {
      return await navigator.getBattery();
    }
    return null;
  },
  
  getConnection: () => {
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  }
};

// Random utilities
export const random = {
  int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  float: (min, max) => Math.random() * (max - min) + min,
  choice: (array) => array[Math.floor(Math.random() * array.length)],
  uuid: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  })
};

// Error handling
export const handleError = (error, context = 'Unknown') => {
  console.error(`[${context}] Error:`, error);
  
  // Show user-friendly error message
  showNotification('Something went wrong. Please try again.', 'error');
};

// Notification system
export const showNotification = (message, type = 'info', duration = 5000) => {
  const notification = createElement('div', {
    className: `alert alert-${type} animate-slide-down`,
    innerHTML: `
      <div class="alert-icon">${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</div>
      <div class="alert-content">${message}</div>
    `
  });
  
  // Add to notifications container or create one
  let container = $('#notifications');
  if (!container) {
    container = createElement('div', {
      id: 'notifications',
      style: 'position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;'
    });
    document.body.appendChild(container);
  }
  
  container.appendChild(notification);
  
  // Auto remove
  setTimeout(() => {
    if (notification.parentNode) {
      fadeOut(notification).then(() => {
        notification.remove();
      });
    }
  }, duration);
  
  return notification;
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard!', 'success');
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = createElement('textarea', { value: text });
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      showNotification('Copied to clipboard!', 'success');
      return true;
    } catch {
      showNotification('Failed to copy to clipboard', 'error');
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};