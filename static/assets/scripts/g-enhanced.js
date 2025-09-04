// Enhanced Games Management for SlowGuardian v9
let appInd;
let gamesList = [];
let pinnedGames = [];
let hiddenGames = [];

// Game management functions
function saveToLocal(path) {
  sessionStorage.setItem("GoUrl", path);
}

function handleClick(app) {
  if (typeof app.say !== "undefined") {
    alert(app.say);
  }

  if (app.local) {
    saveToLocal(app.link);
    window.location.href = "/go";
  } else if (app.local2) {
    saveToLocal(app.link);
    window.location.href = app.link;
  } else if (app.blank) {
    blank(app.link);
  } else if (app.now) {
    now(app.link);
  } else if (app.custom) {
    Custom(app);
  } else if (app.dy) {
    dy(app.link);
  } else {
    go(app.link);
  }

  return false;
}

// Pin/Unpin game
function togglePin(index) {
  let pins = getPinnedGames();
  if (pins.includes(index)) {
    pins = pins.filter(pin => pin !== index);
  } else {
    pins.push(index);
  }
  localStorage.setItem("Gpinned", JSON.stringify(pins));
  refreshGamesDisplay();
}

// Hide/Show game
function toggleHide(index) {
  let hidden = getHiddenGames();
  if (hidden.includes(index)) {
    hidden = hidden.filter(hide => hide !== index);
  } else {
    hidden.push(index);
  }
  localStorage.setItem("Ghidden", JSON.stringify(hidden));
  refreshGamesDisplay();
}

