window.addEventListener("load", async () => {
  try {
    // Enhanced service worker registration with comprehensive error handling
    if ("serviceWorker" in navigator) {
      console.log("Registering service worker...");

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("Service worker registered successfully:", registration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log("Service worker is ready");

      // Handle service worker updates
      registration.addEventListener("updatefound", () => {
        console.log("Service worker update found");
      });
    } else {
      console.warn("Service worker not supported");
    }
  } catch (error) {
    console.error("Service worker registration failed:", error);
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

      const dy = localStorage.getItem("dy");

      if (path) {
        location.href = path;
      } else if (dy === "true") {
        window.location.href = "/a/q/" + encodedUrl;
      } else {
        window.location.href = "/a/" + encodedUrl;
      }
    } else {
      console.error("Ultraviolet config not available, waiting...");
      // Wait a bit for config to load
      setTimeout(() => processUrl(value, path), 100);
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
