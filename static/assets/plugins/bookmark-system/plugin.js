/**
 * Bookmark System Plugin for SlowGuardian v9
 * Advanced bookmark management with categories and search
 */

class BookmarkSystemPlugin {
  constructor() {
    this.name = "Bookmark Manager";
    this.version = "1.0.0";
    this.bookmarks = JSON.parse(
      getCookie("user-bookmarks") ||
        localStorage.getItem("user-bookmarks") ||
        "[]"
    );
    this.categories = JSON.parse(
      getCookie("bookmark-categories") ||
        localStorage.getItem("bookmark-categories") ||
        '["General", "Work", "Entertainment", "Social"]'
    );
    this.isOpen = false;
    this.bookmarkPanel = null;
  }

  init() {
    console.log("🔖 Bookmark System Plugin initialized");
    this.createBookmarkPanel();
    this.registerHooks();
    this.addBookmarkButton();
  }

  enable() {
    console.log("🔖 Bookmark System Plugin enabled");
    if (this.bookmarkPanel) {
      this.bookmarkPanel.style.display = "block";
    }
  }

  disable() {
    console.log("🔖 Bookmark System Plugin disabled");
    if (this.bookmarkPanel) {
      this.bookmarkPanel.style.display = "none";
    }
    this.isOpen = false;
  }

  registerHooks() {
    if (window.pluginSystem) {
      window.pluginSystem.addHook(
        "page_load",
        (data) => {
          this.onPageLoad(data);
        },
        "bookmark-system"
      );

      window.pluginSystem.addHook(
        "proxy_request",
        (data) => {
          this.onProxyRequest(data);
        },
        "bookmark-system"
      );
    }
  }

  onPageLoad(data) {
    // Update bookmark button state if current page is bookmarked
    this.updateBookmarkButton();
  }

  onProxyRequest(data) {
    // Track visited URLs for bookmark suggestions
    this.trackVisit(data.url);
  }

