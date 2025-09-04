const iframe = document.getElementById("ifra");

// Enhanced error handling and URL loading
if (!iframe) {
  console.error("Browser iframe not found");
}

// Load URL from sessionStorage when page loads
window.addEventListener("load", function () {
  let GoUrl = sessionStorage.getItem("GoUrl");
  let dyValue = localStorage.getItem("dy");
  const addressInput = document.getElementById("is");

  if (GoUrl && addressInput) {
    // Display the original URL in the address bar
    try {
      // Enhanced Ultraviolet URL decoder
      let decodedUrl = GoUrl;

      console.log("Original encoded URL:", GoUrl);

      // Check if it's already decoded (starts with http)
      if (!decodedUrl.startsWith("http") && !decodedUrl.startsWith("/e/")) {
        // Try Ultraviolet decoding
        if (typeof __uv$config !== "undefined" && __uv$config.decodeUrl) {
          try {
            decodedUrl = __uv$config.decodeUrl(GoUrl);
            console.log("UV decoded URL:", decodedUrl);
          } catch (uvError) {
            console.warn("UV decode failed, using manual decode:", uvError);
            // Fallback to manual decoding
            decodedUrl = manualUrlDecode(GoUrl);
          }
        } else {
          // Manual decoding if UV config not available
          decodedUrl = manualUrlDecode(GoUrl);
        }
      }

      // Clean and display
      if (
        decodedUrl.startsWith("http://") ||
        decodedUrl.startsWith("https://")
      ) {
        addressInput.value = decodedUrl;
        addressInput.setAttribute("title", decodedUrl);
      } else {
        addressInput.value = GoUrl; // Show encoded if decoding failed
      }

      console.log("Final displayed URL:", addressInput.value);
    } catch (error) {
      console.error("URL decode error:", error);
      addressInput.value = GoUrl; // Show encoded URL as fallback
    }
  }

  // Handle iframe loading if URL exists
  if (GoUrl) {
    // Manual URL decoder function
    function manualUrlDecode(encodedUrl) {
      try {
        let decoded = encodedUrl;

        // First URL decode
        decoded = decodeURIComponent(decoded);

        // Apply Ultraviolet character mappings
        decoded = decoded
          .replace(/hvtrs8%2F%2F/g, "https://")
          .replace(/hvtr8%2F%2F/g, "http://")
          .replace(/hvtrs8/g, "https://")
          .replace(/hvtr8/g, "http://")
          .replace(/%2F/g, "/")
          .replace(/%2C/g, ".")
          .replace(/-/g, "/")
          .replace(/,/g, ".");

        // Apply specific character mappings for common patterns
        decoded = decoded
          .replace(/1t1/g, "1v1")
          .replace(/lml/g, "lol")
          .replace(/gmogle/g, "google")
          .replace(/youtybe/g, "youtube");

        // Clean up any extra slashes
        decoded = decoded.replace(/([^:]\/)\/+/g, "$1");

        // Ensure proper protocol
        if (!decoded.startsWith("http://") && !decoded.startsWith("https://")) {
          decoded = "https://" + decoded;
        }

        return decoded;
      } catch (error) {
        console.warn("Manual decode failed:", error);
        return encodedUrl;
      }
    }

    if (!GoUrl.startsWith("/e/")) {
      if (dyValue === "true" || dyValue === "auto") {
        // Use Dynamic proxy encoding
        GoUrl = "/dy/q/" + GoUrl;
        console.log("🔄 Using Dynamic proxy for:", GoUrl);
      } else {
        // Use Ultraviolet proxy encoding
        GoUrl = "/a/" + GoUrl;
        console.log("🔄 Using Ultraviolet proxy for:", GoUrl);
      }
    }
    
    if (iframe) {
      // Function to actually load the URL
      const loadUrl = () => {
        // Show loading indicators
        showLoadingProgress();
        
        // Display status message
        displayProxyStatus("Connecting to proxy server...");

        // Check if ads are enabled and show video ad before loading
        const adsEnabled = getCookie && getCookie("ads-enabled") !== "false";
        const performanceMode =
          getCookie && getCookie("performance-mode") === "true";

        if (adsEnabled && !performanceMode && window.adsManager) {
          console.log("📢 Showing video ad before proxy load...");
          window.adsManager.showProxyVideoAd(GoUrl, (url) => {
            console.log("📢 Video ad completed, loading proxy:", url);
            loadProxyUrl(url);
          });
        } else {
          // Load directly without ad
          console.log("🔧 Loading proxy URL:", GoUrl);
          loadProxyUrl(GoUrl);
        }
      };
      
      // Enhanced proxy URL loading with error handling
      const loadProxyUrl = (url) => {
        displayProxyStatus("Loading website...");
        
        // Set iframe src with error handling
        iframe.onerror = () => {
          console.error("❌ Iframe load error for:", url);
          displayProxyError("Failed to load the website. Please check the URL and try again.");
        };
        
        iframe.onload = () => {
          console.log("✅ Iframe loaded successfully");
          hideProxyStatus();
          hideLoadingProgress();
        };
        
        iframe.src = url;
        
        // Timeout fallback
        setTimeout(() => {
          if (iframe.src === url) {
            hideLoadingProgress();
          }
        }, 10000);
      };

      // Check if service worker is ready
      if (window.uvServiceWorkerReady || window.mainServiceWorkerReady) {
        console.log("🔧 Service worker ready, loading URL immediately");
        loadUrl();
      } else {
        console.log("⏳ Waiting for service worker to be ready...");
        displayProxyStatus("Initializing proxy services...");
        
        window.addEventListener('uvReady', () => {
          console.log("🔧 Service worker now ready, loading URL");
          loadUrl();
        }, { once: true });
        
        // Fallback timeout in case service worker fails
        setTimeout(() => {
          if (!window.uvServiceWorkerReady && !window.mainServiceWorkerReady) {
            console.warn("⚠️ Service worker timeout, attempting to load anyway");
            displayProxyStatus("Service worker timeout - attempting direct load...");
            loadUrl();
          }
        }, 8000);
      }
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
        ind % 2 ? String.fromCharCode(char.charCodeAt(NaN) ^ 2) : char
      )
      .join("") + (search.length ? "?" + search.join("?") : "")
  );
}

// Loading progress indicator
function showLoadingProgress() {
  const loadingBar = document.getElementById("loading-bar");
  const loadingOverlay = document.getElementById("loading-overlay");

  if (loadingBar) {
    loadingBar.classList.add("active");
    loadingBar.style.width = "0%";

    // Animate loading bar
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 95) progress = 95;
      loadingBar.style.width = progress + "%";

      if (progress >= 95) {
        clearInterval(interval);
      }
    }, 200);
  }

  if (loadingOverlay) {
    loadingOverlay.classList.add("active");
  }

  // Activate browserLoading if available
  if (typeof browserLoading !== "undefined") {
    browserLoading.startLoading();
  }
}

