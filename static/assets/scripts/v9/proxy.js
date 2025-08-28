/**
 * Proxy handling for SlowGuardian v9
 */

import { $, normalizeUrl, isSearchQuery, showNotification } from "./utils.js";

class ProxyManager {
  constructor() {
    this.currentFrame = null;
    this.config = {
      searchEngine: "https://www.google.com/search?q=",
      encodeUrl: true,
      bypassHeaders: true,
    };
  }

  async handleRequest(input, useBlankPopup = false) {
    if (!input || !input.trim()) {
      showNotification("Please enter a URL or search term", "warning");
      return;
    }

    const normalizedInput = normalizeUrl(input.trim());

    try {
      if (isSearchQuery(normalizedInput)) {
        await this.handleSearch(normalizedInput, useBlankPopup);
      } else {
        await this.handleUrl(normalizedInput, useBlankPopup);
      }
    } catch (error) {
      console.error("Proxy request failed:", error);
      showNotification("Failed to load the requested page", "error");
    }
  }

  async handleSearch(query, useBlankPopup = false) {
    const searchUrl = this.config.searchEngine + encodeURIComponent(query);
    await this.handleUrl(searchUrl, useBlankPopup);
  }

  async handleUrl(url, useBlankPopup = false) {
    showNotification("Loading...", "info", 2000);

    // Ensure URL has protocol
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    try {
      // Wait for UV config to be loaded if it's not ready
      await this.waitForUVConfig();

      if (typeof __uv$config !== "undefined") {
        // Store the encoded URL in sessionStorage for the browser page
        const encodedUrl = __uv$config.encodeUrl(url);
        sessionStorage.setItem("GoUrl", encodedUrl);
        
        // Check about:blank setting
        const abEnabled = localStorage.getItem("ab") === "true" || useBlankPopup;
        
        if (abEnabled) {
          // Open in about:blank popup
          this.openBlankPopup(encodedUrl);
        } else {
          // Check if dynamic proxy should be used
          const dy = localStorage.getItem("dy");
          
          if (dy === "true") {
            window.location.href = "/a/q/" + encodedUrl;
          } else {
            // For SPA navigation, we need to open the actual go.html file
            // since the browser page is a separate complex interface
            window.location.href = "/go";
          }
        }
      } else {
        // Fallback without Ultraviolet
        sessionStorage.setItem("GoUrl", url);
        if (useBlankPopup || localStorage.getItem("ab") === "true") {
          this.openBlankPopup(url);
        } else {
          window.location.href = "/go";
        }
      }
    } catch (error) {
      console.error("Failed to handle URL:", error);
      showNotification("Failed to load the requested page", "error");
    }
  }

  openBlankPopup(url) {
    const popup = window.open("about:blank", "_blank");
    if (popup) {
      popup.document.title = "My Drive - Google Drive";
      popup.document.write(
        '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        '<title>My Drive - Google Drive</title>' +
        '<link rel="icon" href="https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png">' +
        '<meta charset="UTF-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '</head>' +
        '<body style="margin:0;padding:0;overflow:hidden;">' +
        '<script>' +
        'sessionStorage.setItem("GoUrl", ' + JSON.stringify(url) + ');' +
        'window.location.href = ' + JSON.stringify(window.location.origin + '/go') + ';' +
        '</script>' +
        '</body>' +
        '</html>'
      );
    } else {
      showNotification("Popup blocked. Please allow popups for this site.", "warning");
      // Fallback to direct navigation
      window.location.href = "/go";
    }
  }

  async waitForUVConfig(maxWait = 5000) {
    return new Promise((resolve, reject) => {
      if (typeof __uv$config !== "undefined") {
        resolve();
        return;
      }

      const startTime = Date.now();
      const checkConfig = () => {
        if (typeof __uv$config !== "undefined") {
          resolve();
        } else if (Date.now() - startTime > maxWait) {
          console.warn("UV config not loaded within timeout, proceeding anyway");
          resolve();
        } else {
          setTimeout(checkConfig, 100);
        }
      };

      checkConfig();
    });
  }

  async getProxyUrl(url) {
    // Integrate with the Ultraviolet proxy system
    if (typeof __uv$config !== "undefined") {
      const uvConfig = __uv$config;
      return uvConfig.prefix + uvConfig.encodeUrl(url);
    }

    // Fallback to simple proxy path
    return `/o/${encodeURIComponent(url)}`;
  }

  async checkUrlStatus(url) {
    try {
      // Check if URL is accessible (simplified check)
      const response = await fetch(
        `/api/check-url?url=${encodeURIComponent(url)}`
      );
      return response.ok;
    } catch {
      return true; // Assume accessible if check fails
    }
  }

