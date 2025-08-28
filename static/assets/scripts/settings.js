// Ads
document.addEventListener("DOMContentLoaded", function () {
  function adChange(selectedValue) {
    if (selectedValue === "default") {
      localStorage.setItem("ad", "on");
    } else if (selectedValue === "off") {
      localStorage.setItem("ad", "off");
    }
  }

  var adTypeElement = document.getElementById("adType");

  if (adTypeElement) {
    adTypeElement.addEventListener("change", function () {
      var selectedOption = this.value;
      adChange(selectedOption);
    });

    var storedAd = localStorage.getItem("ad");
    if (storedAd === "on") {
      adTypeElement.value = "default";
    } else if (storedAd === "off") {
      adTypeElement.value = "off";
    } else {
      adTypeElement.value = "default";
    }
  }
  // Makes the custom icon and name persistent
  const iconElement = document.getElementById("icon");
  const nameElement = document.getElementById("name");
  const customIcon = localStorage.getItem("CustomIcon");
  const customName = localStorage.getItem("CustomName");
  iconElement.value = customIcon;
  nameElement.value = customName;

  // Auth toggle and credentials
  const authToggle = document.getElementById("auth-toggle");
  const authCredentials = document.getElementById("auth-credentials");
  const saveAuthBtn = document.getElementById("save-auth-btn");
  
  if (authToggle) {
    // Set initial state
    authToggle.checked = localStorage.getItem('sg-auth-enabled') === 'true';
    if (authToggle.checked) {
      authCredentials.style.display = 'block';
      // Load existing credentials if any
      const existingUsername = localStorage.getItem('sg-auth-username');
      if (existingUsername) {
        document.getElementById('auth-username-setting').value = existingUsername;
      }
    }
    
    authToggle.addEventListener("change", function() {
      if (this.checked) {
        authCredentials.style.display = 'block';
      } else {
        authCredentials.style.display = 'none';
        // Disable auth
        AuthSystem.disable();
      }
    });
  }
  
  if (saveAuthBtn) {
    saveAuthBtn.addEventListener("click", function() {
      const username = document.getElementById('auth-username-setting').value.trim();
      const password = document.getElementById('auth-password-setting').value;
      
      if (username && password) {
        AuthSystem.enable(username, password);
        // Clear password field for security
        document.getElementById('auth-password-setting').value = '';
      } else {
        if (window.showNotification) {
          window.showNotification('Please enter both username and password', 'error');
        }
      }
    });
  }

  // Add proper event listeners to replace inline handlers
  
  // About:Blank functionality
  const abSwitch = document.getElementById("ab-settings-switch");
  const abPopupBtn = document.getElementById("ab-popup-btn");
  
  if (abSwitch) {
    // Set initial state
    const abEnabled = localStorage.getItem("ab");
    abSwitch.checked = abEnabled === "true";
    
    abSwitch.addEventListener("change", toggleAB);
  }
  
  if (abPopupBtn) {
    abPopupBtn.addEventListener("click", AB);
  }

  // Screenshot Protection functionality
  const screenshotProtectionSwitch = document.getElementById("screenshot-protection-switch");
  const testProtectionBtn = document.getElementById("test-protection-btn");
  
  if (screenshotProtectionSwitch) {
    // Set initial state
    screenshotProtectionSwitch.checked = localStorage.getItem('screenshot-protection') === 'true';
    
    screenshotProtectionSwitch.addEventListener("change", function() {
      if (this.checked) {
        window.ScreenshotProtection.enable();
      } else {
        window.ScreenshotProtection.disable();
      }
    });
  }
  
  if (testProtectionBtn) {
    testProtectionBtn.addEventListener("click", function() {
      if (window.ScreenshotProtection) {
        window.ScreenshotProtection.activateProtection();
        setTimeout(() => {
          window.ScreenshotProtection.deactivateProtection();
          if (window.showNotification) {
            window.showNotification('Screenshot protection test completed', 'info');
          }
        }, 3000);
      }
    });
  }

  // Panic key save button
  const savePanicBtn = document.getElementById("save-panic-key-btn");
  if (savePanicBtn) {
    savePanicBtn.addEventListener("click", saveEventKey);
  }

  // Tab cloaker dropdown and buttons
  const dropdown = document.getElementById("dropdown");
  const saveTabCloakBtn = document.getElementById("save-tab-cloak-btn");
  const resetTabCloakBtn = document.getElementById("reset-tab-cloak-btn");
  
  if (dropdown) {
    dropdown.addEventListener("change", function() {
      handleDropdownChange(this);
    });
  }
  
  if (saveTabCloakBtn) {
    saveTabCloakBtn.addEventListener("click", function() {
      CustomIcon(); 
      CustomName(); 
      redirectToMainDomain();
    });
  }
  
  if (resetTabCloakBtn) {
    resetTabCloakBtn.addEventListener("click", function() {
      ResetCustomCloak(); 
      redirectToMainDomain();
    });
  }

  // Search engine
  const engineSelect = document.getElementById("engine");
  const saveEngineBtn = document.getElementById("save-engine-btn");
  
  if (engineSelect) {
    engineSelect.addEventListener("change", function() {
      EngineChange(this);
    });
  }
  
  if (saveEngineBtn) {
    saveEngineBtn.addEventListener("click", SaveEngine);
  }

  // Advertisements
  const adTypeSelect = document.getElementById("adType");
  if (adTypeSelect) {
    adTypeSelect.addEventListener("change", function() {
      adChange(this);
    });
  }

  // Enhanced Themes functionality with Custom Theme Creator
  const themeDropdown = document.getElementById("theme-dropdown");
  const createCustomThemeBtn = document.getElementById("create-custom-theme-btn");
  const exportThemeBtn = document.getElementById("export-theme-btn");
  const importThemeBtn = document.getElementById("import-theme-btn");
  
  if (themeDropdown) {
    // Set current theme value
    const currentTheme = localStorage.getItem("theme") || "d";
    themeDropdown.value = currentTheme;
    
    // Add change listener
    themeDropdown.addEventListener("change", function () {
      const selectedTheme = this.value;
      localStorage.setItem("theme", selectedTheme);
      
      // Apply theme immediately via utils
      if (window.theme && window.theme.set) {
        window.theme.set(selectedTheme);
      } else {
        // Fallback to legacy method
        applyTheme(selectedTheme);
      }
      
      // Show notification
      if (window.showNotification) {
        window.showNotification(`Theme changed to ${this.options[this.selectedIndex].text}`, 'success');
      }
    });
  }
  
  // Custom Theme Creator
  if (createCustomThemeBtn) {
    createCustomThemeBtn.addEventListener("click", function() {
      openCustomThemeModal();
    });
  }
  
  if (exportThemeBtn) {
    exportThemeBtn.addEventListener("click", function() {
      exportCurrentTheme();
    });
  }
  
  if (importThemeBtn) {
    importThemeBtn.addEventListener("click", function() {
      openImportThemeModal();
    });
  }
  
  // Theme Creator Modal Functions
  function openCustomThemeModal() {
    const modal = document.getElementById('custom-theme-modal');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('show'), 10);
      
      // Initialize with current theme colors or defaults
      initializeThemeCreator();
      updateThemePreview();
    }
  }
  
  function closeCustomThemeModal() {
    const modal = document.getElementById('custom-theme-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.style.display = 'none', 300);
    }
  }
  
  function initializeThemeCreator() {
    // Set default values for theme creator
    const defaults = {
      'theme-name': 'My Custom Theme',
      'primary-bg-color': '#1a1a2e',
      'secondary-bg-color': '#16213e',
      'accent-color': '#3b82f6',
      'text-primary-color': '#ffffff',
      'text-secondary-color': '#b8bcc8',
      'gradient-start-color': '#1a1a2e',
      'gradient-end-color': '#16213e'
    };
    
    Object.entries(defaults).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value;
      }
    });
    
    // Add event listeners for live preview
    Object.keys(defaults).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('input', updateThemePreview);
      }
    });
  }
  
  function updateThemePreview() {
    const previewContainer = document.getElementById('theme-preview-container');
    if (!previewContainer) return;
    
    // Get color values safely
    const primaryBg = document.getElementById('primary-bg-color')?.value || '#1a1a2e';
    const secondaryBg = document.getElementById('secondary-bg-color')?.value || '#16213e';
    const accentColor = document.getElementById('accent-color')?.value || '#3b82f6';
    const textPrimary = document.getElementById('text-primary-color')?.value || '#ffffff';
    const textSecondary = document.getElementById('text-secondary-color')?.value || '#b8bcc8';
    const gradientStart = document.getElementById('gradient-start-color')?.value || '#1a1a2e';
    const gradientEnd = document.getElementById('gradient-end-color')?.value || '#16213e';
    
    // Apply preview styles with smooth transitions
    previewContainer.style.transition = 'all 0.3s ease';
    previewContainer.style.background = `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`;
    
    const navbar = previewContainer.querySelector('.preview-navbar');
    if (navbar) {
      navbar.style.transition = 'all 0.3s ease';
      navbar.style.background = `rgba(${hexToRgb(primaryBg)}, 0.95)`;
      navbar.style.borderBottomColor = accentColor;
    }
    
    const content = previewContainer.querySelector('.preview-content');
    if (content) {
      content.style.transition = 'all 0.3s ease';
      content.style.background = `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`;
    }
    
    const card = previewContainer.querySelector('.preview-card');
    if (card) {
      card.style.transition = 'all 0.3s ease';
      card.style.background = secondaryBg;
      card.style.borderColor = accentColor;
      card.style.boxShadow = `0 4px 12px rgba(${hexToRgb(accentColor)}, 0.2)`;
    }
    
    // Update text colors with smooth transitions
    const h2 = previewContainer.querySelector('h2');
    const h3 = previewContainer.querySelector('h3');
    const paragraphs = previewContainer.querySelectorAll('p');
    const brandElement = previewContainer.querySelector('.preview-brand');
    
    if (h2) {
      h2.style.transition = 'color 0.3s ease';
      h2.style.color = textPrimary;
    }
    if (h3) {
      h3.style.transition = 'color 0.3s ease';
      h3.style.color = textPrimary;
    }
    if (brandElement) {
      brandElement.style.transition = 'color 0.3s ease';
      brandElement.style.color = textPrimary;
    }
    
    paragraphs.forEach(p => {
      p.style.transition = 'color 0.3s ease';
      p.style.color = textSecondary;
    });
    
    // Update navigation link styles
    const navLinks = previewContainer.querySelectorAll('.preview-nav-links span');
    navLinks.forEach((link, index) => {
      link.style.transition = 'all 0.3s ease';
      if (index === 0) {
        // Active link
        link.style.background = accentColor;
        link.style.color = textPrimary;
      } else {
        link.style.color = textSecondary;
      }
    });
  }
  
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16)
      : '26,26,46';
  }
  
  function saveCustomTheme() {
    const themeData = {
      name: document.getElementById('theme-name').value || 'Custom Theme',
      primaryBg: document.getElementById('primary-bg-color').value,
      secondaryBg: document.getElementById('secondary-bg-color').value,
      accentColor: document.getElementById('accent-color').value,
      textPrimary: document.getElementById('text-primary-color').value,
      textSecondary: document.getElementById('text-secondary-color').value,
      gradientStart: document.getElementById('gradient-start-color').value,
      gradientEnd: document.getElementById('gradient-end-color').value,
      created: new Date().toISOString()
    };
    
    localStorage.setItem('sg-custom-theme', JSON.stringify(themeData));
    
    // Apply the theme immediately
    if (window.theme && window.theme.set) {
      window.theme.set('custom');
    }
    
    closeCustomThemeModal();
    
    if (window.showNotification) {
      window.showNotification(`Custom theme "${themeData.name}" saved and applied!`, 'success');
    }
  }
  
  function exportCurrentTheme() {
    const customTheme = localStorage.getItem('sg-custom-theme');
    if (!customTheme) {
      if (window.showNotification) {
        window.showNotification('No custom theme to export. Create one first!', 'warning');
      }
      return;
    }
    
    const blob = new Blob([customTheme], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'slowguardian-theme.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (window.showNotification) {
      window.showNotification('Theme exported successfully!', 'success');
    }
  }
  
  function openImportThemeModal() {
    const modal = document.getElementById('import-theme-modal');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('show'), 10);
    }
  }
  
  function closeImportThemeModal() {
    const modal = document.getElementById('import-theme-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.style.display = 'none', 300);
    }
  }
  
  function importTheme() {
    const importData = document.getElementById('theme-import-data').value.trim();
    if (!importData) {
      if (window.showNotification) {
        window.showNotification('Please paste theme data to import', 'warning');
      }
      return;
    }
    
    try {
      const themeData = JSON.parse(importData);
      
      // Validate theme data
      const requiredFields = ['name', 'primaryBg', 'secondaryBg', 'accentColor', 'textPrimary', 'textSecondary'];
      const isValid = requiredFields.every(field => themeData.hasOwnProperty(field));
      
      if (!isValid) {
        throw new Error('Invalid theme format');
      }
      
      localStorage.setItem('sg-custom-theme', JSON.stringify(themeData));
      
      if (window.theme && window.theme.set) {
        window.theme.set('custom');
      }
      
      closeImportThemeModal();
      document.getElementById('theme-import-data').value = '';
      
      if (window.showNotification) {
        window.showNotification(`Theme "${themeData.name}" imported and applied!`, 'success');
      }
    } catch (error) {
      if (window.showNotification) {
        window.showNotification('Invalid theme data format. Please check your JSON.', 'error');
      }
    }
  }
  
  // Modal event listeners
  const customThemeModal = document.getElementById('custom-theme-modal');
  const importThemeModal = document.getElementById('import-theme-modal');
  
  // Custom Theme Modal
  if (customThemeModal) {
    document.getElementById('close-theme-modal')?.addEventListener('click', closeCustomThemeModal);
    document.getElementById('save-custom-theme-btn')?.addEventListener('click', saveCustomTheme);
    document.getElementById('apply-theme-preview-btn')?.addEventListener('click', updateThemePreview);
    document.getElementById('cancel-theme-btn')?.addEventListener('click', closeCustomThemeModal);
    
    // Close on outside click
    customThemeModal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeCustomThemeModal();
      }
    });
  }
  
  // Import Theme Modal
  if (importThemeModal) {
    document.getElementById('close-import-modal')?.addEventListener('click', closeImportThemeModal);
    document.getElementById('import-theme-confirm-btn')?.addEventListener('click', importTheme);
    document.getElementById('cancel-import-btn')?.addEventListener('click', closeImportThemeModal);
    
    // Close on outside click
    importThemeModal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeImportThemeModal();
      }
    });
  }

  // Proxy selection
  const proxySelect = document.getElementById("pChange");
  if (proxySelect) {
    proxySelect.addEventListener("change", function() {
      pChange(this.value);
    });
  }
});

