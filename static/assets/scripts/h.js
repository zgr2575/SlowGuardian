// DISABLED: Auto about:blank execution to prevent spam
// This file previously auto-executed about:blank on load
// Now requires manual activation only to prevent infinite loops

// Manual about:blank function - call with window.createAboutBlank() if needed
window.createAboutBlank = function () {
  let inFrame;

  try {
    inFrame = window !== top;
  } catch (e) {
    inFrame = true;
  }

  if (!inFrame && !navigator.userAgent.includes("Firefox")) {
    try {
      const popup = open("about:blank", "_blank");

      if (!popup || popup.closed) {
        if (typeof window.showNotification === 'function') {
          window.showNotification('⚠️ Please allow popups and redirects in your browser settings.', 'error', 5000);
        } else {
          console.error('Popup blocked. Please allow popups and redirects.');
        }
        return false;
      }

      // Wait a moment for popup to fully open
      setTimeout(() => {
        try {
          const doc = popup.document;

          // Set up basic document structure
          doc.open();
          doc.write('<!DOCTYPE html><html><head></head><body></body></html>');
          doc.close();

          const name = localStorage.getItem("name") || "My Drive - Google Drive";
          const icon = localStorage.getItem("icon") || "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png";

          // Set title and icon
          doc.title = name;
          const link = doc.createElement("link");
          link.rel = "icon";
          link.href = icon;
          doc.head.appendChild(link);

          // Create and configure iframe
          const iframe = doc.createElement("iframe");
          iframe.style.cssText = "position:fixed;top:0;bottom:0;left:0;right:0;border:none;outline:none;width:100%;height:100%";
          iframe.src = location.href;

          // Add loading indicator
          const loadingDiv = doc.createElement("div");
          loadingDiv.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-family:Arial,sans-serif;color:#666;";
          loadingDiv.textContent = "Loading...";
          doc.body.appendChild(loadingDiv);

          // Remove loading indicator when iframe loads
          iframe.onload = () => {
            if (loadingDiv.parentNode) {
              loadingDiv.remove();
            }
          };

          doc.body.appendChild(iframe);

          // Add unload confirmation
          const script = doc.createElement("script");
          script.textContent = `
            window.onbeforeunload = function (event) {
              const confirmationMessage = 'Leave Site?';
              (event || window.event).returnValue = confirmationMessage;
              return confirmationMessage;
            };
          `;
          doc.head.appendChild(script);

          // Redirect parent window
          const pLink = localStorage.getItem(encodeURI("pLink")) || "https://www.nasa.gov/";
          setTimeout(() => {
            location.replace(pLink);
          }, 100);

          return true;
        } catch (err) {
          console.error('Error setting up about:blank cloaking:', err);
          if (typeof window.showNotification === 'function') {
            window.showNotification('❌ Failed to set up tab cloaking. Try again.', 'error', 5000);
          }
          popup.close();
          return false;
        }
      }, 100);

    } catch (err) {
      console.error('Error opening about:blank popup:', err);
      if (typeof window.showNotification === 'function') {
        window.showNotification('❌ Could not open popup. Check your browser settings.', 'error', 5000);
      }
      return false;
    }
  }

  return false;
};
// Particles
document.addEventListener("DOMContentLoaded", function (event) {
  if (window.localStorage.getItem("Particles") === "true") {
    var particlesConfig = {
      particles: {
        number: {
          value: 200,
          density: {
            enable: true,
            value_area: 600,
          },
        },
        color: {
          value: "#ffffff",
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#000000",
          },
          polygon: {
            nb_sides: 5,
          },
          image: {
            src: "img/github.svg",
            width: 100,
            height: 100,
          },
        },
        opacity: {
          value: 1,
          random: true,
          anim: {
            enable: false,
            speed: 1,
            opacity_min: 0.1,
            sync: false,
          },
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: false,
            speed: 40,
            size_min: 0.1,
            sync: false,
          },
        },
        line_linked: {
          enable: false,
          distance: 150,
          color: "#ffffff",
          opacity: 0.4,
          width: 1,
        },
        move: {
          enable: true,
          speed: 2,
          direction: "bottom",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200,
          },
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "repulse",
          },
          onclick: {
            enable: false,
            mode: "push",
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 400,
            line_linked: {
              opacity: 1,
            },
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3,
          },
          repulse: {
            distance: 40,
            duration: 0.4,
          },
          push: {
            particles_nb: 4,
          },
          remove: {
            particles_nb: 2,
          },
        },
      },
      retina_detect: true,
    };
    particlesJS("particles-js", particlesConfig);
  }
});
// Splash
let SplashT = ["SlowGuardian will be back next year!"];

let SplashI = Math.floor(Math.random() * SplashT.length);
const SplashE = document.getElementById("splash");

function US() {
  SplashI = (SplashI + 1) % SplashT.length;
  SplashE.innerText = SplashT[SplashI];
}

SplashE.innerText = SplashT[SplashI];

SplashE.addEventListener("click", US);
