const iframe = document.getElementById("ifra");

// Enhanced error handling and URL loading
if (!iframe) {
  console.error("Browser iframe not found");
}

// Load URL from sessionStorage when page loads
window.addEventListener("load", function() {
  let GoUrl = sessionStorage.getItem("GoUrl");
  let dyValue = localStorage.getItem("dy");
  const addressInput = document.getElementById("is");

  if (GoUrl) {
    // Display the original URL in the address bar
    if (addressInput) {
      try {
        // Ultraviolet decoder with character mapping
        let decodedUrl = GoUrl;
        
        // First URL decode
        decodedUrl = decodeURIComponent(decodedUrl);
        
        // Apply Ultraviolet character mappings
        decodedUrl = decodedUrl
          .replace(/hvtrs8/g, 'https://')
          .replace(/hvtr8/g, 'http://')
          .replace(/-/g, '/')
          .replace(/,/g, '.');
        
        // Apply specific character mappings for common patterns
        decodedUrl = decodedUrl.replace(/1t1/g, '1v1').replace(/lml/g, 'lol');
        
        // Clean up any extra slashes
        decodedUrl = decodedUrl.replace(/([^:]\/)\/+/g, '$1');
        
        addressInput.value = decodedUrl;
        console.log('Decoded URL:', decodedUrl);
      } catch (error) {
        // Fallback: show the encoded URL
        console.warn('URL decode error:', error);
        addressInput.value = GoUrl;
      }
    }

    if (!GoUrl.startsWith("/e/")) {
      if (dyValue === "true" || dyValue === "auto") {
        GoUrl = "/a/q/" + GoUrl;
      } else {
        GoUrl = "/a/" + GoUrl;
      }
    }
    console.log("Loading URL:", GoUrl);
    if (iframe) {
      iframe.src = GoUrl;
    }
  } else {
    console.warn("No URL found in sessionStorage");
  }
});

// Browser navigation functions with error handling
function goBack() {
  try {
    if (iframe && iframe.contentWindow && iframe.contentWindow.history) {
      iframe.contentWindow.history.back();
    }
  } catch (error) {
    console.warn("Cannot navigate back:", error);
    if (iframe) {
      // Fallback: reload the current page
      iframe.src = iframe.src;
    }
  }
}

function goForward() {
  try {
    if (iframe && iframe.contentWindow && iframe.contentWindow.history) {
      iframe.contentWindow.history.forward();
    }
  } catch (error) {
    console.warn("Cannot navigate forward:", error);
  }
}

function goHome() {
  window.location.href = "/";
}

// Decode URL function for displaying in address bar
function decodeXor(input) {
  if (!input) return input;
  let [str, ...search] = input.split("?");

  return (
    decodeURIComponent(str)
      .split("")
      .map((char, ind) =>
        ind % 2 ? String.fromCharCode(char.charCodeAt(NaN) ^ 2) : char,
      )
      .join("") + (search.length ? "?" + search.join("?") : "")
  );
}

// Update address bar when iframe loads
function iframeLoad() {
  if (document.readyState === "complete") {
    const website = iframe.contentWindow?.location.href.replace(
      window.location.origin,
      "",
    );

    if (website.includes("/a/")) {
      const website = iframe.contentWindow?.location.href
        .replace(window.location.origin, "")
        .replace("/a/", "");
      const addressInput = document.getElementById("is");
      if (addressInput) {
        addressInput.value = decodeXor(website);
        localStorage.setItem("decoded", decodeXor(website));
      }
    } else if (website.includes("/a/q/")) {
      const website = iframe.contentWindow?.location.href
        .replace(window.location.origin, "")
        .replace("/a/q/", "");
      const addressInput = document.getElementById("is");
      if (addressInput) {
        addressInput.value = decodeXor(website);
        localStorage.setItem("decoded", decodeXor(website));
      }
    }
  }
}

// Reload function
function reload() {
  if (iframe) {
    iframe.src = iframe.src;
  }
}