// Hide loading indicators
function hideLoadingProgress() {
  const loadingBar = document.getElementById("loading-bar");
  const loadingOverlay = document.getElementById("loading-overlay");

  if (loadingBar) {
    loadingBar.style.width = "100%";
    setTimeout(() => {
      loadingBar.classList.remove("active");
      loadingBar.style.width = "0%";
    }, 300);
  }

  if (loadingOverlay) {
    loadingOverlay.classList.remove("active");
  }

  // Stop browserLoading if available
  if (typeof browserLoading !== "undefined") {
    browserLoading.stopLoading();
  }
}

// Enhanced iframe load handler
function iframeLoad() {
  // Hide loading indicators when page loads
  hideLoadingProgress();

  if (document.readyState === "complete") {
    const website = iframe.contentWindow?.location.href.replace(
      window.location.origin,
      ""
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

    // Redirect main page to NASA to hide from browser history
    setTimeout(() => {
      window.location.replace("https://www.nasa.gov/");
    }, 1000);
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
      document.body.classList.add("fullscreen");
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      document.body.classList.remove("fullscreen");
    }
  } catch (error) {
    console.warn("Fullscreen operation failed:", error);
  }
}

// Enhanced keyboard support and iframe focus
document.addEventListener("keydown", function (e) {
  // Ctrl+L to focus address bar
  if (e.ctrlKey && e.key === "l") {
    e.preventDefault();
    const addressInput = document.getElementById("is");
    if (addressInput) {
      addressInput.focus();
      addressInput.select();
    }
  }

  // F11 for fullscreen
  if (e.key === "F11") {
    e.preventDefault();
    toggleFullscreen();
  }

  // Alt+Left for back navigation
  if (e.altKey && e.key === "ArrowLeft") {
    e.preventDefault();
    goBack();
  }

  // Alt+Right for forward navigation
  if (e.altKey && e.key === "ArrowRight") {
    e.preventDefault();
    goForward();
  }

  // F5 for reload
  if (e.key === "F5") {
    e.preventDefault();
    reload();
  }

  // Focus iframe for game input (when not typing in address bar)
  const addressInput = document.getElementById("is");
  const isTypingInAddressBar =
    addressInput && document.activeElement === addressInput;

  if (!isTypingInAddressBar && iframe && iframe.contentWindow) {
    // For game input, ensure iframe is focused for key events
    // This helps with games that need keyboard input
    try {
      if (
        e.key.length === 1 ||
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
          e.key
        )
      ) {
        iframe.contentWindow.focus();
      }
    } catch (error) {
      // Ignore cross-origin errors
    }
  }
});

// Improve iframe focus when clicked
if (iframe) {
  iframe.addEventListener("click", function () {
    try {
      iframe.contentWindow.focus();
      console.log("Iframe focused for better keyboard input");
    } catch (error) {
      // Ignore cross-origin errors
    }
  });

  // Auto-focus iframe when page loads for game input
  iframe.addEventListener("load", function () {
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        console.log("Iframe auto-focused after load");
      } catch (error) {
        // Ignore cross-origin errors
      }
    }, 1000); // Wait a bit for the game to initialize
  });
}

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
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("fs");
  const input = document.getElementById("is");

  if (form && input) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const value = input.value.trim();
      if (value) {
        console.log("Processing URL from address bar:", value);

        // Show loading indicator
        if (typeof browserLoading !== "undefined") {
          browserLoading.startLoading(value);
        }

        await processUrl(value, "/p");
      }
    });
  }
});

