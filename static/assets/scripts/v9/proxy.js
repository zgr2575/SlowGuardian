/**
 * Proxy handling for SlowGuardian v9
 */

import { $, normalizeUrl, isSearchQuery, showNotification } from './utils.js';

class ProxyManager {
  constructor() {
    this.currentFrame = null;
    this.config = {
      searchEngine: 'https://www.google.com/search?q=',
      encodeUrl: true,
      bypassHeaders: true,
    };
  }
  
  async handleRequest(input) {
    if (!input || !input.trim()) {
      showNotification('Please enter a URL or search term', 'warning');
      return;
    }
    
    const normalizedInput = normalizeUrl(input.trim());
    
    try {
      if (isSearchQuery(normalizedInput)) {
        await this.handleSearch(normalizedInput);
      } else {
        await this.handleUrl(normalizedInput);
      }
    } catch (error) {
      console.error('Proxy request failed:', error);
      showNotification('Failed to load the requested page', 'error');
    }
  }
  
  async handleSearch(query) {
    const searchUrl = this.config.searchEngine + encodeURIComponent(query);
    await this.handleUrl(searchUrl);
  }
  
  async handleUrl(url) {
    showNotification('Loading...', 'info', 2000);
    
    // Use Ultraviolet proxy
    const proxyUrl = await this.getProxyUrl(url);
    
    // Navigate to proxy page with the encoded URL
    window.location.href = `/p#${encodeURIComponent(proxyUrl)}`;
  }
  
  async getProxyUrl(url) {
    // This would integrate with the Ultraviolet proxy system
    // For now, return a placeholder that works with the existing system
    
    if (typeof __uv$config !== 'undefined') {
      // Use Ultraviolet if available
      const uvConfig = __uv$config;
      return uvConfig.prefix + uvConfig.encodeUrl(url);
    }
    
    // Fallback to simple proxy path
    return `/o/${encodeURIComponent(url)}`;
  }
  
  async checkUrlStatus(url) {
    try {
      // Check if URL is accessible (simplified check)
      const response = await fetch(`/api/check-url?url=${encodeURIComponent(url)}`);
      return response.ok;
    } catch {
      return true; // Assume accessible if check fails
    }
  }
  
  // Tab cloaking functionality
  enableTabCloaking(title = 'Google', favicon = '/favicon-google.ico') {
    document.title = title;
    
    const faviconLink = document.querySelector('link[rel="shortcut icon"]') || 
                       document.querySelector('link[rel="icon"]');
    
    if (faviconLink) {
      faviconLink.href = favicon;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'shortcut icon';
      newFavicon.href = favicon;
      document.head.appendChild(newFavicon);
    }
  }
  
  disableTabCloaking() {
    document.title = 'SlowGuardian v9';
    
    const faviconLink = document.querySelector('link[rel="shortcut icon"]') || 
                       document.querySelector('link[rel="icon"]');
    
    if (faviconLink) {
      faviconLink.href = '/favicon.png';
    }
  }
  