// Popout function with about:blank window
function popout() {
  const newWindow = window.open("about:blank", "_blank");

  if (newWindow) {
    const name = localStorage.getItem("name") || "My Drive - Google Drive";
    const icon =
      localStorage.getItem("icon") ||
      "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png";

    newWindow.document.title = name;

    const link = newWindow.document.createElement("link");
    link.rel = "icon";
    link.href = encodeURI(icon);
    newWindow.document.head.appendChild(link);

    const newIframe = newWindow.document.createElement("iframe");
    const style = newIframe.style;
    style.position = "fixed";
    style.top = style.bottom = style.left = style.right = 0;
    style.border = style.outline = "none";
    style.width = style.height = "100%";

    newIframe.src = iframe.src;

    newWindow.document.body.appendChild(newIframe);
  }
}

// Eruda debugging toggle
function erudaToggle() {
  if (!iframe) return;

  const erudaWindow = iframe.contentWindow;
  const erudaDocument = iframe.contentDocument;

  if (!erudaWindow || !erudaDocument) return;

  if (erudaWindow.eruda?._isInit) {
    erudaWindow.eruda.destroy();
  } else {
    let script = erudaDocument.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    script.onload = function () {
      if (!erudaWindow) return;
      erudaWindow.eruda.init();
      erudaWindow.eruda.show();
    };
    erudaDocument.head.appendChild(script);
  }
}

// Enhanced fullscreen functionality
function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
      } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
      }
      document.body.classList.add('fullscreen');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      document.body.classList.remove('fullscreen');
    }
  } catch (error) {
    console.warn("Fullscreen operation failed:", error);
  }
}

// Enhanced keyboard support
document.addEventListener('keydown', function(e) {
  // Ctrl+L to focus address bar
  if (e.ctrlKey && e.key === 'l') {
    e.preventDefault();
    const addressInput = document.getElementById('is');
    if (addressInput) {
      addressInput.focus();
      addressInput.select();
    }
  }
  
  // F11 for fullscreen
  if (e.key === 'F11') {
    e.preventDefault();
    toggleFullscreen();
  }
  
  // Alt+Left for back navigation
  if (e.altKey && e.key === 'ArrowLeft') {
    e.preventDefault();
    goBack();
  }
  
  // Alt+Right for forward navigation
  if (e.altKey && e.key === 'ArrowRight') {
    e.preventDefault();
    goForward();
  }
});

// Chrome keyboard lock for better fullscreen experience
if (navigator.userAgent.includes("Chrome")) {
  window.addEventListener("resize", function () {
    try {
      if (navigator.keyboard && navigator.keyboard.lock) {
        navigator.keyboard.lock(["Escape"]);
      }
    } catch (error) {
      console.warn("Keyboard lock failed:", error);
    }
  });
}

// Remove Nav on fullscreen
document.addEventListener("fullscreenchange", function () {
  const isFullscreen = Boolean(document.fullscreenElement);
  document.body.classList.toggle("fullscreen", isFullscreen);
});

// Initialize form handling for the browser address bar
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById("fs");
  const input = document.getElementById("is");

  if (form && input) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      processUrl(input.value, "/p");
    });
  }
});

// Process URL function (needed for navigation from address bar)
function processUrl(value, path) {
  let url = value.trim();
  const engine = localStorage.getItem("engine");
  const searchUrl = engine ? engine : "https://www.google.com/search?q=";

  if (!isUrl(url)) {
    url = searchUrl + url;
  } else if (!(url.startsWith("https://") || url.startsWith("http://"))) {
    url = "https://" + url;
  }

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

function isUrl(val = "") {
  if (
    /^http(s?):\/\//.test(val) ||
    (val.includes(".") && val.substr(0, 1) !== " ")
  )
    return true;
  return false;
}
      }
    } catch (error) {
      console.debug("Keyboard lock not available:", error);
    }
  });
}