// Dyn
document.addEventListener("DOMContentLoaded", function () {
  function pChange(selectedValue) {
    if (selectedValue === "uv") {
      localStorage.setItem("uv", "true");
      localStorage.setItem("dy", "false");
    } else if (selectedValue === "dy") {
      localStorage.setItem("uv", "false");
      localStorage.setItem("dy", "true");
    }
  }

  var pChangeElement = document.getElementById("pChange");

  if (pChangeElement) {
    pChangeElement.addEventListener("change", function () {
      var selectedOption = this.value;
      pChange(selectedOption);
    });

    var storedP = localStorage.getItem("uv");
    if (storedP === "true") {
      pChangeElement.value = "uv";
    } else if (
      localStorage.getItem("dy") === "true" ||
      localStorage.getItem("dy") === "auto"
    ) {
      pChangeElement.value = "dy";
    } else {
      pChangeElement.value = "uv";
    }
  }
});

// Key
let eventKey = localStorage.getItem("eventKey") || "`";
let eventKeyRaw = localStorage.getItem("eventKeyRaw") || "`";
let pLink = localStorage.getItem("pLink") || "https://classroom.google.com/";

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("eventKeyInput").value = eventKeyRaw;
  document.getElementById("linkInput").value = pLink;

  const selectedOption = localStorage.getItem("selectedOption");
  if (selectedOption) {
    updateHeadSection(selectedOption);
  }
});