// Process URL function (needed for navigation from address bar)
async function processUrl(value, path) {
  try {
    let url = value.trim();
    const engine = localStorage.getItem("engine");
    const searchUrl = engine ? engine : "https://www.google.com/search?q=";

    if (!isUrl(url)) {
      url = searchUrl + url;
    } else if (!(url.startsWith("https://") || url.startsWith("http://"))) {
      url = "https://" + url;
    }

    // Wait for service worker to be ready
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.ready;
      console.log("Service worker ready for proxy request");
    }

    // Ensure UV config is available
    if (typeof __uv$config !== "undefined" && __uv$config.encodeUrl) {
      const encodedUrl = __uv$config.encodeUrl(url);
      console.log("Encoding URL:", url, "→", encodedUrl);

      sessionStorage.setItem("GoUrl", encodedUrl);

      // Enhanced redirect logic
      const dy = localStorage.getItem("dy");

      if (path) {
        location.href = path;
      } else if (dy === "true") {
        window.location.href = "/a/q/" + encodedUrl;
      } else {
        window.location.href = "/a/" + encodedUrl;
      }
    } else {
      console.error("Ultraviolet config not available");
      // Fallback: store raw URL and redirect
      sessionStorage.setItem("GoUrl", url);
      location.href = path || "/go";
    }
  } catch (error) {
    console.error("Error processing URL:", error);
    // Fallback handling
    sessionStorage.setItem("GoUrl", value);
    location.href = path || "/go";
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
      const overlay = document.querySelector(".overlay");
      if (overlay && GoUrl.includes("now.gg")) {
        overlay.style.display = "flex";
      }

      // Check if ads are enabled and show video ad before loading
      const adsEnabled = getCookie && getCookie("ads-enabled") !== "false";
      const performanceMode =
        getCookie && getCookie("performance-mode") === "true";

      if (adsEnabled && !performanceMode && window.adsManager) {
        console.log("📢 Showing video ad before proxy load (onload)...");
        window.adsManager.showProxyVideoAd(GoUrl, (url) => {
          console.log("📢 Video ad completed, loading proxy (onload):", url);
          iframe.src = url;
        });
      } else {
        // Load directly without ad
        iframe.src = GoUrl;
      }

      // Set up iframe error handling
      iframe.onerror = function () {
        console.error("Failed to load URL in iframe");
        // Could show user-friendly error message
      };

      // Set up iframe load timeout
      const loadTimeout = setTimeout(function () {
        if (overlay && overlay.style.display === "flex") {
          overlay.style.display = "none";
        }
      }, 30000); // 30 second timeout

      iframe.onload = function () {
        clearTimeout(loadTimeout);
        if (overlay) {
          overlay.style.display = "none";
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

// Proxy status display functions
function displayProxyStatus(message) {
  console.log("📋 Status:", message);
  
  // Update loading overlay title if available
  const loadingTitle = document.getElementById('loading-title');
  if (loadingTitle) {
    loadingTitle.textContent = message;
  }
  
  // Update loading tip if available
  const loadingTip = document.getElementById('loading-tip');
  if (loadingTip) {
    loadingTip.textContent = "Please wait while we establish a secure connection...";
  }
}

function hideProxyStatus() {
  console.log("✅ Proxy status cleared");
  
  // Hide loading overlay if available
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.remove('active');
  }
}

function displayProxyError(message) {
  console.error("❌ Proxy Error:", message);
  
  // Update loading overlay with error message
  const loadingTitle = document.getElementById('loading-title');
  if (loadingTitle) {
    loadingTitle.textContent = "Connection Error";
    loadingTitle.style.color = "#ef4444";
  }
  
  const loadingTip = document.getElementById('loading-tip');
  if (loadingTip) {
    loadingTip.textContent = message;
    loadingTip.style.color = "#ef4444";
  }
  
  // Hide loading spinner
  const loadingSpinner = document.querySelector('.loading-spinner');
  if (loadingSpinner) {
    loadingSpinner.style.display = 'none';
  }
  
  // Show error state for a few seconds, then hide
  setTimeout(() => {
    hideProxyStatus();
  }, 5000);
}

function showLoadingProgress() {
  console.log("🔄 Showing loading progress");
  
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.add('active');
  }
  
  const loadingBar = document.getElementById('loading-bar');
  if (loadingBar) {
    loadingBar.classList.add('active');
  }
}

function hideLoadingProgress() {
  console.log("✅ Hiding loading progress");
  
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.remove('active');
  }
  
  const loadingBar = document.getElementById('loading-bar');
  if (loadingBar) {
    loadingBar.classList.remove('active');
  }
}