// Enhanced iframe loading with error handling
window.onload = function () {
  try {
    let GoUrl = sessionStorage.getItem("GoUrl");
    let dyValue = localStorage.getItem("dy");

    if (GoUrl && !GoUrl.startsWith("/e/")) {
      if (dyValue === "true" || dyValue === "auto") {
        GoUrl = "/a/q/" + GoUrl;
      } else {
        GoUrl = "/a/" + GoUrl;
      }
    }
    
    console.log("Loading URL:", GoUrl);
    
    if (iframe && GoUrl) {
      // Show loading indicator
      const overlay = document.querySelector('.overlay');
      if (overlay && GoUrl.includes('now.gg')) {
        overlay.style.display = 'flex';
      }
      
      iframe.src = GoUrl;
      
      // Set up iframe error handling
      iframe.onerror = function() {
        console.error("Failed to load URL in iframe");
        // Could show user-friendly error message
      };
      
      // Set up iframe load timeout
      const loadTimeout = setTimeout(function() {
        if (overlay && overlay.style.display === 'flex') {
          overlay.style.display = 'none';
        }
      }, 30000); // 30 second timeout
      
      iframe.onload = function() {
        clearTimeout(loadTimeout);
        if (overlay) {
          overlay.style.display = 'none';
        }
        iframeLoad();
      };
    } else if (!GoUrl) {
      console.log("No URL to load, showing homepage");
      // Could redirect to homepage or show empty state
    }
  } catch (error) {
    console.error("Error during iframe initialization:", error);
  }
};

// Decode URL
function decodeXor(input) {
  if (!input) return input;
  let [str, ...search] = input.split("?");

  return (
    decodeURIComponent(str)
      .split("")
      .map((char, ind) =>
        ind % 2 ? String.fromCharCode(char.charCodeAt(NaN) ^ 2) : char
      )
      .join("") + (search.length ? "?" + search.join("?") : "")
  );
}