// Report game
function reportGame(index) {
  const game = gamesList[index];
  if (game) {
    const reason = prompt(`Report "${game.name}" for:\n\n1. Inappropriate content\n2. Broken/Not working\n3. Copyright infringement\n4. Other\n\nPlease enter the number (1-4) and optionally add details:`);
    
    if (reason) {
      // Save report locally (in real implementation, this would be sent to server)
      const reports = JSON.parse(localStorage.getItem("Greports") || "[]");
      reports.push({
        gameIndex: index,
        gameName: game.name,
        reason: reason,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem("Greports", JSON.stringify(reports));
      
      if (window.showNotification) {
        window.showNotification("Thank you for your report. We'll review it soon.", "success");
      } else {
        alert("Thank you for your report. We'll review it soon.");
      }
    }
  }
}

// Get pinned games
function getPinnedGames() {
  try {
    return JSON.parse(localStorage.getItem("Gpinned") || "[]");
  } catch {
    return [];
  }
}

// Get hidden games
function getHiddenGames() {
  try {
    return JSON.parse(localStorage.getItem("Ghidden") || "[]");
  } catch {
    return [];
  }
}

// Custom app creation
function CustomApp(customApp) {
  let apps = localStorage.getItem("Gcustom");

  if (apps === null) {
    apps = {};
  } else {
    try {
      apps = JSON.parse(apps);
    } catch {
      apps = {};
    }
  }

  const key = "custom" + (Object.keys(apps).length + 1);
  apps[key] = customApp;
  localStorage.setItem("Gcustom", JSON.stringify(apps));
}

function Custom(app) {
  const title = prompt("Enter title for the game:");
  if (!title) return;
  
  const link = prompt("Enter link for the game:");
  if (!link) return;
  
  const customApp = {
    name: "[Custom] " + title,
    link: link,
    image: "/assets/media/icons/custom.webp",
    categories: ["all", "custom"],
    custom: false,
  };

  CustomApp(customApp);
  
  // Add to games list and refresh display
  gamesList.unshift(customApp);
  refreshGamesDisplay();
  
  if (window.showNotification) {
    window.showNotification(`Custom game "${title}" added successfully!`, "success");
  }
}

// Create game element with options menu
function createGameElement(app, index) {
  const isPinned = getPinnedGames().includes(index);
  const isHidden = getHiddenGames().includes(index);
  
  const gameDiv = document.createElement("div");
  gameDiv.classList.add("column");
  gameDiv.setAttribute("data-category", app.categories ? app.categories.join(" ") : "all");
  gameDiv.setAttribute("data-index", index);
  
  if (isPinned) gameDiv.classList.add("pinned");
  if (isHidden) gameDiv.classList.add("hidden");
  if (app.error) gameDiv.classList.add("error");
  if (app.partial) gameDiv.classList.add("partial");

  // Game options menu
  const optionsDiv = document.createElement("div");
  optionsDiv.classList.add("game-options");
  
  const optionsTrigger = document.createElement("button");
  optionsTrigger.classList.add("game-options-trigger");
  optionsTrigger.innerHTML = "⋯";
  optionsTrigger.onclick = (e) => {
    e.stopPropagation();
    toggleOptionsMenu(gameDiv, index);
  };
  
  const optionsMenu = document.createElement("div");
  optionsMenu.classList.add("game-options-menu");
  
  // Pin/Unpin option
  const pinOption = document.createElement("div");
  pinOption.classList.add("game-options-item");
  pinOption.innerHTML = `<i>${isPinned ? "📌" : "📍"}</i><span>${isPinned ? "Unpin" : "Pin"}</span>`;
  pinOption.onclick = (e) => {
    e.stopPropagation();
    togglePin(index);
    hideAllOptionsMenus();
  };
  
  // Hide/Show option
  const hideOption = document.createElement("div");
  hideOption.classList.add("game-options-item");
  hideOption.innerHTML = `<i>${isHidden ? "👁️" : "👁️‍🗨️"}</i><span>${isHidden ? "Show" : "Hide"}</span>`;
  hideOption.onclick = (e) => {
    e.stopPropagation();
    toggleHide(index);
    hideAllOptionsMenus();
  };
  
  // Report option
  const reportOption = document.createElement("div");
  reportOption.classList.add("game-options-item");
  reportOption.innerHTML = `<i>⚠️</i><span>Report</span>`;
  reportOption.onclick = (e) => {
    e.stopPropagation();
    reportGame(index);
    hideAllOptionsMenus();
  };
  
  optionsMenu.appendChild(pinOption);
  optionsMenu.appendChild(hideOption);
  optionsMenu.appendChild(reportOption);
  
  optionsDiv.appendChild(optionsTrigger);
  optionsDiv.appendChild(optionsMenu);

  // Game image and link
  const link = document.createElement("a");
  link.onclick = function(e) {
    e.preventDefault();
    handleClick(app);
  };

  const image = document.createElement("img");
  image.width = 145;
  image.height = 145;
  image.src = app.image;
  image.loading = "lazy";
  image.alt = app.name;

  const paragraph = document.createElement("p");
  paragraph.textContent = app.name;
  paragraph.classList.add("game-title");

  // Apply status styling
  if (app.error) {
    paragraph.style.color = "var(--color-error, red)";
    if (!app.say) {
      app.say = "This game is currently not working.";
    }
  } else if (app.partial) {
    paragraph.style.color = "var(--color-warning, yellow)";
    if (!app.say) {
      app.say = "This game is currently experiencing some issues, it may not work for you.";
    }
  }

  link.appendChild(image);
  link.appendChild(paragraph);
  gameDiv.appendChild(link);
  gameDiv.appendChild(optionsDiv);

  return gameDiv;
}

// Toggle options menu
function toggleOptionsMenu(gameElement, index) {
  hideAllOptionsMenus();
  const menu = gameElement.querySelector(".game-options-menu");
  if (menu) {
    menu.classList.add("active");
  }
}

// Hide all options menus
function hideAllOptionsMenus() {
  document.querySelectorAll(".game-options-menu.active").forEach(menu => {
    menu.classList.remove("active");
  });
}

// Create add custom game button
function createAddCustomGameButton() {
  const addDiv = document.createElement("div");
  addDiv.classList.add("add-custom-game", "column");
  addDiv.setAttribute("data-category", "all");
  
  addDiv.innerHTML = `
    <div class="add-icon">➕</div>
    <div class="add-text">Add Custom Game</div>
  `;
  
  addDiv.onclick = () => Custom({});
  
  return addDiv;
}

// Refresh games display
function refreshGamesDisplay() {
  const pinnedContainer = document.querySelector(".pinned-apps");
  const regularContainer = document.querySelector(".container-apps");
  const hiddenContainer = document.querySelector("#hidden-games-grid");
  const pinnedSection = document.querySelector("#pinned-games-section");
  const hiddenSection = document.querySelector("#hidden-games-section");
  
  if (!pinnedContainer || !regularContainer || !hiddenContainer) return;
  
  // Clear containers
  pinnedContainer.innerHTML = "";
  regularContainer.innerHTML = "";
  hiddenContainer.innerHTML = "";
  
  const pinnedIndices = getPinnedGames();
  const hiddenIndices = getHiddenGames();
  
  let hasPinned = false;
  let hasHidden = false;
  
  // Add custom game button first
  regularContainer.appendChild(createAddCustomGameButton());
  
  gamesList.forEach((app, index) => {
    const gameElement = createGameElement(app, index);
    
    if (pinnedIndices.includes(index)) {
      pinnedContainer.appendChild(gameElement.cloneNode(true));
      // Re-attach event listeners
      attachEventListeners(pinnedContainer.lastChild, app, index);
      hasPinned = true;
    } else if (hiddenIndices.includes(index)) {
      hiddenContainer.appendChild(gameElement.cloneNode(true));
      // Re-attach event listeners
      attachEventListeners(hiddenContainer.lastChild, app, index);
      hasHidden = true;
    } else {
      regularContainer.appendChild(gameElement);
      // Re-attach event listeners
      attachEventListeners(gameElement, app, index);
    }
  });
  
  // Show/hide sections
  pinnedSection.style.display = hasPinned ? "block" : "none";
  hiddenSection.style.display = hasHidden ? "block" : "none";
}

// Attach event listeners to a game element
function attachEventListeners(element, app, index) {
  const link = element.querySelector("a");
  const optionsTrigger = element.querySelector(".game-options-trigger");
  const pinOption = element.querySelector(".game-options-item:nth-child(1)");
  const hideOption = element.querySelector(".game-options-item:nth-child(2)");
  const reportOption = element.querySelector(".game-options-item:nth-child(3)");
  
  if (link) {
    link.onclick = function(e) {
      e.preventDefault();
      handleClick(app);
    };
  }
  
  if (optionsTrigger) {
    optionsTrigger.onclick = (e) => {
      e.stopPropagation();
      toggleOptionsMenu(element, index);
    };
  }
  
  if (pinOption) {
    pinOption.onclick = (e) => {
      e.stopPropagation();
      togglePin(index);
      hideAllOptionsMenus();
    };
  }
  
  if (hideOption) {
    hideOption.onclick = (e) => {
      e.stopPropagation();
      toggleHide(index);
      hideAllOptionsMenus();
    };
  }
  
  if (reportOption) {
    reportOption.onclick = (e) => {
      e.stopPropagation();
      reportGame(index);
      hideAllOptionsMenus();
    };
  }
}

// Toggle hidden games visibility
function toggleHiddenGames() {
  const hiddenGrid = document.querySelector("#hidden-games-grid");
  const toggleText = document.querySelector("#toggle-hidden-text");
  
  if (hiddenGrid && toggleText) {
    if (hiddenGrid.classList.contains("expanded")) {
      hiddenGrid.classList.remove("expanded");
      toggleText.textContent = "Show Hidden";
    } else {
      hiddenGrid.classList.add("expanded");
      toggleText.textContent = "Hide Hidden";
    }
  }
}

// Search functionality
function search_bar() {
  const input = document.getElementById("searchbarbottom");
  const filter = input.value.toLowerCase();
  const games = document.querySelectorAll(".column");

  games.forEach(game => {
    const nameElement = game.querySelector("p, .game-title");
    if (nameElement) {
      const name = nameElement.textContent.toLowerCase();
      game.style.display = name.includes(filter) ? "" : "none";
    }
  });
}

// Category filter
function show_category() {
  const selectedCategory = document.getElementById("category").value;
  const games = document.querySelectorAll(".column");

  games.forEach(game => {
    const categories = game.getAttribute("data-category");
    if (selectedCategory === "all" || (categories && categories.includes(selectedCategory))) {
      game.style.display = "";
    } else {
      game.style.display = "none";
    }
  });
}

// Load games data
function loadGamesData() {
  // Load custom games first
  const storedApps = localStorage.getItem("Gcustom");
  if (storedApps) {
    try {
      const customApps = JSON.parse(storedApps);
      Object.values(customApps).forEach(app => {
        gamesList.push(app);
      });
    } catch (e) {
      console.warn("Failed to load custom games:", e);
    }
  }

  // Load games from JSON
  fetch("assets/json/g.min.json")
    .then(response => response.json())
    .then(appsList => {
      // Sort games with custom first, then alphabetically
      appsList.sort((a, b) => {
        if (a.name.startsWith("[Custom]")) return -1;
        if (b.name.startsWith("[Custom]")) return 1;
        return a.name.localeCompare(b.name);
      });

      // Process each game
      appsList.forEach(app => {
        // Set local flag for local games
        if (app.categories && app.categories.includes("local")) {
          app.local = true;
        }
        
        // Handle now.gg games
        if (app.link && (app.link.includes("now.gg") || app.link.includes("nowgg.me"))) {
          if (app.partial === null || app.partial === undefined) {
            app.partial = true;
            app.say = "Now.gg is currently not working for some users.";
          }
        } else if (app.link && app.link.includes("nowgg.nl")) {
          if (app.error === null || app.error === undefined) {
            app.error = true;
            app.say = "NowGG.nl is currently down.";
          }
        }
        
        gamesList.push(app);
      });

      // Update app indices
      appInd = gamesList.length;
      
      // Refresh display
      refreshGamesDisplay();
    })
    .catch(error => {
      console.error("Error fetching JSON data:", error);
      // Still show any custom games even if JSON fails
      refreshGamesDisplay();
    });
}

// Initialize games page
function initGamesPage() {
  // Set up search
  const searchInput = document.getElementById("searchbarbottom");
  if (searchInput) {
    searchInput.addEventListener("input", search_bar);
  }

  // Set up category filter
  const categorySelect = document.getElementById("category");
  if (categorySelect) {
    categorySelect.addEventListener("change", show_category);
  }

  // Hide options menus when clicking outside
  document.addEventListener("click", hideAllOptionsMenus);

  // Load games data
  loadGamesData();
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initGamesPage);

// Global function for HTML onclick
window.toggleHiddenGames = toggleHiddenGames;

// Expose functions for backward compatibility
window.handleClick = handleClick;
window.Custom = Custom;
window.search_bar = search_bar;
window.show_category = show_category;