  // Tab cloaking functionality
  enableTabCloaking(title = "Google", favicon = "/favicon-google.ico") {
    document.title = title;

    const faviconLink =
      document.querySelector('link[rel="shortcut icon"]') ||
      document.querySelector('link[rel="icon"]');

    if (faviconLink) {
      faviconLink.href = favicon;
    } else {
      const newFavicon = document.createElement("link");
      newFavicon.rel = "shortcut icon";
      newFavicon.href = favicon;
      document.head.appendChild(newFavicon);
    }
  }

  disableTabCloaking() {
    document.title = "SlowGuardian v9";

    const faviconLink =
      document.querySelector('link[rel="shortcut icon"]') ||
      document.querySelector('link[rel="icon"]');

    if (faviconLink) {
      faviconLink.href = "/favicon.png";
    }
  }

  // About:blank cloaking
  enableAboutBlankCloaking() {
    const popup = window.open("about:blank", "_blank");

    if (popup) {
      popup.document.write(
        '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        '<title>SlowGuardian</title>' +
        '<link rel="icon" href="/favicon.png">' +
        '<style>' +
        'body { margin: 0; padding: 0; overflow: hidden; }' +
        'iframe { width: 100vw; height: 100vh; border: none; }' +
        '</style>' +
        '</head>' +
        '<body>' +
        '<iframe src="' + window.location.href + '"></iframe>' +
        '</body>' +
        '</html>'
      );

      // Close current window
      window.close();
    }
  }

  // History management
  clearHistory() {
    if (confirm("Are you sure you want to clear your browsing history?")) {
      // Clear session storage
      sessionStorage.clear();

      // Clear local storage (proxy-related only)
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("proxy_") || key.startsWith("sg_")) {
          localStorage.removeItem(key);
        }
      });

      showNotification("Browsing history cleared", "success");
    }
  }

  // Bookmark management
  saveBookmark(url, title) {
    const bookmarks = JSON.parse(localStorage.getItem("sg_bookmarks") || "[]");

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

    localStorage.setItem("sg_bookmarks", JSON.stringify(bookmarks));
    showNotification("Bookmark saved", "success");
  }

  getBookmarks() {
    return JSON.parse(localStorage.getItem("sg_bookmarks") || "[]");
  }

  removeBookmark(id) {
    const bookmarks = this.getBookmarks();
    const filtered = bookmarks.filter((bookmark) => bookmark.id !== id);
    localStorage.setItem("sg_bookmarks", JSON.stringify(filtered));
    showNotification("Bookmark removed", "success");
  }
}

// URL suggestions system
class SuggestionSystem {
  constructor() {
    this.history = this.loadHistory();
    this.popularSites = [
      { name: "Google", url: "https://google.com" },
      { name: "YouTube", url: "https://youtube.com" },
      { name: "Discord", url: "https://discord.com" },
      { name: "GitHub", url: "https://github.com" },
      { name: "Reddit", url: "https://reddit.com" },
      { name: "Twitter", url: "https://twitter.com" },
      { name: "Instagram", url: "https://instagram.com" },
      { name: "Facebook", url: "https://facebook.com" },
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
      .filter(
        (item) =>
          item.url.toLowerCase().includes(lowercaseInput) ||
          item.title.toLowerCase().includes(lowercaseInput)
      )
      .slice(0, 3)
      .forEach((item) => {
        suggestions.push({
          type: "history",
          title: item.title,
          url: item.url,
          icon: "🕒",
        });
      });

    // Add popular site matches
    this.popularSites
      .filter(
        (site) =>
          site.name.toLowerCase().includes(lowercaseInput) ||
          site.url.toLowerCase().includes(lowercaseInput)
      )
      .slice(0, 3)
      .forEach((site) => {
        if (!suggestions.find((s) => s.url === site.url)) {
          suggestions.push({
            type: "popular",
            title: site.name,
            url: site.url,
            icon: "⭐",
          });
        }
      });

    // Add search suggestion
    if (isSearchQuery(input)) {
      suggestions.unshift({
        type: "search",
        title: `Search for "${input}"`,
        url: input,
        icon: "🔍",
      });
    }

    return suggestions.slice(0, 5);
  }

  addToHistory(url, title) {
    const historyItem = {
      url,
      title: title || url,
      timestamp: Date.now(),
      visits: 1,
    };

    // Remove existing entry for this URL
    this.history = this.history.filter((item) => item.url !== url);

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
      return JSON.parse(localStorage.getItem("sg_history") || "[]");
    } catch {
      return [];
    }
  }