  createBookmarkPanel() {
    const style = document.createElement("style");
    style.textContent = `
      .bookmark-panel {
        position: fixed;
        left: -350px;
        top: 20%;
        width: 330px;
        height: 500px;
        background: rgba(26, 26, 46, 0.98);
        backdrop-filter: blur(15px);
        border: 1px solid var(--border-primary);
        border-radius: 0 12px 12px 0;
        z-index: 9998;
        transition: left 0.3s ease;
        box-shadow: 4px 0 12px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
      }
      
      .bookmark-panel.open {
        left: 0;
      }
      
      .bookmark-header {
        padding: 15px;
        border-bottom: 1px solid var(--border-secondary);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .bookmark-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .bookmark-tabs {
        display: flex;
        border-bottom: 1px solid var(--border-secondary);
      }
      
      .bookmark-tab {
        flex: 1;
        padding: 10px 12px;
        cursor: pointer;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        font-size: 12px;
        text-align: center;
      }
      
      .bookmark-tab.active {
        background: var(--accent-primary);
        color: white;
      }
      
      .bookmark-search {
        padding: 10px;
        border-bottom: 1px solid var(--border-secondary);
      }
      
      .bookmark-search input {
        width: 100%;
        background: var(--bg-tertiary);
        border: 1px solid var(--border-secondary);
        color: var(--text-primary);
        padding: 8px;
        border-radius: 6px;
        font-size: 12px;
      }
      
      .bookmark-list {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
      }
      
      .bookmark-category {
        margin-bottom: 15px;
      }
      
      .category-header {
        font-weight: bold;
        color: var(--text-primary);
        font-size: 12px;
        margin-bottom: 8px;
        padding: 5px 0;
        border-bottom: 1px solid var(--border-secondary);
      }
      
      .bookmark-item {
        background: var(--bg-tertiary);
        border: 1px solid var(--border-secondary);
        border-radius: 6px;
        padding: 8px;
        margin-bottom: 6px;
        cursor: pointer;
        font-size: 11px;
        transition: all 0.2s ease;
      }
      
      .bookmark-item:hover {
        border-color: var(--accent-primary);
        background: rgba(233, 69, 96, 0.1);
      }
      
      .bookmark-title {
        font-weight: bold;
        color: var(--text-primary);
        margin-bottom: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .bookmark-url {
        color: var(--text-secondary);
        font-size: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .bookmark-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 4px;
        font-size: 9px;
        color: var(--text-tertiary);
      }
      
      .bookmark-actions {
        padding: 10px;
        border-top: 1px solid var(--border-secondary);
        display: flex;
        gap: 5px;
      }
      
      .bookmark-toggle {
        position: absolute;
        right: -30px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(26, 26, 46, 0.95);
        border: 1px solid var(--border-primary);
        border-left: none;
        border-radius: 0 6px 6px 0;
        padding: 6px 4px;
        cursor: pointer;
        color: var(--text-primary);
        font-size: 14px;
      }
      
      .bookmark-form {
        padding: 10px;
        background: var(--bg-secondary);
        border-radius: 8px;
        margin: 10px;
        border: 1px solid var(--border-secondary);
      }
      
      .form-group {
        margin-bottom: 10px;
      }
      
      .form-group label {
        display: block;
        font-size: 11px;
        color: var(--text-secondary);
        margin-bottom: 4px;
      }
      
      .form-group input, .form-group select {
        width: 100%;
        background: var(--bg-tertiary);
        border: 1px solid var(--border-secondary);
        color: var(--text-primary);
        padding: 6px;
        border-radius: 4px;
        font-size: 11px;
      }
    `;
    document.head.appendChild(style);

    this.bookmarkPanel = document.createElement("div");
    this.bookmarkPanel.className = "bookmark-panel";
    this.bookmarkPanel.innerHTML = `
      <div class="bookmark-toggle" onclick="window.bookmarkSystem.toggle()">🔖</div>
      
      <div class="bookmark-header">
        <h4 style="margin: 0; color: var(--text-primary);">🔖 Bookmarks</h4>
        <button onclick="window.bookmarkSystem.toggle()" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 16px;">&times;</button>
      </div>
      
      <div class="bookmark-content">
        <div class="bookmark-tabs">
          <button class="bookmark-tab active" onclick="window.bookmarkSystem.showTab('list')">All</button>
          <button class="bookmark-tab" onclick="window.bookmarkSystem.showTab('add')">Add</button>
          <button class="bookmark-tab" onclick="window.bookmarkSystem.showTab('manage')">Manage</button>
        </div>
        
        <div class="bookmark-search" id="bookmark-search">
          <input type="text" placeholder="Search bookmarks..." onkeyup="window.bookmarkSystem.searchBookmarks(this.value)">
        </div>
        
        <div class="bookmark-list" id="bookmark-list">
          <!-- Bookmarks will be loaded here -->
        </div>
        
        <div class="bookmark-form" id="bookmark-form" style="display: none;">
          <div class="form-group">
            <label>Title:</label>
            <input type="text" id="bookmark-title" placeholder="Bookmark title">
          </div>
          <div class="form-group">
            <label>URL:</label>
            <input type="text" id="bookmark-url" placeholder="https://example.com">
          </div>
          <div class="form-group">
            <label>Category:</label>
            <select id="bookmark-category">
              ${this.categories.map((cat) => `<option value="${cat}">${cat}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Description:</label>
            <input type="text" id="bookmark-description" placeholder="Optional description">
          </div>
        </div>
        
        <div class="bookmark-manage" id="bookmark-manage" style="display: none;">
          <div style="padding: 10px;">
            <h5 style="margin: 0 0 10px 0; color: var(--text-primary);">Categories</h5>
            <div id="category-list">
              <!-- Categories will be loaded here -->
            </div>
            <div style="margin-top: 10px;">
              <input type="text" id="new-category" placeholder="New category name" style="width: 70%; margin-right: 5px;">
              <button class="btn btn-sm btn-primary" onclick="window.bookmarkSystem.addCategory()" style="width: 25%;">Add</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bookmark-actions">
        <button class="btn btn-sm btn-primary" onclick="window.bookmarkSystem.saveBookmark()" id="save-bookmark-btn">Save</button>
        <button class="btn btn-sm btn-secondary" onclick="window.bookmarkSystem.importBookmarks()">Import</button>
        <button class="btn btn-sm btn-secondary" onclick="window.bookmarkSystem.exportBookmarks()">Export</button>
      </div>
    `;

    document.body.appendChild(this.bookmarkPanel);

    this.loadBookmarks();
    this.currentTab = "list";
  }

  addBookmarkButton() {
    // Add quick bookmark button to current page
    const quickBookmark = document.createElement("button");
    quickBookmark.id = "quick-bookmark-btn";
    quickBookmark.innerHTML = "⭐";
    quickBookmark.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: rgba(26, 26, 46, 0.9);
      border: 1px solid var(--border-primary);
      color: var(--text-primary);
      padding: 8px;
      border-radius: 50%;
      cursor: pointer;
      z-index: 9997;
      font-size: 16px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    `;

    quickBookmark.onclick = () => this.quickBookmark();
    quickBookmark.onmouseenter = () => {
      quickBookmark.style.transform = "scale(1.1)";
      quickBookmark.style.background = "var(--accent-primary)";
    };
    quickBookmark.onmouseleave = () => {
      quickBookmark.style.transform = "scale(1)";
      quickBookmark.style.background = "rgba(26, 26, 46, 0.9)";
    };

    document.body.appendChild(quickBookmark);
    this.updateBookmarkButton();
  }

