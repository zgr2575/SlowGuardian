/**
 * SlowGuardian v9 - Main Homepage Script
 * Updated to use the new proxy system
 */

// Load the new proxy initialization script
(function loadProxyInit() {
  const script = document.createElement('script');
  script.src = '/assets/scripts/proxy-init.js';
  script.onload = () => {
    console.log('✅ Proxy initialization script loaded');
  };
  script.onerror = () => {
    console.error('❌ Failed to load proxy initialization script');
  };
  document.head.appendChild(script);
})();

window.addEventListener("load", async () => {
  try {
    console.log("🚀 SlowGuardian v9 homepage initializing...");

    // Wait for proxy system to be ready with timeout
    const initializeProxy = async () => {
      if (window.slowGuardianProxy) {
        try {
          console.log("Initializing proxy system...");
          const result = await window.slowGuardianProxy.initialize();
          
          if (result) {
            console.log("✅ Proxy system ready");
            
            // Display status for debugging
            const status = window.slowGuardianProxy.getStatus();
            console.log("📊 Proxy status:", status);
          } else {
            console.warn("⚠️ Proxy system initialization completed with warnings");
          }
          
        } catch (error) {
          console.error("❌ Proxy system initialization failed:", error);
          console.warn("⚠️ Continuing without full proxy functionality");
        }
      } else {
        console.warn("⚠️ Proxy system not available");
      }
    };

    // Try to initialize immediately, with fallback
    await initializeProxy();
    
    // If proxy not ready, try again after a delay
    if (!window.slowGuardianProxy) {
      setTimeout(initializeProxy, 2000);
    }

  } catch (error) {
    console.error("❌ Homepage initialization failed:", error);
  }
});

// Form handling for URL submission
const form = document.getElementById("fs");
const input = document.getElementById("is");

if (form && input) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const value = input.value.trim();
    if (value) {
      console.log("Processing URL from home page:", value);
      await processUrl(value, "/go");
    }
  });
}

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

    console.log("Processing URL:", url, "with path:", path);

    // Check for performance mode setting
    const performanceMode =
      getCookie("performance-mode") === "true" ||
      localStorage.getItem("performance-mode") === "true";

    // For games and apps, determine if we should use browser mode or direct mode
    const isFromGamesOrApps =
      window.location.pathname.includes("/games") ||
      window.location.pathname.includes("/apps");

    // If performance mode is enabled and launching from games/apps, skip browser interface
    if (performanceMode && isFromGamesOrApps && !path) {
      console.log("Performance mode: Direct proxy navigation");
      path = null; // This will go directly to the encoded URL
    } else if (isFromGamesOrApps && !performanceMode) {
      console.log("Browser mode: Using browser interface");
      path = path || "/go";
    }

    // Use new proxy system for URL encoding
    if (window.slowGuardianProxy) {
      try {
        await window.slowGuardianProxy.initialize();
        const encodedUrl = window.slowGuardianProxy.encodeUrl(url);
        console.log("New proxy encoding:", url, "→", encodedUrl);
        
        if (path) {
          sessionStorage.setItem("GoUrl", url);
          location.href = path;
        } else {
          location.href = encodedUrl;
        }
        return;
      } catch (proxyError) {
        console.warn("New proxy system failed, falling back:", proxyError);
      }
    }

    // Fallback to old system if new proxy not available
    console.log("Using fallback URL processing...");
    
    // Wait for old UV config as fallback
    let retryCount = 0;
    const maxRetries = 10;

    while (retryCount < maxRetries) {
      if (typeof __uv$config !== "undefined" && __uv$config.encodeUrl) {
        break;
      }
      console.log(`Waiting for UV config... (${retryCount + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, 100));
      retryCount++;
    }

    if (typeof __uv$config !== "undefined" && __uv$config.encodeUrl) {
      const encodedUrl = __uv$config.encodeUrl(url);
      console.log("Fallback encoding:", url, "→", encodedUrl);

      if (path) {
        sessionStorage.setItem("GoUrl", url);
        location.href = path;
      } else {
        location.href = encodedUrl;
      }
    } else {
      console.error("Fallback: No proxy system available");
      sessionStorage.setItem("GoUrl", url);
      location.href = path || "/go";
    }

  } catch (error) {
    console.error("Error processing URL:", error);
    // Final fallback handling
    sessionStorage.setItem("GoUrl", value);
    location.href = path || "/go";
  }
}

function go(value) {
  processUrl(value, "/go");
}

function blank(value) {
  processUrl(value);
}

function dy(value) {
  // Direct navigation using new proxy system
  try {
    let url = value.trim();

    if (!isUrl(url)) {
      const engine =
        localStorage.getItem("engine") || "https://www.google.com/search?q=";
      url = engine + url;
    } else if (!(url.startsWith("https://") || url.startsWith("http://"))) {
      url = "https://" + url;
    }

    // Use new proxy system if available
    if (window.slowGuardianProxy) {
      try {
        const encodedUrl = window.slowGuardianProxy.encodeUrl(url);
        console.log("DY new proxy encoding:", url, "→", encodedUrl);
        sessionStorage.setItem("GoUrl", url);
        window.location.href = encodedUrl;
        return;
      } catch (proxyError) {
        console.warn("DY: New proxy failed, falling back:", proxyError);
      }
    }

    // Fallback to old system
    if (typeof __uv$config !== "undefined" && __uv$config.encodeUrl) {
      const encodedUrl = __uv$config.encodeUrl(url);
      console.log("DY fallback encoding:", url, "→", encodedUrl);
      sessionStorage.setItem("GoUrl", url);
      window.location.href = "/a/" + encodedUrl;
    } else {
      console.error("DY: No proxy system available");
      // Fallback to processUrl
      processUrl(value, "/go");
    }
  } catch (error) {
    console.error("Error in dy function:", error);
    processUrl(value, "/go");
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