const eventKeyInput = document.getElementById("eventKeyInput");
eventKeyInput.addEventListener("input", function () {
  eventKey = eventKeyInput.value.split(",");
});

var linkInput = document.getElementById("linkInput");
linkInput.addEventListener("input", function () {
  pLink = linkInput.value;
});

function saveEventKey() {
  eventKey = eventKeyInput.value.split(",");
  eventKeyRaw = eventKeyInput.value;
  localStorage.setItem("eventKey", JSON.stringify(eventKey));
  localStorage.setItem("pLink", pLink);
  localStorage.setItem("eventKeyRaw", eventKeyRaw);
  window.location = window.location;
}
// Tab Cloaker
var dropdown = document.getElementById("dropdown");
var options = dropdown.getElementsByTagName("option");

var sortedOptions = Array.from(options).sort(function (a, b) {
  return a.textContent.localeCompare(b.textContent);
});

while (dropdown.firstChild) {
  dropdown.removeChild(dropdown.firstChild);
}

sortedOptions.forEach(function (option) {
  dropdown.appendChild(option);
});

function saveIcon() {
  const iconElement = document.getElementById("icon");
  const iconValue = iconElement.value;
  console.log("saveIcon function called with icon value:", iconValue);
  localStorage.setItem("icon", iconValue);
}

