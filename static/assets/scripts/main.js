// Cookie helper functions
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

function setCookie(name, value, days = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

document.addEventListener("DOMContentLoaded", function () {
  // Ads
  if (
    localStorage.getItem("ad") === null ||
    localStorage.getItem("ad") === "default"
  ) {
    localStorage.setItem("ad", "on");
  }

  var advDiv = document.getElementById("adv");
  if (advDiv && localStorage.getItem("ad") === "default") {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "//oysterscoldtiny.com/1c/c3/8a/1cc38a6899fdf8ba4dfe779bcc54627b.js";
    advDiv.appendChild(script);
    console.log("Script inserted inside the adv div.");
  } else if (advDiv && localStorage.getItem("ad") === "off") {
    advDiv.remove();
    console.log("The adv div has been removed.");
  }

  // DISABLED: Auto About:Blank Popup to prevent spam
  // About:blank is now manual only - users can enable it through settings
  // This prevents the infinite loop of about:blank windows being created automatically

  // Simple beforeunload prevention - "Leave Site?" prompt
  window.onbeforeunload = function (event) {
    const confirmationMessage = 'Leave Site?';
    (event || window.event).returnValue = confirmationMessage;
    return confirmationMessage;
  };
});

// Nav
var nav = document.querySelector(".fixed-nav-bar");

if (nav) {
  var html = `
    <div class="fixed-nav-bar-container">
      <a class="icon" href="/./"><img alt="nav" id="INImg" src="/assets/media/favicon/main.png"/></a>
    </div>
    <div class="fixed-nav-bar-right">
      <a class="navbar-link" href="/./g"><i class="fa-solid fa-gamepad navbar-icon"></i><xn>Ga</xn><xn>mes</xn></a>
      <a class="navbar-link" href="/./ap"><i class="fa-solid fa-phone navbar-icon"></i><xn>Ap</xn><xn>ps</xn></a>
      <a class="navbar-link" href="/./s"><i class="fa-solid fa-gear navbar-icon settings-icon"></i><xn>Set</xn><xn>tings</xn></a>
    </div>`;
  nav.innerHTML = html;
}

// Themes
var themeid = localStorage.getItem("theme");
var themeEle = document.createElement("link");
themeEle.rel = "stylesheet";

// Catppuccin themes
if (themeid == "catppuccinMocha") {
  themeEle.href = "/assets/styles/themes/catppuccin/mocha.css?v=1";
}
if (themeid == "catppuccinMacchiato") {
  themeEle.href = "/assets/styles/themes/catppuccin/macchiato.css?v=1";
}
if (themeid == "catppuccinFrappe") {
  themeEle.href = "/assets/styles/themes/catppuccin/frappe.css?v=1";
}
if (themeid == "catppuccinLatte") {
  themeEle.href = "/assets/styles/themes/catppuccin/latte.css?v=1";
}

// New modern themes
if (themeid == "cyberpunk") {
  themeEle.href = "/assets/styles/themes/cyberpunk.css?v=1";
}
if (themeid == "ocean") {
  themeEle.href = "/assets/styles/themes/ocean.css?v=1";
}
if (themeid == "sunset") {
  themeEle.href = "/assets/styles/themes/sunset.css?v=1";
}

if (themeEle.href) {
  document.body.appendChild(themeEle);
}
// Global proxy navigation functions
window.go = function (url) {
  // Helper function to safely get cookie value
  function safeCookie(name) {
    if (typeof getCookie === 'function') {
      return getCookie(name);
    } else if (typeof window.getCookie === 'function') {
      return window.getCookie(name);
    } else {
      // Fallback implementation
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    }
  }
  
  // Check performance mode setting with fallbacks
  const performanceMode = safeCookie("performance-mode") === "true" || 
                          localStorage.getItem("performance-mode") === "true";
  
  // Check if we're coming from games or apps page
  const isFromGamesOrApps = window.location.pathname.includes('/games') || 
                            window.location.pathname.includes('/apps');
  
  // Store the URL for the proxy to use
  sessionStorage.setItem("GoUrl", __uv$config.encodeUrl(url));
  
  // If performance mode is disabled (default) and we're launching from games/apps,
  // use the browser interface for better user experience
  if (!performanceMode && isFromGamesOrApps) {
    console.log("Browser mode: Using browser interface for", url);
    window.location.href = "/go";
  } else {
    console.log("Direct mode: Going directly to proxy for", url);
    window.location.href = "/p/" + __uv$config.encodeUrl(url);
  }
};

window.dy = function (url) {
  sessionStorage.setItem("GoUrl", __uv$config.encodeUrl(url));
  window.location.href = "/a/" + __uv$config.encodeUrl(url);
};

// Global theme switching function
window.changeTheme = function (themeId) {
  localStorage.setItem("theme", themeId);
  setCookie("theme", themeId);

  // Remove existing theme links
  const existingThemeLinks = document.querySelectorAll(
    'link[href*="/themes/"]'
  );
  existingThemeLinks.forEach((link) => link.remove());

  // Apply new theme if not default
  if (themeId !== "default") {
    const themeLink = document.createElement("link");
    themeLink.rel = "stylesheet";

    if (themeId.startsWith("catppuccin")) {
      const variant = themeId.replace("catppuccin", "").toLowerCase();
      themeLink.href = `/assets/styles/themes/catppuccin/${variant}.css?v=1`;
    } else {
      themeLink.href = `/assets/styles/themes/${themeId}.css?v=1`;
    }

    document.head.appendChild(themeLink);
  }

  if (window.showNotification) {
    window.showNotification(`Theme changed to ${themeId}`, "success");
  }
};

// Global about:blank toggle function
window.toggleAboutBlank = function (enabled) {
  localStorage.setItem("ab", enabled ? "true" : "false");
  setCookie("ab", enabled ? "true" : "false");

  if (window.showNotification) {
    window.showNotification(
      `About:blank ${enabled ? "enabled" : "disabled"}`,
      "info"
    );
  }
};

// Enhanced about:blank popup function - Manual only, no auto-popup
window.AB = function () {
  let inFrame;
  try {
    inFrame = window !== top;
  } catch (e) {
    inFrame = true;
  }

  // Only allow manual activation, never auto-popup
  if (!inFrame && !navigator.userAgent.includes("Firefox")) {
    // Create popup window with better error handling
    let popup;
    try {
      popup = window.open("about:blank", "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to create popup:", error);
      showNotification("Popup blocked. Please allow popups for this site.", "error");
      return;
    }

    if (!popup || popup.closed) {
      console.log("Popup blocked - please allow popups");
      showNotification("Popup blocked. Please allow popups to use about:blank mode.", "warning");
      return;
    }

    // Wait for popup to be ready
    setTimeout(() => {
      try {
        const doc = popup.document;
        const iframe = doc.createElement("iframe");
        const style = iframe.style;
        const link = doc.createElement("link");

        const name =
          getCookie("name") ||
          localStorage.getItem("name") ||
          "My Drive - Google Drive";
        const icon =
          getCookie("icon") ||
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

        // Redirect to NASA to hide from browser history
        setTimeout(() => {
          window.location.replace("https://www.nasa.gov/");
        }, 500);
      } catch (error) {
        console.error("Error setting up about:blank popup:", error);
        popup.close();
        showNotification("Failed to setup about:blank mode", "error");
      }
    }, 100);
  }
};

// Tab Cloaker
document.addEventListener("DOMContentLoaded", function (event) {
  const icon = document.getElementById("tab-favicon");
  const name = document.getElementById("tab-title");
  const selectedValue = localStorage.getItem("selectedOption");

  function setCloak(nameValue, iconUrl) {
    // Check for custom values in local storage
    const customName = localStorage.getItem("CustomName");
    const customIcon = localStorage.getItem("CustomIcon");

    // If custom values exist, use them. Otherwise, use the provided values.
    if (customName) {
      nameValue = customName;
    }
    if (customIcon) {
      iconUrl = customIcon;
    }

    if (iconUrl) {
      icon.setAttribute("href", iconUrl);
      localStorage.setItem("icon", iconUrl);
    }
    if (nameValue) {
      name.textContent = nameValue;
      localStorage.setItem("name", nameValue);
    }
  }

  const options = {
    Google: { name: "Google", icon: "/assets/media/favicon/google.png" },
    Drive: {
      name: "My Drive - Google Drive",
      icon: "/assets/media/favicon/drive.png",
    },
    Classroom: { name: "Home", icon: "/assets/media/favicon/classroom.png" },
    Schoology: {
      name: "Home | Schoology",
      icon: "/assets/media/favicon/schoology.png",
    },
    Gmail: { name: "Gmail", icon: "/assets/media/favicon/gmail.png" },
    Clever: {
      name: "Clever | Portal",
      icon: "/assets/media/favicon/clever.png",
    },
    Khan: {
      name: "Dashboard | Khan Academy",
      icon: "/assets/media/favicon/khan.png",
    },
    Campus: {
      name: "Infinite Campus",
      icon: "/assets/media/favicon/campus.png",
    },
    IXL: { name: "IXL | Dashboard", icon: "/assets/media/favicon/ixl.png" },
    Canvas: { name: "Dashboard", icon: "/assets/media/favicon/canvas.png" },
    LinkIt: { name: "Test Taker", icon: "/assets/media/favicon/linkit.ico" },
    Edpuzzle: { name: "Edpuzzle", icon: "/assets/media/favicon/edpuzzle.png" },
    "i-Ready Math": {
      name: "Math To Do, i-Ready",
      icon: "/assets/media/favicon/i-ready.ico",
    },
    "i-Ready Reading": {
      name: "Reading To Do, i-Ready",
      icon: "/assets/media/favicon/i-ready.ico",
    },
    "ClassLink Login": {
      name: "Login",
      icon: "/assets/media/favicon/classlink-login.png",
    },
    "Google Meet": {
      name: "Google Meet",
      icon: "/assets/media/favicon/google-meet.png",
    },
    "Google Docs": {
      name: "Google Docs",
      icon: "/assets/media/favicon/google-docs.ico",
    },
    "Google Slides": {
      name: "Google Slides",
      icon: "/assets/media/favicon/google-slides.ico",
    },
    Wikipedia: {
      name: "Wikipedia",
      icon: "/assets/media/favicon/wikipedia.png",
    },
    Britannica: {
      name: "Encyclopedia Britannica | Britannica",
      icon: "/assets/media/favicon/britannica.png",
    },
    Ducksters: {
      name: "Ducksters",
      icon: "/assets/media/favicon/ducksters.png",
    },
    Minga: {
      name: "Minga – Creating Amazing Schools",
      icon: "/assets/media/favicon/minga.png",
    },
    "i-Ready Learning Games": {
      name: "Learning Games, i-Ready",
      icon: "/assets/media/favicon/i-ready.ico",
    },
    "NoRedInk Home": {
      name: "Student Home | NoRedInk",
      icon: "/assets/media/favicon/noredink.webp",
    },
    "Newsela Binder": {
      name: "Newsela | Binder",
      icon: "/assets/media/favicon/newsela.png",
    },
    "Newsela Assignments": {
      name: "Newsela | Assignments",
      icon: "/assets/media/favicon/newsela.png",
    },
    "Newsela Home": {
      name: "Newsela | Instructional Content Platform",
      icon: "/assets/media/favicon/newsela.png",
    },
    "PowerSchool Sign In": {
      name: "Student and Parent Sign In",
      icon: "/assets/media/favicon/powerschool.png",
    },
    "PowerSchool Grades and Attendance": {
      name: "Grades and Attendance",
      icon: "/assets/media/favicon/powerschool.png",
    },
    "PowerSchool Teacher Comments": {
      name: "Teacher Comments",
      icon: "/assets/media/favicon/powerschool.png",
    },
    "PowerSchool Standards Grades": {
      name: "Standards Grades",
      icon: "/assets/media/favicon/powerschool.png",
    },
    "PowerSchool Attendance": {
      name: "Attendance",
      icon: "/assets/media/favicon/powerschool.png",
    },
    Nearpod: { name: "Nearpod", icon: "/assets/media/favicon/nearpod.png" },
    StudentVUE: {
      name: "StudentVUE",
      icon: "/assets/media/favicon/studentvue.ico",
    },
    "Quizlet Home": {
      name: "Flashcards, learning tools and textbook solutions | Quizlet",
      icon: "/assets/media/favicon/quizlet.webp",
    },
    "Google Forms Locked Mode": {
      name: "Start your quiz",
      icon: "/assets/media/favicon/googleforms.png",
    },
    DeltaMath: {
      name: "DeltaMath",
      icon: "/assets/media/favicon/deltamath.png",
    },
    Kami: { name: "Kami", icon: "/assets/media/favicon/kami.png" },
    "GoGuardian Admin Restricted": {
      name: "Restricted",
      icon: "/assets/media/favicon/goguardian-lock.png",
    },
    "GoGuardian Teacher Block": {
      name: "Uh oh!",
      icon: "/assets/media/favicon/goguardian.png",
    },
    "World History Encyclopedia": {
      name: "World History Encyclopedia",
      icon: "/assets/media/favicon/worldhistoryencyclopedia.png",
    },
    "Big Ideas Math Assignment Player": {
      name: "Assignment Player",
      icon: "/assets/media/favicon/bim.ico",
    },
    "Big Ideas Math": {
      name: "Big Ideas Math",
      icon: "/assets/media/favicon/bim.ico",
    },
  };

  if (options[selectedValue]) {
    setCloak(options[selectedValue].name, options[selectedValue].icon);
  }
});
// Key
document.addEventListener("DOMContentLoaded", function () {
  const eventKey = JSON.parse(localStorage.getItem("eventKey")) || [
    "Ctrl",
    "E",
  ];
  const pLink =
    localStorage.getItem("pLink") || "https://classroom.google.com/";
  let pressedKeys = [];

  document.addEventListener("keydown", function (event) {
    pressedKeys.push(event.key);
    if (pressedKeys.length > eventKey.length) {
      pressedKeys.shift();
    }
    if (eventKey.every((key, index) => key === pressedKeys[index])) {
      window.location.href = pLink;
      pressedKeys = [];
    }
  });
});
// Background Image
document.addEventListener("DOMContentLoaded", function () {
  var savedBackgroundImage = localStorage.getItem("backgroundImage");
  if (savedBackgroundImage) {
    document.body.style.backgroundImage = "url('" + savedBackgroundImage + "')";
  }
});