  saveHistory() {
    try {
      localStorage.setItem("sg_history", JSON.stringify(this.history));
    } catch (error) {
      console.error("Failed to save history:", error);
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
  const input = $("#url-input");
  const suggestionsContainer = $("#suggestions");

  if (!input || !suggestionsContainer) return;

  let currentSuggestions = [];

  const showSuggestions = (suggestions) => {
    currentSuggestions = suggestions;

    if (suggestions.length === 0) {
      suggestionsContainer.style.display = "none";
      return;
    }

    suggestionsContainer.innerHTML = suggestions
      .map(
        (suggestion, index) => `
        <div class="suggestion-item" data-index="${index}">
          <span class="suggestion-icon">${suggestion.icon}</span>
          <span class="suggestion-title">${suggestion.title}</span>
        </div>
      `
      )
      .join("");

    suggestionsContainer.style.display = "block";
  };

  const hideSuggestions = () => {
    suggestionsContainer.style.display = "none";
    currentSuggestions = [];
  };

  let selectedIndex = -1;

  input.addEventListener("input", (e) => {
    const value = e.target.value.trim();
    selectedIndex = -1;

    if (value.length < 2) {
      hideSuggestions();
      return;
    }

    const suggestions = suggestionSystem.getSuggestions(value);
    showSuggestions(suggestions);
  });

  input.addEventListener("keydown", (e) => {
    if (currentSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = Math.min(
        selectedIndex + 1,
        currentSuggestions.length - 1
      );
      updateSelection();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateSelection();
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const suggestion = currentSuggestions[selectedIndex];
      handleSuggestionSelect(suggestion);
    } else if (e.key === "Escape") {
      hideSuggestions();
    }
  });

  const updateSelection = () => {
    const items = suggestionsContainer.querySelectorAll(".suggestion-item");
    items.forEach((item, index) => {
      item.classList.toggle("selected", index === selectedIndex);
    });

    if (selectedIndex >= 0) {
      const suggestion = currentSuggestions[selectedIndex];
      input.value =
        suggestion.type === "search" ? suggestion.url : suggestion.url;
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    input.value = suggestion.url;
    hideSuggestions();
    proxyManager.handleRequest(suggestion.url);
  };

  // Handle clicks on suggestions
  suggestionsContainer.addEventListener("click", (e) => {
    const item = e.target.closest(".suggestion-item");
    if (item) {
      const index = parseInt(item.dataset.index);
      const suggestion = currentSuggestions[index];
      handleSuggestionSelect(suggestion);
    }
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
      hideSuggestions();
    }
  });
};

// Export main functions
export const setupProxyFeatures = () => {
  setupSuggestions();

  // Setup keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Ctrl+Shift+X: About:blank cloaking
    if (e.ctrlKey && e.shiftKey && e.key === "X") {
      e.preventDefault();
      proxyManager.enableAboutBlankCloaking();
    }

    // Ctrl+Shift+H: Clear history
    if (e.ctrlKey && e.shiftKey && e.key === "H") {
      e.preventDefault();
      proxyManager.clearHistory();
    }
  });
};

// Legacy compatibility functions for apps and games
window.processUrl = function(value, path) {
  let url = value.trim();
  const engine = localStorage.getItem("engine");
  const searchUrl = engine ? engine : "https://www.google.com/search?q=";

  if (!isUrl(url)) {
    url = searchUrl + url;
  } else if (!(url.startsWith("https://") || url.startsWith("http://"))) {
    url = "https://" + url;
  }

  if (typeof __uv$config !== "undefined") {
    sessionStorage.setItem("GoUrl", __uv$config.encodeUrl(url));
    const dy = localStorage.getItem("dy");

    if (path) {
      location.href = path;
    } else if (dy === "true") {
      window.location.href = "/a/q/" + __uv$config.encodeUrl(url);
    } else {
      window.location.href = "/a/" + __uv$config.encodeUrl(url);
    }
  }
};

window.go = function(value) {
  processUrl(value, "/p");
};

window.blank = function(value) {
  processUrl(value);
};

window.dy = function(value) {
  if (typeof __uv$config !== "undefined") {
    processUrl(value, "/a/q/" + __uv$config.encodeUrl(value));
  }
};

window.now = function(value) {
  // Handle now.gg links
  processUrl(value);
};

window.isUrl = function(val = "") {
  if (
    /^http(s?):\/\//.test(val) ||
    (val.includes(".") && val.substr(0, 1) !== " ")
  )
    return true;
  return false;
};

export { proxyManager, suggestionSystem };

// Export the main proxy request handler for compatibility
export function handleProxyRequest(url, useBlankPopup = false) {
  return proxyManager.handleRequest(url, useBlankPopup);
}