function saveName() {
  const nameElement = document.getElementById("name");
  const nameValue = nameElement.value;
  console.log("saveName function called with name value:", nameValue);
  localStorage.setItem("name", nameValue);
}

function CustomIcon() {
  const iconElement = document.getElementById("icon");
  const iconValue = iconElement.value;
  console.log("saveIcon function called with icon value:", iconValue);
  localStorage.setItem("CustomIcon", iconValue);
}

function CustomName() {
  const nameElement = document.getElementById("name");
  const nameValue = nameElement.value;
  console.log("saveName function called with name value:", nameValue);
  localStorage.setItem("CustomName", nameValue);
}
function ResetCustomCloak() {
  localStorage.removeItem("CustomName");
  localStorage.removeItem("CustomIcon");
  document.getElementById("icon").value = "";
  document.getElementById("name").value = "";
}

function redirectToMainDomain() {
  var currentUrl = window.location.href;
  var mainDomainUrl = currentUrl.replace(/\/[^\/]*$/, "");
  if (window != top) {
    top.location.href = mainDomainUrl + window.location.pathname;
  } else {
    window.location.href = mainDomainUrl + window.location.pathname;
  }
}

document.addEventListener("DOMContentLoaded", function (event) {
  const icon = document.getElementById("tab-favicon");
  const name = document.getElementById("tab-title");
  var selectedValue = localStorage.getItem("selectedOption") || "Default";
  document.getElementById("dropdown").value = selectedValue;
  updateHeadSection(selectedValue);
});