  // About:blank cloaking
  enableAboutBlankCloaking() {
    const popup = window.open('about:blank', '_blank');
    
    if (popup) {
      popup.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>SlowGuardian</title>
          <link rel="icon" href="/favicon.png">
          <style>
            body { margin: 0; padding: 0; overflow: hidden; }
            iframe { width: 100vw; height: 100vh; border: none; }
          </style>
        </head>
        <body>
          <iframe src="${window.location.href}"></iframe>
        </body>
        </html>
      `);
      
      // Close current window
      window.close();
    }
  }
  
  // History management
  clearHistory() {
    if (confirm('Are you sure you want to clear your browsing history?')) {
      // Clear session storage
      sessionStorage.clear();
      
      // Clear local storage (proxy-related only)
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('proxy_') || key.startsWith('sg_')) {
          localStorage.removeItem(key);
        }
      });
      
      showNotification('Browsing history cleared', 'success');
    }
  }
  
  // Bookmark management
  saveBookmark(url, title) {
    const bookmarks = JSON.parse(localStorage.getItem('sg_bookmarks') || '[]');
    
    const bookmark = {
      id: Date.now(),
      url,
      title,
      created: new Date().toISOString(),
    };
    
    bookmarks.unshift(bookmark);
    
    // Keep only the latest 50 bookmarks
    if (bookmarks.length > 50) {
      bookmarks.splice(50);
    }
    
    localStorage.setItem('sg_bookmarks', JSON.stringify(bookmarks));
    showNotification('Bookmark saved', 'success');
  }
  
  getBookmarks() {
    return JSON.parse(localStorage.getItem('sg_bookmarks') || '[]');
  }
  
  removeBookmark(id) {
    const bookmarks = this.getBookmarks();
    const filtered = bookmarks.filter(bookmark => bookmark.id !== id);
    localStorage.setItem('sg_bookmarks', JSON.stringify(filtered));
    showNotification('Bookmark removed', 'success');
  }
}

// URL suggestions system
class SuggestionSystem {
  constructor() {
    this.history = this.loadHistory();
    this.popularSites = [
      { name: 'Google', url: 'https://google.com' },
      { name: 'YouTube', url: 'https://youtube.com' },
      { name: 'Discord', url: 'https://discord.com' },
      { name: 'GitHub', url: 'https://github.com' },
      { name: 'Reddit', url: 'https://reddit.com' },
      { name: 'Twitter', url: 'https://twitter.com' },
      { name: 'Instagram', url: 'https://instagram.com' },
      { name: 'Facebook', url: 'https://facebook.com' },
    ];
  }
  
  getSuggestions(input) {
    if (!input || input.length < 2) {
      return [];
    }
    
    const suggestions = [];
    const lowercaseInput = input.toLowerCase();
    
    // Add history matches
    this.history
      .filter(item => 
        item.url.toLowerCase().includes(lowercaseInput) ||
        item.title.toLowerCase().includes(lowercaseInput)
      )
      .slice(0, 3)
      .forEach(item => {
        suggestions.push({
          type: 'history',
          title: item.title,
          url: item.url,
          icon: '🕒'
        });
      });
    
    // Add popular site matches
    this.popularSites
      .filter(site => 
        site.name.toLowerCase().includes(lowercaseInput) ||
        site.url.toLowerCase().includes(lowercaseInput)
      )
      .slice(0, 3)
      .forEach(site => {
        if (!suggestions.find(s => s.url === site.url)) {
          suggestions.push({
            type: 'popular',
            title: site.name,
            url: site.url,
            icon: '⭐'
          });
        }
      });
    
    // Add search suggestion
    if (isSearchQuery(input)) {
      suggestions.unshift({
        type: 'search',
        title: `Search for "${input}"`,
        url: input,
        icon: '🔍'
      });
    }
    
    return suggestions.slice(0, 5);
  }
  
  addToHistory(url, title) {
    const historyItem = {
      url,
      title: title || url,
      timestamp: Date.now(),
      visits: 1
    };
    
    // Remove existing entry for this URL
    this.history = this.history.filter(item => item.url !== url);
    
    // Add to beginning
    this.history.unshift(historyItem);
    
    // Keep only latest 100 items
    if (this.history.length > 100) {
      this.history.splice(100);
    }
    
    this.saveHistory();
  }
  
  loadHistory() {
    try {
      return JSON.parse(localStorage.getItem('sg_history') || '[]');
    } catch {
      return [];
    }
  }
  
  saveHistory() {
    try {
      localStorage.setItem('sg_history', JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }
  
  clearHistory() {
    this.history = [];
    this.saveHistory();
  }
}

// Initialize proxy manager and suggestion system
const proxyManager = new ProxyManager();
const suggestionSystem = new SuggestionSystem();

// Setup suggestions for search input
const setupSuggestions = () => {
  const input = $('#url-input');
  const suggestionsContainer = $('#suggestions');
  
  if (!input || !suggestionsContainer) return;
  
  let currentSuggestions = [];
  
  const showSuggestions = (suggestions) => {
    currentSuggestions = suggestions;
    
    if (suggestions.length === 0) {
      suggestionsContainer.style.display = 'none';
      return;
    }
    
    suggestionsContainer.innerHTML = suggestions
      .map((suggestion, index) => `
        <div class="suggestion-item" data-index="${index}">
          <span class="suggestion-icon">${suggestion.icon}</span>
          <span class="suggestion-title">${suggestion.title}</span>
        </div>
      `)
      .join('');
    
    suggestionsContainer.style.display = 'block';
  };
  
  const hideSuggestions = () => {
    suggestionsContainer.style.display = 'none';
    currentSuggestions = [];
  };
  
  let selectedIndex = -1;
  
  input.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    selectedIndex = -1;
    
    if (value.length < 2) {
      hideSuggestions();
      return;
    }
    
    const suggestions = suggestionSystem.getSuggestions(value);
    showSuggestions(suggestions);
  });
  
  input.addEventListener('keydown', (e) => {
    if (currentSuggestions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, currentSuggestions.length - 1);
      updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateSelection();
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const suggestion = currentSuggestions[selectedIndex];
      handleSuggestionSelect(suggestion);
    } else if (e.key === 'Escape') {
      hideSuggestions();
    }
  });
  
  const updateSelection = () => {
    const items = suggestionsContainer.querySelectorAll('.suggestion-item');
    items.forEach((item, index) => {
      item.classList.toggle('selected', index === selectedIndex);
    });
    
    if (selectedIndex >= 0) {
      const suggestion = currentSuggestions[selectedIndex];
      input.value = suggestion.type === 'search' ? suggestion.url : suggestion.url;
    }
  };
  
  const handleSuggestionSelect = (suggestion) => {
    input.value = suggestion.url;
    hideSuggestions();
    proxyManager.handleRequest(suggestion.url);
  };
  
  // Handle clicks on suggestions
  suggestionsContainer.addEventListener('click', (e) => {
    const item = e.target.closest('.suggestion-item');
    if (item) {
      const index = parseInt(item.dataset.index);
      const suggestion = currentSuggestions[index];
      handleSuggestionSelect(suggestion);
    }
  });
  
  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
      hideSuggestions();
    }
  });
};

// Export main functions
export const handleProxyRequest = (input) => proxyManager.handleRequest(input);
export const setupProxyFeatures = () => {
  setupSuggestions();
  
  // Setup keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+X: About:blank cloaking
    if (e.ctrlKey && e.shiftKey && e.key === 'X') {
      e.preventDefault();
      proxyManager.enableAboutBlankCloaking();
    }
    
    // Ctrl+Shift+H: Clear history
    if (e.ctrlKey && e.shiftKey && e.key === 'H') {
      e.preventDefault();
      proxyManager.clearHistory();
    }
  });
};

export { proxyManager, suggestionSystem };