  updateBookmarkButton() {
    const btn = document.getElementById("quick-bookmark-btn");
    if (btn) {
      const currentUrl = window.location.href;
      const isBookmarked = this.bookmarks.some(
        (bookmark) => bookmark.url === currentUrl
      );
      btn.innerHTML = isBookmarked ? "🌟" : "⭐";
      btn.title = isBookmarked ? "Remove bookmark" : "Add bookmark";
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.bookmarkPanel.classList.toggle("open", this.isOpen);

    if (this.isOpen) {
      this.loadBookmarks();
    }
  }

  showTab(tabName) {
    // Update tab buttons
    const tabs = this.bookmarkPanel.querySelectorAll(".bookmark-tab");
    tabs.forEach((tab) => tab.classList.remove("active"));

    let activeIndex = 0;
    switch (tabName) {
      case "list":
        activeIndex = 0;
        break;
      case "add":
        activeIndex = 1;
        break;
      case "manage":
        activeIndex = 2;
        break;
    }
    tabs[activeIndex].classList.add("active");

    // Show appropriate content
    const searchDiv = this.bookmarkPanel.querySelector("#bookmark-search");
    const listDiv = this.bookmarkPanel.querySelector("#bookmark-list");
    const formDiv = this.bookmarkPanel.querySelector("#bookmark-form");
    const manageDiv = this.bookmarkPanel.querySelector("#bookmark-manage");
    const saveBtn = this.bookmarkPanel.querySelector("#save-bookmark-btn");

    // Hide all first
    [searchDiv, listDiv, formDiv, manageDiv].forEach((div) => {
      if (div) div.style.display = "none";
    });

    // Show based on tab
    switch (tabName) {
      case "list":
        searchDiv.style.display = "block";
        listDiv.style.display = "block";
        saveBtn.style.display = "none";
        break;
      case "add":
        formDiv.style.display = "block";
        saveBtn.style.display = "inline-block";
        this.prefillForm();
        break;
      case "manage":
        manageDiv.style.display = "block";
        saveBtn.style.display = "none";
        this.loadCategories();
        break;
    }

    this.currentTab = tabName;
  }

  loadBookmarks() {
    const bookmarkList = this.bookmarkPanel.querySelector("#bookmark-list");

    if (this.bookmarks.length === 0) {
      bookmarkList.innerHTML = `
        <div class="empty-state" style="text-align: center; color: var(--text-secondary); padding: 20px;">
          No bookmarks yet. Click "Add" to create your first bookmark.
        </div>
      `;
      return;
    }

    // Group by category
    const grouped = this.groupByCategory();

    bookmarkList.innerHTML = Object.entries(grouped)
      .map(
        ([category, bookmarks]) => `
      <div class="bookmark-category">
        <div class="category-header">${category} (${bookmarks.length})</div>
        ${bookmarks
          .map(
            (bookmark, index) => `
          <div class="bookmark-item" onclick="window.bookmarkSystem.openBookmark('${bookmark.url}')">
            <div class="bookmark-title">${bookmark.title}</div>
            <div class="bookmark-url">${bookmark.url}</div>
            <div class="bookmark-meta">
              <span>${this.formatDate(bookmark.date)}</span>
              <span>
                <button onclick="event.stopPropagation(); window.bookmarkSystem.editBookmark(${bookmark.id})" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;">✏️</button>
                <button onclick="event.stopPropagation(); window.bookmarkSystem.deleteBookmark(${bookmark.id})" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;">🗑️</button>
              </span>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `
      )
      .join("");
  }

  groupByCategory() {
    const grouped = {};
    this.bookmarks.forEach((bookmark) => {
      const category = bookmark.category || "General";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(bookmark);
    });
    return grouped;
  }

  searchBookmarks(query) {
    if (!query.trim()) {
      this.loadBookmarks();
      return;
    }

    const filtered = this.bookmarks.filter(
      (bookmark) =>
        bookmark.title.toLowerCase().includes(query.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(query.toLowerCase()) ||
        (bookmark.description &&
          bookmark.description.toLowerCase().includes(query.toLowerCase()))
    );

    const bookmarkList = this.bookmarkPanel.querySelector("#bookmark-list");

    if (filtered.length === 0) {
      bookmarkList.innerHTML = `
        <div class="empty-state" style="text-align: center; color: var(--text-secondary); padding: 20px;">
          No bookmarks found for "${query}"
        </div>
      `;
      return;
    }

    bookmarkList.innerHTML = `
      <div class="bookmark-category">
        <div class="category-header">Search Results (${filtered.length})</div>
        ${filtered
          .map(
            (bookmark) => `
          <div class="bookmark-item" onclick="window.bookmarkSystem.openBookmark('${bookmark.url}')">
            <div class="bookmark-title">${bookmark.title}</div>
            <div class="bookmark-url">${bookmark.url}</div>
            <div class="bookmark-meta">
              <span>${bookmark.category || "General"}</span>
              <span>
                <button onclick="event.stopPropagation(); window.bookmarkSystem.editBookmark(${bookmark.id})" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;">✏️</button>
                <button onclick="event.stopPropagation(); window.bookmarkSystem.deleteBookmark(${bookmark.id})" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;">🗑️</button>
              </span>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  prefillForm() {
    // Prefill with current page info
    const titleInput = this.bookmarkPanel.querySelector("#bookmark-title");
    const urlInput = this.bookmarkPanel.querySelector("#bookmark-url");

    if (titleInput && urlInput) {
      titleInput.value = document.title || "";
      urlInput.value = window.location.href || "";
    }
  }

  quickBookmark() {
    const currentUrl = window.location.href;
    const existingBookmark = this.bookmarks.find(
      (bookmark) => bookmark.url === currentUrl
    );

    if (existingBookmark) {
      // Remove bookmark
      this.deleteBookmark(existingBookmark.id);
    } else {
      // Add bookmark
      const bookmark = {
        id: Date.now(),
        title: document.title || "Untitled",
        url: currentUrl,
        category: "General",
        description: "",
        date: new Date().toISOString(),
      };

      this.bookmarks.unshift(bookmark);
      this.saveBookmarks();
      this.updateBookmarkButton();

      if (window.showNotification) {
        window.showNotification("Bookmark added!", "success");
      }
    }
  }

  saveBookmark() {
    const title = this.bookmarkPanel
      .querySelector("#bookmark-title")
      .value.trim();
    const url = this.bookmarkPanel.querySelector("#bookmark-url").value.trim();
    const category =
      this.bookmarkPanel.querySelector("#bookmark-category").value;
    const description = this.bookmarkPanel
      .querySelector("#bookmark-description")
      .value.trim();

    if (!title || !url) {
      if (window.showNotification) {
        window.showNotification("Title and URL are required", "error");
      }
      return;
    }

    const bookmark = {
      id: Date.now(),
      title,
      url,
      category,
      description,
      date: new Date().toISOString(),
    };

    this.bookmarks.unshift(bookmark);
    this.saveBookmarks();
    this.loadBookmarks();
    this.showTab("list");

    // Clear form
    this.bookmarkPanel.querySelector("#bookmark-title").value = "";
    this.bookmarkPanel.querySelector("#bookmark-url").value = "";
    this.bookmarkPanel.querySelector("#bookmark-description").value = "";

    if (window.showNotification) {
      window.showNotification("Bookmark saved!", "success");
    }
  }

  deleteBookmark(id) {
    if (confirm("Delete this bookmark?")) {
      this.bookmarks = this.bookmarks.filter((bookmark) => bookmark.id !== id);
      this.saveBookmarks();
      this.loadBookmarks();
      this.updateBookmarkButton();

      if (window.showNotification) {
        window.showNotification("Bookmark deleted", "success");
      }
    }
  }

  openBookmark(url) {
    if (typeof window.dy === "function") {
      window.dy(url);
    } else if (typeof window.go === "function") {
      window.go(url);
    } else {
      window.open(url, "_blank");
    }
  }

  saveBookmarks() {
    setCookie("user-bookmarks", JSON.stringify(this.bookmarks));
    localStorage.setItem("user-bookmarks", JSON.stringify(this.bookmarks));
  }

  trackVisit(url) {
    // Track visits for future bookmark suggestions
    const visits = JSON.parse(localStorage.getItem("bookmark-visits") || "{}");
    visits[url] = (visits[url] || 0) + 1;
    localStorage.setItem("bookmark-visits", JSON.stringify(visits));
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  addCategory() {
    const input = this.bookmarkPanel.querySelector("#new-category");
    const name = input.value.trim();

    if (name && !this.categories.includes(name)) {
      this.categories.push(name);
      this.saveCategories();
      this.loadCategories();
      input.value = "";

      // Update category dropdown
      const categorySelect =
        this.bookmarkPanel.querySelector("#bookmark-category");
      categorySelect.innerHTML = this.categories
        .map((cat) => `<option value="${cat}">${cat}</option>`)
        .join("");
    }
  }

  loadCategories() {
    const categoryList = this.bookmarkPanel.querySelector("#category-list");
    categoryList.innerHTML = this.categories
      .map(
        (category) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid var(--border-secondary);">
        <span style="color: var(--text-primary);">${category}</span>
        <button onclick="window.bookmarkSystem.deleteCategory('${category}')" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;">🗑️</button>
      </div>
    `
      )
      .join("");
  }

  deleteCategory(category) {
    if (category === "General") {
      if (window.showNotification) {
        window.showNotification("Cannot delete General category", "error");
      }
      return;
    }

    if (
      confirm(
        `Delete category "${category}"? Bookmarks will be moved to General.`
      )
    ) {
      // Move bookmarks to General
      this.bookmarks.forEach((bookmark) => {
        if (bookmark.category === category) {
          bookmark.category = "General";
        }
      });

      // Remove category
      this.categories = this.categories.filter((cat) => cat !== category);

      this.saveBookmarks();
      this.saveCategories();
      this.loadCategories();
    }
  }

  saveCategories() {
    setCookie("bookmark-categories", JSON.stringify(this.categories));
    localStorage.setItem(
      "bookmark-categories",
      JSON.stringify(this.categories)
    );
  }

  exportBookmarks() {
    const data = {
      bookmarks: this.bookmarks,
      categories: this.categories,
      exported: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "slowguardian-bookmarks.json";
    a.click();
    URL.revokeObjectURL(url);

    if (window.showNotification) {
      window.showNotification("Bookmarks exported!", "success");
    }
  }

  importBookmarks() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            if (data.bookmarks && Array.isArray(data.bookmarks)) {
              this.bookmarks = [...this.bookmarks, ...data.bookmarks];
              if (data.categories) {
                this.categories = [
                  ...new Set([...this.categories, ...data.categories]),
                ];
              }
              this.saveBookmarks();
              this.saveCategories();
              this.loadBookmarks();

              if (window.showNotification) {
                window.showNotification(
                  `Imported ${data.bookmarks.length} bookmarks!`,
                  "success"
                );
              }
            }
          } catch (error) {
            if (window.showNotification) {
              window.showNotification("Invalid bookmark file", "error");
            }
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }
}

// Register plugin
const bookmarkSystem = new BookmarkSystemPlugin();
window.bookmarkSystem = bookmarkSystem;

if (window.pluginSystem) {
  window.pluginSystem.registerPlugin("bookmark-system", bookmarkSystem);
} else {
  // Wait for plugin system to load
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      if (window.pluginSystem) {
        window.pluginSystem.registerPlugin("bookmark-system", bookmarkSystem);
      }
    }, 200);
  });
}