function handleDropdownChange(selectElement) {
  var selectedValue = selectElement.value;
  localStorage.removeItem("CustomName");
  localStorage.removeItem("CustomIcon");
  localStorage.setItem("selectedOption", selectedValue);
  updateHeadSection(selectedValue);
  redirectToMainDomain(selectedValue);
}

function updateHeadSection(selectedValue) {
  const icon = document.getElementById("tab-favicon");
  const name = document.getElementById("tab-title");
  const customName = localStorage.getItem("CustomName");
  const customIcon = localStorage.getItem("CustomIcon");

  if (customName && customIcon) {
    name.textContent = customName;
    icon.setAttribute("href", customIcon);
    localStorage.setItem("name", customName);
    localStorage.setItem("icon", customIcon);
  }
}
// Background Image
document.addEventListener("DOMContentLoaded", function () {
  var saveButton = document.getElementById("save-button");
  saveButton.addEventListener("click", function () {
    var backgroundInput = document.getElementById("background-input");
    var imageURL = backgroundInput.value;

    if (imageURL !== "") {
      localStorage.setItem("backgroundImage", imageURL);
      document.body.style.backgroundImage = "url('" + imageURL + "')";
      backgroundInput.value = "";
    } else {
    }
  });

  var resetButton = document.getElementById("reset-button");
  resetButton.addEventListener("click", function () {
    localStorage.removeItem("backgroundImage");
    document.body.style.backgroundImage = "url('default-background.jpg')";
  });

  var savedBackgroundImage = localStorage.getItem("backgroundImage");
  if (savedBackgroundImage) {
    document.body.style.backgroundImage = "url('" + savedBackgroundImage + "')";
  }
});
// Particles

