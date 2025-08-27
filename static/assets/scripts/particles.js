// Simple particle system for SlowGuardian v9
function initParticles() {
  // Check if we're on the browser page
  const isGoPage = window.location.pathname.includes('/go') || window.location.pathname.includes('/p');
  
  // Don't show particles on browser page
  if (isGoPage) {
    return;
  }

  // Check if particles are enabled
  const particlesEnabled = localStorage.getItem("Particles");
  if (particlesEnabled === "false") {
    return;
  }

  // Initialize particles only if container exists
  const particlesContainer = document.getElementById("particles");
  if (!particlesContainer) {
    return;
  }

  // Clear existing particles
  particlesContainer.innerHTML = '';

  // Create particles using simple DOM elements
  for (let i = 0; i < 50; i++) {
    createParticle(particlesContainer);
  }
}

function createParticle(container) {
  const particle = document.createElement('div');
  particle.className = 'particle-dot';
  
  // Random position
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const size = Math.random() * 4 + 2;
  const opacity = Math.random() * 0.6 + 0.2;
  const duration = Math.random() * 20 + 10;
  
  // Style the particle
  particle.style.cssText = `
    position: absolute;
    left: ${x}%;
    top: ${y}%;
    width: ${size}px;
    height: ${size}px;
    background: rgba(79, 70, 229, ${opacity});
    border-radius: 50%;
    pointer-events: none;
    animation: floatParticle ${duration}s linear infinite;
    animation-delay: ${Math.random() * 5}s;
  `;
  
  container.appendChild(particle);
}

// Add CSS animation for particles
function addParticleStyles() {
  if (document.getElementById('particle-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'particle-styles';
  style.textContent = `
    @keyframes floatParticle {
      0% {
        transform: translateY(0px) translateX(0px);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(-100vh) translateX(20px);
        opacity: 0;
      }
    }
    
    .particle-dot {
      z-index: 1;
    }
    
    #particles {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }
  `;
  document.head.appendChild(style);
}

// Initialize particles when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  addParticleStyles();
  initParticles();
});

// Re-initialize particles when page loads
window.addEventListener("load", function() {
  // Small delay to ensure everything is loaded
  setTimeout(initParticles, 100);
});
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
});
