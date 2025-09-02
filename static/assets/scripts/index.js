window.addEventListener("load", async () => {
  try {
    // Enhanced service worker registration with comprehensive error handling
    if ("serviceWorker" in navigator) {
      console.log("Registering service workers...");

      // Wait a moment for DOM to be fully ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Register Ultraviolet service worker for proxy functionality
      try {
        // Check if UV config is available first
        let uvConfigReady = false;
        for (let i = 0; i < 20; i++) {
          if (typeof __uv$config !== "undefined") {
            uvConfigReady = true;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        if (!uvConfigReady) {
          console.warn(
            "⚠️ UV config not available, UV service worker registration may fail"
          );
        }

        const uvRegistration = await navigator.serviceWorker.register(
          "/a/sw.js",
          {
            scope: "/a/",
            updateViaCache: "none",
          }
        );
        console.log(
          "✅ Ultraviolet service worker registered successfully:",
          uvRegistration
        );
      } catch (uvError) {
        console.error(
          "❌ Failed to register Ultraviolet service worker:",
          uvError
        );
        console.warn(
          "⚠️ Proxy functionality may be limited without UV service worker"
        );
      }

      // Register main service worker for general functionality
      try {
        const mainRegistration = await navigator.serviceWorker.register(
          "/sw.js",
          {
            scope: "/",
            updateViaCache: "none",
          }
        );
        console.log(
          "✅ Main service worker registered successfully:",
          mainRegistration
        );
      } catch (swError) {
        console.warn(
          "⚠️ Main service worker registration failed (non-critical):",
          swError
        );
      }

      // Wait for service worker to be ready with timeout
      try {
        const readyPromise = navigator.serviceWorker.ready;
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Service worker ready timeout")),
            10000
          )
        );

        await Promise.race([readyPromise, timeoutPromise]);
        console.log("✅ Service workers are ready");
      } catch (readyError) {
        console.warn("⚠️ Service worker ready check failed:", readyError);
      }

      // Handle service worker updates
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("Service worker controller changed");
      });
    } else {
      console.warn("⚠️ Service worker not supported");
    }
  } catch (error) {
    console.error("❌ Service worker setup failed:", error);
  }
});

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
      // Skip browser interface and go directly to proxy
      path = null; // This will go directly to the encoded URL
    } else if (isFromGamesOrApps && !performanceMode) {
      console.log("Browser mode: Using browser interface");
      // Force browser interface for games/apps unless performance mode is on
      path = path || "/go";
    }

    // Ensure UV config is available before proceeding
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

    if (typeof __uv$config === "undefined" || !__uv$config.encodeUrl) {
      console.error("Ultraviolet config not available after retries");
      // Fallback: try to load without encoding
      sessionStorage.setItem("GoUrl", url);
      location.href = path || "/go";
      return;
    }

    // Wait for service worker to be ready
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.ready;
        console.log("Service worker ready for proxy request");
      } catch (swError) {
        console.warn("Service worker not ready, proceeding anyway:", swError);
      }
    }

    const encodedUrl = __uv$config.encodeUrl(url);
    console.log("Encoding URL:", url, "→", encodedUrl);

    sessionStorage.setItem("GoUrl", encodedUrl);

    const dy = localStorage.getItem("dy");

    if (path) {
      location.href = path;
    } else if (dy === "true") {
      window.location.href = "/a/q/" + encodedUrl;
    } else {
      window.location.href = "/a/" + encodedUrl;
    }
  } catch (error) {
    console.error("Error processing URL:", error);
    // Fallback handling
    sessionStorage.setItem("GoUrl", value);
    location.href = path || "/go";
  }
}

function go(value) {
  processUrl(value, "/p");
}

function blank(value) {
  processUrl(value);
}

function dy(value) {
  // Direct navigation for Ultraviolet proxy
  try {
    let url = value.trim();

    if (!isUrl(url)) {
      const engine =
        localStorage.getItem("engine") || "https://www.google.com/search?q=";
      url = engine + url;
    } else if (!(url.startsWith("https://") || url.startsWith("http://"))) {
      url = "https://" + url;
    }

    if (typeof __uv$config !== "undefined" && __uv$config.encodeUrl) {
      const encodedUrl = __uv$config.encodeUrl(url);
      console.log("DY encoding URL:", url, "→", encodedUrl);
      sessionStorage.setItem("GoUrl", encodedUrl);
      window.location.href = "/a/" + encodedUrl;
    } else {
      console.error("Ultraviolet config not available for dy function");
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