const switches = document.getElementById("2");

if (window.localStorage.getItem("Particles") != "") {
  if (window.localStorage.getItem("Particles") == "true") {
    switches.checked = true;
  } else {
    switches.checked = false;
  }
}

switches.addEventListener("change", (event) => {
  if (event.currentTarget.checked) {
    window.localStorage.setItem("Particles", "true");
  } else {
    window.localStorage.setItem("Particles", "false");
  }
});
// Themes
document.addEventListener("DOMContentLoaded", function () {
  const themeDropdown = document.getElementById("theme-dropdown");
  
  if (themeDropdown) {
    // Set current theme value
    const currentTheme = localStorage.getItem("theme") || "d";
    themeDropdown.value = currentTheme;
    
    // Add change listener
    themeDropdown.addEventListener("change", function () {
      const selectedTheme = this.value;
      localStorage.setItem("theme", selectedTheme);
      
      // Apply theme immediately
      applyTheme(selectedTheme);
      
      // Show notification
      if (window.showNotification) {
        window.showNotification(`Theme changed to ${this.options[this.selectedIndex].text}`, 'success');
      }
    });
  }
});

function applyTheme(theme) {
  // Remove existing theme
  const existingTheme = document.querySelector('link[href*="/themes/"]');
  if (existingTheme) {
    existingTheme.remove();
  }

  if (theme && theme !== 'd' && theme !== 'default') {
    const themeEle = document.createElement("link");
    themeEle.rel = "stylesheet";
    
    // Handle catppuccin themes
    if (theme.startsWith('catppuccin')) {
      const variant = theme.replace('catppuccin', '').toLowerCase();
      themeEle.href = `/assets/styles/themes/catppuccin/${variant}.css?v=1`;
    } else {
      // Handle new modern themes
      themeEle.href = `/assets/styles/themes/${theme}.css?v=1`;
    }
    
    document.head.appendChild(themeEle);
  }
}
// AB Cloak
function AB() {
  let inFrame;

  try {
    inFrame = window !== top;
  } catch (e) {
    inFrame = true;
  }

  if (!inFrame && !navigator.userAgent.includes("Firefox")) {
    const popup = open("about:blank", "_blank");
    if (!popup || popup.closed) {
      alert("Please allow popups and redirects.");
    } else {
      const doc = popup.document;
      const iframe = doc.createElement("iframe");
      const style = iframe.style;
      const link = doc.createElement("link");

      const name = localStorage.getItem("name") || "My Drive - Google Drive";
      const icon =
        localStorage.getItem("icon") ||
        "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png";

      doc.title = name;
      link.rel = "icon";
      link.href = icon;

      iframe.src = location.href;
      style.position = "fixed";
      style.top = style.bottom = style.left = style.right = 0;
      style.border = style.outline = "none";
      style.width = style.height = "100%";

      doc.head.appendChild(link);
      doc.body.appendChild(iframe);

      const pLink =
        localStorage.getItem(encodeURI("pLink")) || "https://www.nasa.gov/";
      location.replace(pLink);

      const script = doc.createElement("script");
      script.textContent = `
        window.onbeforeunload = function (event) {
          const confirmationMessage = 'Leave Site?';
          (event || window.event).returnValue = confirmationMessage;
          return confirmationMessage;
        };
      `;
      doc.head.appendChild(script);
    }
  }
}

