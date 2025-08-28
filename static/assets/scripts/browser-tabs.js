/**
 * Browser Tabs System
 * Multi-tab browsing with session management
 */

class BrowserTabs {
  constructor() {
    this.tabs = new Map();
    this.activeTabId = null;
    this.nextTabId = 1;
    this.loadingTips = [
      "💡 Tip: Use Ctrl+T to open a new tab quickly",
      "🔍 Tip: Press Ctrl+L to focus the address bar",
      "⚡ Tip: Ctrl+W closes the current tab",
      "🔄 Tip: F5 refreshes the current page",
      "📋 Tip: Right-click tabs for more options",
      "🌟 Tip: Drag tabs to reorder them",
      "🔗 Tip: Middle-click links to open in new tab"
    ];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.loadSavedSession();
    this.updateUI();
  }

  setupEventListeners() {
    // Tab controls
    document.getElementById('new-tab-btn')?.addEventListener('click', () => this.createNewTab());
    document.getElementById('new-tab-quick-btn')?.addEventListener('click', () => this.createNewTab());
    document.getElementById('close-all-tabs-btn')?.addEventListener('click', () => this.closeAllTabs());
    document.getElementById('duplicate-tab-btn')?.addEventListener('click', () => this.duplicateCurrentTab());

    // Session management
    document.getElementById('save-session-btn')?.addEventListener('click', () => this.showSaveSessionModal());
    document.getElementById('restore-session-btn')?.addEventListener('click', () => this.showRestoreSessionModal());

    // Browser controls
    document.getElementById('back-btn')?.addEventListener('click', () => this.goBack());
    document.getElementById('forward-btn')?.addEventListener('click', () => this.goForward());
    document.getElementById('refresh-btn')?.addEventListener('click', () => this.refreshCurrentTab());
    document.getElementById('home-btn')?.addEventListener('click', () => this.goHome());

    // Address bar
    const addressForm = document.getElementById('address-form');
    if (addressForm) {
      addressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.navigateToURL();
      });
    }

    // Page controls
    document.getElementById('bookmark-btn')?.addEventListener('click', () => this.bookmarkCurrentPage());
    document.getElementById('share-btn')?.addEventListener('click', () => this.shareCurrentPage());
    document.getElementById('menu-btn')?.addEventListener('click', () => this.showPageMenu());

    // Context menu
    this.setupContextMenu();

    // Auto-save session
    setInterval(() => this.autoSaveSession(), 30000); // Every 30 seconds
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 't':
            e.preventDefault();
            this.createNewTab();
            break;
          case 'w':
            e.preventDefault();
            if (this.activeTabId) {
              this.closeTab(this.activeTabId);
            }
            break;
          case 'Tab':
            e.preventDefault();
            this.switchToNextTab(e.shiftKey ? -1 : 1);
            break;
          case 'l':
            e.preventDefault();
            document.getElementById('address-bar')?.focus();
            break;
          case 'r':
            e.preventDefault();
            this.refreshCurrentTab();
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            e.preventDefault();
            const tabIndex = parseInt(e.key) - 1;
            const tabs = Array.from(this.tabs.keys());
            if (tabs[tabIndex]) {
              this.switchToTab(tabs[tabIndex]);
            }
            break;
        }
      }

      if (e.key === 'F5') {
        e.preventDefault();
        this.refreshCurrentTab();
      }
    });
  }

  createNewTab(url = '', title = 'New Tab') {
    const tabId = `tab-${this.nextTabId++}`;
    
    const tab = {
      id: tabId,
      title: title,
      url: url,
      favicon: '🌐',
      loading: false,
      history: [],
      historyIndex: -1,
      created: Date.now()
    };

    this.tabs.set(tabId, tab);
    this.activeTabId = tabId;
    
    this.renderTabBar();
    this.renderTabContent();
    this.updateUI();
    this.updateAddressBar();

    if (url) {
      this.navigateTab(tabId, url);
    }

    return tabId;
  }

  closeTab(tabId) {
    if (!this.tabs.has(tabId)) return;

    // Add closing animation
    const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tabElement) {
      tabElement.classList.add('closing');
      setTimeout(() => {
        this.tabs.delete(tabId);
        
        // Switch to another tab if this was active
        if (this.activeTabId === tabId) {
          const remainingTabs = Array.from(this.tabs.keys());
          this.activeTabId = remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1] : null;
        }
        
        this.renderTabBar();
        this.renderTabContent();
        this.updateUI();
        this.updateAddressBar();
      }, 300);
    } else {
      this.tabs.delete(tabId);
      if (this.activeTabId === tabId) {
        const remainingTabs = Array.from(this.tabs.keys());
        this.activeTabId = remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1] : null;
      }
      this.renderTabBar();
      this.renderTabContent();
      this.updateUI();
    }
  }

  closeAllTabs() {
    if (confirm('Close all tabs?')) {
      this.tabs.clear();
      this.activeTabId = null;
      this.renderTabBar();
      this.renderTabContent();
      this.updateUI();
    }
  }

  duplicateCurrentTab() {
    if (!this.activeTabId) return;
    
    const currentTab = this.tabs.get(this.activeTabId);
    if (currentTab) {
      this.createNewTab(currentTab.url, currentTab.title);
    }
  }

  switchToTab(tabId) {
    if (!this.tabs.has(tabId)) return;
    
    this.activeTabId = tabId;
    this.renderTabBar();
    this.renderTabContent();
    this.updateAddressBar();
    this.updateNavigationButtons();
  }

  switchToNextTab(direction = 1) {
    const tabs = Array.from(this.tabs.keys());
    if (tabs.length === 0) return;

    const currentIndex = tabs.indexOf(this.activeTabId);
    let nextIndex = currentIndex + direction;
    
    if (nextIndex >= tabs.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = tabs.length - 1;
    
    this.switchToTab(tabs[nextIndex]);
  }

  navigateToURL() {
    const addressBar = document.getElementById('address-bar');
    const url = addressBar?.value.trim();
    
    if (!url || !this.activeTabId) return;

    this.navigateTab(this.activeTabId, url);
  }

  navigateTab(tabId, url) {
    const tab = this.tabs.get(tabId);
    if (!tab) return;

    // Process URL
    let processedUrl = this.processURL(url);
    
    // Update tab
    tab.loading = true;
    tab.url = processedUrl;
    
    // Add to history
    if (tab.historyIndex < tab.history.length - 1) {
      tab.history = tab.history.slice(0, tab.historyIndex + 1);
    }
    tab.history.push(processedUrl);
    tab.historyIndex = tab.history.length - 1;

    // Update UI
    if (tabId === this.activeTabId) {
      this.updateAddressBar();
      this.showLoadingScreen();
    }
    
    this.renderTabBar();

    // Load content
    this.loadTabContent(tabId, processedUrl);
  }

  processURL(input) {
    // Check if it's already a URL
    if (input.startsWith('http://') || input.startsWith('https://')) {
      return input;
    }
    
    // Check if it looks like a domain
    if (input.includes('.') && !input.includes(' ')) {
      return `https://${input}`;
    }
    
    // Otherwise, treat as search
    const searchEngine = localStorage.getItem('search-engine') || 'https://www.google.com/search?q=';
    return searchEngine + encodeURIComponent(input);
  }

  loadTabContent(tabId, url) {
    const tab = this.tabs.get(tabId);
    if (!tab) return;

    // Show loading steps
    if (tabId === this.activeTabId) {
      this.showLoadingSteps();
    }

    // Use proxy to load content
    if (window.__uv$config) {
      const encodedUrl = __uv$config.encodeUrl(url);
      const proxyUrl = `/a/${encodedUrl}`;
      
      // Update tab with encoded URL for iframe
      tab.proxyUrl = proxyUrl;
      tab.originalUrl = url;
      
      // Extract title from URL
      tab.title = this.extractTitleFromUrl(url);
      
      // Simulate loading completion
      setTimeout(() => {
        tab.loading = false;
        
        if (tabId === this.activeTabId) {
          this.hideLoadingScreen();
          this.renderTabContent();
        }
        
        this.renderTabBar();
      }, 2000);
    } else {
      console.error('Proxy not available');
      tab.loading = false;
      this.renderTabBar();
    }
  }

  extractTitleFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace('www.', '');
      return hostname.charAt(0).toUpperCase() + hostname.slice(1);
    } catch {
      return url.substring(0, 20) + (url.length > 20 ? '...' : '');
    }
  }

  showLoadingScreen() {
    const loadingScreen = document.getElementById('browser-loading');
    const frameContainer = document.getElementById('browser-frame-container');
    
    if (loadingScreen) loadingScreen.style.display = 'flex';
    if (frameContainer) frameContainer.style.display = 'none';
    
    // Show random tip
    const tipElement = document.getElementById('loading-tip');
    if (tipElement) {
      const randomTip = this.loadingTips[Math.floor(Math.random() * this.loadingTips.length)];
      tipElement.textContent = randomTip;
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('browser-loading');
    const frameContainer = document.getElementById('browser-frame-container');
    
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (frameContainer) frameContainer.style.display = 'block';
  }

  showLoadingSteps() {
    const steps = ['step-1', 'step-2', 'step-3', 'step-4'];
    
    steps.forEach((stepId, index) => {
      setTimeout(() => {
        const step = document.getElementById(stepId);
        if (step) {
          step.classList.add('active');
          
          // Mark previous steps as completed
          steps.slice(0, index).forEach(prevStepId => {
            const prevStep = document.getElementById(prevStepId);
            if (prevStep) {
              prevStep.classList.remove('active');
              prevStep.classList.add('completed');
            }
          });
        }
      }, index * 500);
    });
  }

  renderTabBar() {
    const tabList = document.getElementById('tab-list');
    if (!tabList) return;

    tabList.innerHTML = '';

    this.tabs.forEach((tab, tabId) => {
      const tabElement = document.createElement('div');
      tabElement.className = `browser-tab ${tabId === this.activeTabId ? 'active' : ''}`;
      tabElement.dataset.tabId = tabId;
      
      tabElement.innerHTML = `
        <span class="tab-favicon">${tab.favicon}</span>
        <span class="tab-title">${tab.title}</span>
        <button class="tab-close" aria-label="Close tab">✖</button>
      `;

      // Add loading indicator
      if (tab.loading) {
        tabElement.classList.add('loading');
      }

      // Tab click to switch
      tabElement.addEventListener('click', (e) => {
        if (!e.target.classList.contains('tab-close')) {
          this.switchToTab(tabId);
        }
      });

      // Close button
      const closeBtn = tabElement.querySelector('.tab-close');
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeTab(tabId);
      });

      // Context menu
      tabElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showTabContextMenu(e, tabId);
      });

      tabList.appendChild(tabElement);
    });
  }

  renderTabContent() {
    const frameContainer = document.getElementById('browser-frame-container');
    if (!frameContainer) return;

    // Clear existing frames
    frameContainer.innerHTML = '';

    if (!this.activeTabId) return;

    const activeTab = this.tabs.get(this.activeTabId);
    if (!activeTab || !activeTab.proxyUrl) return;

    // Create iframe for active tab
    const iframe = document.createElement('iframe');
    iframe.className = 'browser-frame active';
    iframe.src = activeTab.proxyUrl;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    
    frameContainer.appendChild(iframe);
  }

  updateUI() {
    const hasAnyTabs = this.tabs.size > 0;
    const noTabsState = document.getElementById('no-tabs-state');
    const tabContentArea = document.getElementById('tab-content-area');

    if (noTabsState) {
      noTabsState.style.display = hasAnyTabs ? 'none' : 'flex';
    }
    
    if (tabContentArea) {
      tabContentArea.style.display = hasAnyTabs ? 'flex' : 'none';
    }

    this.updateNavigationButtons();
  }

  updateAddressBar() {
    const addressBar = document.getElementById('address-bar');
    if (!addressBar || !this.activeTabId) return;

    const activeTab = this.tabs.get(this.activeTabId);
    if (activeTab && activeTab.originalUrl) {
      addressBar.value = activeTab.originalUrl;
    } else {
      addressBar.value = '';
    }
  }

  updateNavigationButtons() {
    const backBtn = document.getElementById('back-btn');
    const forwardBtn = document.getElementById('forward-btn');
    
    if (!this.activeTabId) {
      if (backBtn) backBtn.disabled = true;
      if (forwardBtn) forwardBtn.disabled = true;
      return;
    }

    const activeTab = this.tabs.get(this.activeTabId);
    if (activeTab) {
      if (backBtn) backBtn.disabled = activeTab.historyIndex <= 0;
      if (forwardBtn) forwardBtn.disabled = activeTab.historyIndex >= activeTab.history.length - 1;
    }
  }

  goBack() {
    if (!this.activeTabId) return;
    
    const tab = this.tabs.get(this.activeTabId);
    if (tab && tab.historyIndex > 0) {
      tab.historyIndex--;
      const url = tab.history[tab.historyIndex];
      this.loadTabContent(this.activeTabId, url);
    }
  }

  goForward() {
    if (!this.activeTabId) return;
    
    const tab = this.tabs.get(this.activeTabId);
    if (tab && tab.historyIndex < tab.history.length - 1) {
      tab.historyIndex++;
      const url = tab.history[tab.historyIndex];
      this.loadTabContent(this.activeTabId, url);
    }
  }

  refreshCurrentTab() {
    if (!this.activeTabId) return;
    
    const tab = this.tabs.get(this.activeTabId);
    if (tab && tab.url) {
      this.loadTabContent(this.activeTabId, tab.url);
    }
  }

  goHome() {
    if (this.activeTabId) {
      this.navigateTab(this.activeTabId, window.location.origin);
    }
  }

  setupContextMenu() {
    const contextMenu = document.getElementById('tab-context-menu');
    if (!contextMenu) return;

    // Hide context menu on click outside
    document.addEventListener('click', () => {
      contextMenu.style.display = 'none';
    });

    // Handle context menu actions
    contextMenu.addEventListener('click', (e) => {
      const action = e.target.closest('.context-item')?.dataset.action;
      if (!action) return;

      const tabId = contextMenu.dataset.tabId;
      
      switch (action) {
        case 'refresh':
          this.loadTabContent(tabId, this.tabs.get(tabId)?.url);
          break;
        case 'duplicate':
          const tab = this.tabs.get(tabId);
          if (tab) this.createNewTab(tab.url, tab.title);
          break;
        case 'bookmark':
          this.bookmarkTab(tabId);
          break;
        case 'close':
          this.closeTab(tabId);
          break;
        case 'close-others':
          this.closeOtherTabs(tabId);
          break;
      }
      
      contextMenu.style.display = 'none';
    });
  }

  showTabContextMenu(event, tabId) {
    const contextMenu = document.getElementById('tab-context-menu');
    if (!contextMenu) return;

    contextMenu.dataset.tabId = tabId;
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.top = `${event.pageY}px`;
  }

  closeOtherTabs(keepTabId) {
    const tabsToClose = Array.from(this.tabs.keys()).filter(id => id !== keepTabId);
    tabsToClose.forEach(tabId => this.closeTab(tabId));
  }

  bookmarkCurrentPage() {
    if (!this.activeTabId) return;
    
    const tab = this.tabs.get(this.activeTabId);
    if (tab) {
      this.bookmarkTab(this.activeTabId);
    }
  }

  bookmarkTab(tabId) {
    const tab = this.tabs.get(tabId);
    if (!tab) return;

    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const bookmark = {
      title: tab.title,
      url: tab.originalUrl || tab.url,
      favicon: tab.favicon,
      created: Date.now()
    };

    bookmarks.push(bookmark);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    
    this.showNotification('Page bookmarked!', 'success');
  }

  shareCurrentPage() {
    if (!this.activeTabId) return;
    
    const tab = this.tabs.get(this.activeTabId);
    if (tab && tab.originalUrl) {
      if (navigator.share) {
        navigator.share({
          title: tab.title,
          url: tab.originalUrl
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(tab.originalUrl).then(() => {
          this.showNotification('URL copied to clipboard!', 'success');
        });
      }
    }
  }

  showPageMenu() {
    // Implement page menu
    this.showNotification('Page menu - Coming soon!', 'info');
  }

  autoSaveSession() {
    if (this.tabs.size === 0) return;

    const session = {
      tabs: Array.from(this.tabs.entries()).map(([id, tab]) => ({
        id,
        title: tab.title,
        url: tab.originalUrl || tab.url,
        active: id === this.activeTabId
      })),
      saved: Date.now()
    };

    localStorage.setItem('current-session', JSON.stringify(session));
  }

  loadSavedSession() {
    const savedSession = localStorage.getItem('current-session');
    if (!savedSession) return;

    try {
      const session = JSON.parse(savedSession);
      
      // Don't restore if saved more than 24 hours ago
      if (Date.now() - session.saved > 86400000) return;

      session.tabs.forEach(tabData => {
        const tabId = this.createNewTab(tabData.url, tabData.title);
        if (tabData.active) {
          this.switchToTab(tabId);
        }
      });
    } catch (e) {
      console.error('Failed to restore session:', e);
    }
  }

  showSaveSessionModal() {
    // Implement save session modal
    const sessionName = prompt('Enter session name:');
    if (sessionName) {
      this.saveSession(sessionName);
    }
  }

  saveSession(name) {
    const sessions = JSON.parse(localStorage.getItem('saved-sessions') || '{}');
    
    const session = {
      name,
      tabs: Array.from(this.tabs.entries()).map(([id, tab]) => ({
        title: tab.title,
        url: tab.originalUrl || tab.url
      })),
      saved: Date.now()
    };

    sessions[name] = session;
    localStorage.setItem('saved-sessions', JSON.stringify(sessions));
    
    this.showNotification(`Session "${name}" saved!`, 'success');
  }

  showRestoreSessionModal() {
    const sessions = JSON.parse(localStorage.getItem('saved-sessions') || '{}');
    const sessionNames = Object.keys(sessions);
    
    if (sessionNames.length === 0) {
      this.showNotification('No saved sessions found', 'info');
      return;
    }

    // Simple prompt for now (can be enhanced with modal)
    const sessionName = prompt(`Choose session to restore:\n${sessionNames.join('\n')}`);
    if (sessionName && sessions[sessionName]) {
      this.restoreSession(sessions[sessionName]);
    }
  }

  restoreSession(session) {
    // Close current tabs
    this.tabs.clear();
    this.activeTabId = null;

    // Restore session tabs
    session.tabs.forEach((tabData, index) => {
      const tabId = this.createNewTab(tabData.url, tabData.title);
      if (index === 0) {
        this.switchToTab(tabId);
      }
    });

    this.showNotification(`Session "${session.name}" restored!`, 'success');
  }

  showNotification(message, type = 'info') {
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}

// Initialize browser tabs system
const browserTabs = new BrowserTabs();

// Export for global access
window.browserTabs = browserTabs;