function iframeLoad() {
  try {
    if (document.readyState === "complete") {
      const addressInput = document.getElementById("is");
      
      if (!iframe || !iframe.contentWindow) {
        console.warn("Iframe or contentWindow not available");
        return;
      }
      
      try {
        const website = iframe.contentWindow.location.href.replace(
          window.location.origin,
          ""
        );

        if (website.includes("/a/")) {
          const cleanWebsite = website.replace("/a/", "");
          const decodedUrl = decodeXor(cleanWebsite);
          
          if (addressInput) {
            addressInput.value = decodedUrl;
          }
          localStorage.setItem("decoded", decodedUrl);
          
          console.log("Decoded URL:", decodedUrl);
        } else if (website.includes("/a/q/")) {
          const cleanWebsite = website.replace("/a/q/", "");
          const decodedUrl = decodeXor(cleanWebsite);
          
          if (addressInput) {
            addressInput.value = decodedUrl;
          }
          localStorage.setItem("decoded", decodedUrl);
          
          console.log("Decoded URL (dynamic):", decodedUrl);
        }
      } catch (crossOriginError) {
        // Cross-origin access is blocked, which is expected for proxied content
        console.debug("Cross-origin access blocked (expected for proxied content)");
        
        // Try to get URL from session storage as fallback
        const storedUrl = sessionStorage.getItem("GoUrl");
        if (storedUrl && addressInput) {
          try {
            const decodedFromStorage = decodeXor(storedUrl);
            addressInput.value = decodedFromStorage;
          } catch (decodeError) {
            console.debug("Could not decode stored URL");
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in iframeLoad:", error);
  }
}

// Enhanced reload function
function reload() {
  try {
    if (iframe) {
      // Store current URL before reload
      const currentSrc = iframe.src;
      iframe.src = "about:blank";
      setTimeout(() => {
        iframe.src = currentSrc;
      }, 100);
    }
  } catch (error) {
    console.error("Error reloading iframe:", error);
  }
}

// Enhanced popout function with better error handling
function popout() {
  try {
    if (!iframe || !iframe.src) {
      console.warn("No content to pop out");
      return;
    }
    
    const newWindow = window.open("", "_blank", "width=1200,height=800");

    if (newWindow) {
      const name = localStorage.getItem("name") || "My Drive - Google Drive";
      const icon =
        localStorage.getItem("icon") ||
        "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png";

      newWindow.document.title = name;

      // Create favicon
      const link = newWindow.document.createElement("link");
      link.rel = "icon";
      link.href = encodeURI(icon);
      newWindow.document.head.appendChild(link);

      // Create iframe
      const newIframe = newWindow.document.createElement("iframe");
      const style = newIframe.style;
      style.position = "fixed";
      style.top = style.bottom = style.left = style.right = 0;
      style.border = style.outline = "none";
      style.width = style.height = "100%";

      newIframe.src = iframe.src;
      newWindow.document.body.appendChild(newIframe);
      
      console.log("Content popped out to new window");
    } else {
      console.warn("Failed to open new window (popup blocked?)");
      alert("Popup was blocked. Please allow popups for this site and try again.");
    }
  } catch (error) {
    console.error("Error opening popout window:", error);
  }
// Enhanced Eruda debugging support
function erudaToggle() {
  try {
    if (!iframe) {
      console.warn("No iframe available for Eruda");
      return;
    }

    const erudaWindow = iframe.contentWindow;
    const erudaDocument = iframe.contentDocument;

    if (!erudaWindow || !erudaDocument) {
      console.warn("Cannot access iframe content for Eruda");
      return;
    }

    if (erudaWindow.eruda?._isInit) {
      erudaWindow.eruda.destroy();
      console.log("Eruda destroyed");
    } else {
      let script = erudaDocument.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/eruda";
      script.onload = function () {
        if (erudaWindow && erudaWindow.eruda) {
          erudaWindow.eruda.init();
          erudaWindow.eruda.show();
          console.log("Eruda initialized and shown");
        }
      };
      script.onerror = function() {
        console.error("Failed to load Eruda");
      };
      erudaDocument.head.appendChild(script);
    }
  } catch (error) {
    console.error("Error with Eruda:", error);
  }
}
// Enhanced event listeners and initialization
document.addEventListener('DOMContentLoaded', function() {
  // Set up fullscreen button
  const fullscreenButton = document.getElementById("fullscreen-button");
  if (fullscreenButton) {
    fullscreenButton.addEventListener("click", toggleFullscreen);
  }

  // Set up home button
  const homeButton = document.getElementById("home-page");
  if (homeButton) {
    homeButton.addEventListener("click", function () {
      window.location.href = "./";
    });
  }

  // Apply saved tab cloaking settings
  const savedTitle = localStorage.getItem("name") || localStorage.getItem("tabTitle");
  const savedIcon = localStorage.getItem("icon") || localStorage.getItem("tabIcon");
  
  if (savedTitle) {
    document.title = savedTitle;
  }
  
  if (savedIcon) {
    const link = document.querySelector('link[rel="shortcut icon"]') || 
                 document.querySelector('link[rel="icon"]');
    if (link) {
      link.href = savedIcon;
    }
  }
});

// Enhanced fullscreen change handling
document.addEventListener("fullscreenchange", function () {
  const isFullscreen = Boolean(document.fullscreenElement);
  document.body.classList.toggle("fullscreen", isFullscreen);
  
  // Update fullscreen button icon
  const fullscreenButton = document.getElementById("fullscreen-button");
  if (fullscreenButton) {
    const icon = fullscreenButton.querySelector('.icon');
    if (icon) {
      icon.textContent = isFullscreen ? '⛗' : '⛶';
    }
  }
});

// Export enhanced functions for global access
window.goBack = goBack;
window.goForward = goForward;
window.reload = reload;
window.popout = popout;
window.erudaToggle = erudaToggle;
window.toggleFullscreen = toggleFullscreen;
window.goHome = goHome;
window.iframeLoad = iframeLoad;