function toggleAB() {
  ab = localStorage.getItem("ab");
  if (ab == null) {
    localStorage.setItem("ab", "false");
  } else if (ab == "true") {
    localStorage.setItem("ab", "false");
  } else {
    localStorage.setItem("ab", "true");
    // Auto-open popup when enabled
    setTimeout(() => {
      AB();
    }, 1000); // Increased delay for better reliability
  }
}

// Check for auto-popup on page load
document.addEventListener("DOMContentLoaded", function() {
  const abEnabled = localStorage.getItem("ab");
  const abSwitch = document.getElementById("ab-settings-switch");
  
  if (abSwitch) {
    abSwitch.checked = abEnabled === "true";
    abSwitch.addEventListener("change", toggleAB);
  }
  
  // Auto-popup if enabled and not in iframe
  if (abEnabled === "true" && window.self === window.top) {
    // Add a small delay to ensure page is fully loaded
    setTimeout(() => {
      AB();
    }, 2000);
  }
});
// Search Engine
function EngineChange(dropdown) {
  var selectedEngine = dropdown.value;

  var engineUrls = {
    Google: "https://www.google.com/search?q=",
    Bing: "https://www.bing.com/search?q=",
    DuckDuckGo: "https://duckduckgo.com/?q=",
    Qwant: "https://www.qwant.com/?q=",
    Startpage: "https://www.startpage.com/search?q=",
    SearchEncrypt: "https://www.searchencrypt.com/search/?q=",
    Ecosia: "https://www.ecosia.org/search?q=",
  };

  localStorage.setItem("engine", engineUrls[selectedEngine]);
  localStorage.setItem("enginename", selectedEngine);

  dropdown.value = selectedEngine;
}

function SaveEngine() {
  var customEngine = document.getElementById("engine-form").value;
  if (customEngine.trim() !== "") {
    localStorage.setItem("engine", customEngine);
    localStorage.setItem("enginename", "Custom");
  } else {
    alert("Please enter a custom search engine value.");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var selectedEngineName = localStorage.getItem("enginename");
  var dropdown = document.getElementById("engine");
  if (selectedEngineName) {
    dropdown.value = selectedEngineName;
  }

  // Features Management
  const openFeaturesBtn = document.getElementById("open-features-manager-btn");
  if (openFeaturesBtn) {
    openFeaturesBtn.addEventListener("click", openFeaturesManager);
  }

  // Update features preview
  updateFeaturesPreview();
  
  // Auto-update features preview every 5 seconds
  setInterval(updateFeaturesPreview, 5000);
});

// Features Management Functions
function openFeaturesManager() {
  // Create features manager modal
  if (!document.getElementById('features-manager-modal')) {
    createFeaturesManagerModal();
  }
  
  const modal = document.getElementById('features-manager-modal');
  modal.classList.add('active');
  
  // Initialize features manager if not already done
  if (!window.featuresManagerInitialized) {
    initializeFeaturesManager();
    window.featuresManagerInitialized = true;
  }
}

function createFeaturesManagerModal() {
  const modal = document.createElement('div');
  modal.id = 'features-manager-modal';
  modal.className = 'features-modal';
  modal.innerHTML = `
    <div class="features-modal-content">
      <div class="features-modal-header">
        <h3>🚀 Features Manager</h3>
        <button class="features-modal-close" onclick="closeFeaturesManager()">&times;</button>
      </div>
      <div class="features-modal-body" id="features-manager-container">
        <!-- Features manager content will be loaded here -->
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeFeaturesManager();
    }
  });
}

function closeFeaturesManager() {
  const modal = document.getElementById('features-manager-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function initializeFeaturesManager() {
  const container = document.getElementById('features-manager-container');
  if (!container) return;
  
  // Create a temporary features manager instance
  const featuresManager = new FeaturesManager();
  featuresManager.createFeaturesInterface = function() {
    // Override to inject into modal instead
    const featuresSection = document.createElement('div');
    featuresSection.innerHTML = this.getFeaturesHTML();
    container.appendChild(featuresSection);
    
    // Setup event listeners
    this.setupEventListeners();
    this.loadFeatures();
  };
  
  featuresManager.getFeaturesHTML = function() {
    return `
      <div class="features-controls">
        <div class="features-search">
          <input type="text" id="features-search-modal" placeholder="🔍 Search features..." />
        </div>
        
        <div class="features-categories">
          <button class="category-btn active" data-category="all">All (100)</button>
          <button class="category-btn" data-category="ux">User Experience (25)</button>
          <button class="category-btn" data-category="productivity">Productivity (25)</button>
          <button class="category-btn" data-category="customization">Customization (25)</button>
          <button class="category-btn" data-category="advanced">Advanced (25)</button>
        </div>
        
        <div class="features-bulk-actions">
          <button id="enable-all-btn-modal" class="btn btn-success">✅ Enable All</button>
          <button id="disable-all-btn-modal" class="btn btn-warning">❌ Disable All</button>
          <button id="reset-features-btn-modal" class="btn btn-secondary">🔄 Reset to Defaults</button>
        </div>
      </div>
      
      <div class="features-stats">
        <div class="stat-card">
          <span class="stat-number" id="enabled-count-modal">0</span>
          <span class="stat-label">Enabled</span>
        </div>
        <div class="stat-card">
          <span class="stat-number" id="disabled-count-modal">0</span>
          <span class="stat-label">Disabled</span>
        </div>
        <div class="stat-card">
          <span class="stat-number" id="total-count-modal">100</span>
          <span class="stat-label">Total</span>
        </div>
      </div>
      
      <div class="features-grid" id="features-grid-modal">
        <!-- Features will be populated here -->
      </div>
      
      <div class="features-performance">
        <h3>⚡ Performance Impact</h3>
        <div class="performance-bar">
          <div class="performance-fill" id="performance-fill-modal"></div>
        </div>
        <p id="performance-text-modal">Low impact - All features can be enabled safely</p>
      </div>
    `;
  };
  
  featuresManager.createFeaturesInterface();
}

function updateFeaturesPreview() {
  // Update the features preview in settings
  const enabledFeatures = getEnabledFeaturesCount();
  const totalFeatures = 100;
  const disabledFeatures = totalFeatures - enabledFeatures;
  
  // Update preview counts
  const enabledElement = document.getElementById('preview-enabled-count');
  const disabledElement = document.getElementById('preview-disabled-count');
  
  if (enabledElement) enabledElement.textContent = enabledFeatures;
  if (disabledElement) disabledElement.textContent = disabledFeatures;
  
  // Update category counts (simulate for now)
  updateCategoryCount('ux-count', Math.floor(enabledFeatures * 0.25));
  updateCategoryCount('productivity-count', Math.floor(enabledFeatures * 0.25));
  updateCategoryCount('customization-count', Math.floor(enabledFeatures * 0.25));
  updateCategoryCount('advanced-count', Math.floor(enabledFeatures * 0.25));
}

function updateCategoryCount(elementId, enabled) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = `${enabled}/25 enabled`;
  }
}

function getEnabledFeaturesCount() {
  // Get from features manager if available, otherwise simulate
  if (window.sgFeatures && window.sgFeatures.features) {
    return Array.from(window.sgFeatures.features.values()).filter(f => f.enabled).length;
  }
  
  // Simulate based on localStorage or default
  const savedStates = JSON.parse(localStorage.getItem('feature_states') || '{}');
  return Object.values(savedStates).filter(state => state).length || 25; // Default to 25 enabled
}
