/**
 * Particle system for SlowGuardian v9 background
 */

import { random } from "./utils.js";

class ParticleSystem {
  constructor(container) {
    this.container = container;
    this.particles = [];
    this.maxParticles = 50;
    this.isRunning = false;
    this.animationId = null;

    this.init();
  }

  init() {
    this.container.style.position = "relative";
    this.container.style.overflow = "hidden";

    // Create initial particles
    for (let i = 0; i < this.maxParticles; i++) {
      this.createParticle();
    }

    this.start();
  }

  createParticle() {
    try {
      // Ensure container dimensions are available
      const containerWidth = this.container ? (this.container.offsetWidth || 1000) : 1000;
      const containerHeight = this.container ? (this.container.offsetHeight || 800) : 800;

      const particle = {
        element: this.createElement(),
        x: random.float(0, containerWidth) || 0,
        y: random.float(containerHeight, containerHeight + 100) || containerHeight,
        vx: random.float(-0.5, 0.5) || 0,
        vy: random.float(-2, -0.5) || -1,
        life: 1,
        decay: random.float(0.005, 0.015) || 0.01,
        size: random.float(2, 6) || 3,
        color: this.getRandomColor(),
      };

      // Comprehensive validation for particle properties
      if (
        !particle.element ||
        typeof particle.x !== "number" ||
        typeof particle.y !== "number" ||
        typeof particle.vx !== "number" ||
        typeof particle.vy !== "number" ||
        typeof particle.life !== "number" ||
        typeof particle.decay !== "number" ||
        typeof particle.size !== "number" ||
        isNaN(particle.x) ||
        isNaN(particle.y) ||
        isNaN(particle.vx) ||
        isNaN(particle.vy) ||
        isNaN(particle.life) ||
        isNaN(particle.decay) ||
        isNaN(particle.size) ||
        !isFinite(particle.x) ||
        !isFinite(particle.y) ||
        !isFinite(particle.vx) ||
        !isFinite(particle.vy) ||
        !isFinite(particle.life) ||
        !isFinite(particle.decay) ||
        !isFinite(particle.size) ||
        !particle.color
      ) {
        console.warn("Invalid particle created, skipping:", particle);
        if (particle.element && particle.element.remove) {
          particle.element.remove();
        }
        return null;
      }

      // Apply initial styling with validation
      if (particle.element && particle.element.style) {
        particle.element.style.left = particle.x + "px";
        particle.element.style.top = particle.y + "px";
        particle.element.style.width = particle.size + "px";
        particle.element.style.height = particle.size + "px";
        particle.element.style.backgroundColor = particle.color;

        if (this.container) {
          this.container.appendChild(particle.element);
        }
        this.particles.push(particle);
      } else {
        console.warn("Failed to create particle element");
        return null;
      }

      return particle;
    } catch (error) {
      console.warn("Error creating particle:", error);
      return null;
    }
  }

  createElement() {
    const element = document.createElement("div");
    element.className = "particle";
    element.style.position = "absolute";
    element.style.borderRadius = "50%";
    element.style.pointerEvents = "none";
    element.style.transition = "opacity 0.3s ease";
    return element;
  }

  getRandomColor() {
    const colors = [
      "rgba(255, 255, 255, 0.3)",
      "rgba(79, 70, 229, 0.4)",
      "rgba(124, 58, 237, 0.4)",
      "rgba(6, 182, 212, 0.3)",
      "rgba(16, 185, 129, 0.3)",
    ];
    return random.choice(colors);
  }

  updateParticle(particle) {
    // Comprehensive validation for particle object
    if (
      !particle ||
      particle === null ||
      typeof particle !== "object" ||
      !particle.hasOwnProperty('x') ||
      !particle.hasOwnProperty('y') ||
      !particle.hasOwnProperty('vx') ||
      !particle.hasOwnProperty('vy') ||
      !particle.hasOwnProperty('life') ||
      !particle.hasOwnProperty('decay') ||
      typeof particle.x !== "number" ||
      typeof particle.y !== "number" ||
      typeof particle.vx !== "number" ||
      typeof particle.vy !== "number" ||
      typeof particle.life !== "number" ||
      typeof particle.decay !== "number" ||
      isNaN(particle.x) ||
      isNaN(particle.y) ||
      isNaN(particle.vx) ||
      isNaN(particle.vy) ||
      isNaN(particle.life) ||
      isNaN(particle.decay) ||
      !particle.element
    ) {
      console.warn("Invalid particle detected in base update:", particle);
      return false; // Remove invalid particle
    }

    try {
      // Update position with bounds checking
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Validate new position
      if (isNaN(particle.x) || isNaN(particle.y) || !isFinite(particle.x) || !isFinite(particle.y)) {
        console.warn("Invalid particle position after update:", { x: particle.x, y: particle.y });
        return false;
      }

      // Update life
      particle.life -= particle.decay;

      // Validate life value
      if (isNaN(particle.life) || !isFinite(particle.life)) {
        console.warn("Invalid particle life after update:", particle.life);
        return false;
      }

      // Apply physics with validation
      const gravityValue = random.float(-0.01, 0.01);
      const turbulenceValue = random.float(-0.01, 0.01);
      
      if (!isNaN(gravityValue) && isFinite(gravityValue)) {
        particle.vy += 0.01; // gravity
      }
      if (!isNaN(turbulenceValue) && isFinite(turbulenceValue)) {
        particle.vx += turbulenceValue; // turbulence
      }

      // Ensure velocities stay within reasonable bounds
      particle.vx = Math.max(-10, Math.min(10, particle.vx));
      particle.vy = Math.max(-10, Math.min(10, particle.vy));

      // Update DOM element with safety checks
      if (particle.element && particle.element.style) {
        particle.element.style.left = particle.x + "px";
        particle.element.style.top = particle.y + "px";
        particle.element.style.opacity = Math.max(0, Math.min(1, particle.life));
      } else {
        console.warn("Particle missing DOM element:", particle);
        return false;
      }

      // Check if particle should be removed
      const containerWidth = this.container ? this.container.offsetWidth : 1000;
      if (
        particle.life <= 0 ||
        particle.y < -50 ||
        particle.x < -50 ||
        particle.x > containerWidth + 50
      ) {
        return false;
      }

      return true;
    } catch (error) {
      console.warn("Error updating particle:", error);
      return false;
    }
  }

  animate() {
    if (!this.isRunning) return;

    // Update existing particles with enhanced safety
    this.particles = this.particles.filter((particle) => {
      // Skip null/undefined particles
      if (!particle || typeof particle !== "object") {
        return false;
      }

      try {
        const shouldKeep = this.updateParticle(particle);
        if (!shouldKeep && particle.element && particle.element.remove) {
          particle.element.remove();
        }
        return shouldKeep;
      } catch (error) {
        console.warn("Error updating particle:", error);
        // Remove problematic particle
        if (particle.element && particle.element.remove) {
          particle.element.remove();
        }
        return false;
      }
    });

    // Create new particles
    while (this.particles.length < this.maxParticles) {
      try {
        this.createParticle();
      } catch (error) {
        console.warn("Error creating particle:", error);
        break; // Stop creating particles if there's an error
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();
    this.particles.forEach((particle) => {
      particle.element.remove();
    });
    this.particles = [];
  }

  resize() {
    // Adjust particle positions for new container size
    this.particles.forEach((particle) => {
      if (particle.x > this.container.offsetWidth) {
        particle.x = this.container.offsetWidth;
      }
    });
  }

  setParticleCount(count) {
    this.maxParticles = Math.max(0, Math.min(200, count));

    // Remove excess particles
    while (this.particles.length > this.maxParticles) {
      const particle = this.particles.pop();
      particle.element.remove();
    }
  }

  setSpeed(multiplier) {
    this.particles.forEach((particle) => {
      particle.vy *= multiplier;
      particle.vx *= multiplier;
    });
  }
}

// Enhanced particle system with mouse interaction
class InteractiveParticleSystem extends ParticleSystem {
  constructor(container) {
    // Validate container before calling super
    if (!container) {
      throw new Error("Container is required for InteractiveParticleSystem");
    }

    // Call super constructor first
    super(container);

    try {
      // Initialize mouse after super constructor
      this.mouse = { x: -1000, y: -1000 };
      this.mouseInfluence = 50;

      // Setup mouse events after parent initialization with error handling
      this.setupMouseEvents();
    } catch (error) {
      console.error("Failed to initialize InteractiveParticleSystem post-super:", error);
      // Fallback to basic functionality
      this.mouse = { x: -1000, y: -1000 };
      this.mouseInfluence = 0; // Disable mouse influence if initialization fails
    }
  }

  setupMouseEvents() {
    try {
      if (!this.container || !this.container.addEventListener) {
        console.warn("Invalid container for mouse events");
        return;
      }

      this.container.addEventListener("mousemove", (e) => {
        try {
          if (!e || !this.container) return;
          
          const rect = this.container.getBoundingClientRect();
          if (!rect) return;
          
          const newX = e.clientX - rect.left;
          const newY = e.clientY - rect.top;
          
          // Validate mouse coordinates
          if (!isNaN(newX) && !isNaN(newY) && isFinite(newX) && isFinite(newY)) {
            this.mouse.x = newX;
            this.mouse.y = newY;
          }
        } catch (error) {
          console.warn("Error in mousemove handler:", error);
        }
      });

      this.container.addEventListener("mouseleave", () => {
        try {
          this.mouse.x = -1000;
          this.mouse.y = -1000;
        } catch (error) {
          console.warn("Error in mouseleave handler:", error);
        }
      });
    } catch (error) {
      console.warn("Failed to setup mouse events:", error);
    }
  }

  updateParticle(particle) {
    // Comprehensive validation for particle object
    if (
      !particle ||
      particle === null ||
      typeof particle !== "object" ||
      !particle.hasOwnProperty('x') ||
      !particle.hasOwnProperty('y') ||
      typeof particle.x !== "number" ||
      typeof particle.y !== "number" ||
      isNaN(particle.x) ||
      isNaN(particle.y) ||
      !particle.hasOwnProperty('vx') ||
      !particle.hasOwnProperty('vy') ||
      typeof particle.vx !== "number" ||
      typeof particle.vy !== "number" ||
      isNaN(particle.vx) ||
      isNaN(particle.vy)
    ) {
      console.warn("Invalid particle detected and removed:", particle);
      return false; // Remove invalid particle
    }

    // Ensure mouse is initialized with defensive checks
    if (!this.mouse || typeof this.mouse !== "object") {
      this.mouse = { x: -1000, y: -1000 };
    }
    if (typeof this.mouse.x !== "number" || isNaN(this.mouse.x)) {
      this.mouse.x = -1000;
    }
    if (typeof this.mouse.y !== "number" || isNaN(this.mouse.y)) {
      this.mouse.y = -1000;
    }

    // Calculate distance to mouse with enhanced safety checks
    try {
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      
      // Validate calculated values
      if (isNaN(dx) || isNaN(dy) || !isFinite(dx) || !isFinite(dy)) {
        console.warn("Invalid distance calculation, skipping mouse influence");
        return super.updateParticle(particle);
      }
      
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Apply mouse influence only if distance is valid
      if (distance < this.mouseInfluence && !isNaN(distance) && isFinite(distance) && distance > 0) {
        const force = (this.mouseInfluence - distance) / this.mouseInfluence;
        if (!isNaN(force) && isFinite(force)) {
          const forceX = (dx / distance) * force * 0.1;
          const forceY = (dy / distance) * force * 0.1;
          
          // Validate force values before applying
          if (!isNaN(forceX) && !isNaN(forceY) && isFinite(forceX) && isFinite(forceY)) {
            particle.vx += forceX;
            particle.vy += forceY;
            
            // Ensure velocity stays within reasonable bounds
            particle.vx = Math.max(-10, Math.min(10, particle.vx));
            particle.vy = Math.max(-10, Math.min(10, particle.vy));
          }
        }
      }
    } catch (error) {
      console.warn("Error in mouse influence calculation:", error);
      // Don't return false here, just skip mouse influence and continue with base update
    }

    // Call parent update method with additional safety
    try {
      return super.updateParticle(particle);
    } catch (error) {
      console.warn("Error in base particle update:", error);
      return false;
    }
  }
}

// Constellation particle system
class ConstellationSystem {
  constructor(container) {
    this.container = container;
    this.particles = [];
    this.connections = [];
    this.maxParticles = 30;
    this.connectionDistance = 150;
    this.isRunning = false;
    this.animationId = null;

    this.init();
  }

  init() {
    this.container.style.position = "relative";
    this.container.style.overflow = "hidden";

    // Create particles
    for (let i = 0; i < this.maxParticles; i++) {
      this.createParticle();
    }

    this.start();
  }

  createParticle() {
    const particle = {
      x: random.float(0, this.container.offsetWidth),
      y: random.float(0, this.container.offsetHeight),
      vx: random.float(-0.5, 0.5),
      vy: random.float(-0.5, 0.5),
      size: random.float(2, 4),
      opacity: random.float(0.3, 0.8),
    };

    this.particles.push(particle);
    return particle;
  }

  updateParticle(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Bounce off edges
    if (particle.x <= 0 || particle.x >= this.container.offsetWidth) {
      particle.vx *= -1;
    }
    if (particle.y <= 0 || particle.y >= this.container.offsetHeight) {
      particle.vy *= -1;
    }

    // Keep within bounds
    particle.x = Math.max(0, Math.min(this.container.offsetWidth, particle.x));
    particle.y = Math.max(0, Math.min(this.container.offsetHeight, particle.y));
  }

  findConnections() {
    this.connections = [];

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.connectionDistance) {
          this.connections.push({
            p1,
            p2,
            distance,
            opacity:
              ((this.connectionDistance - distance) / this.connectionDistance) *
              0.3,
          });
        }
      }
    }
  }

  draw() {
    // Clear canvas
    this.container.innerHTML = "";

    // Create SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";

    // Draw connections
    this.connections.forEach((connection) => {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", connection.p1.x);
      line.setAttribute("y1", connection.p1.y);
      line.setAttribute("x2", connection.p2.x);
      line.setAttribute("y2", connection.p2.y);
      line.setAttribute(
        "stroke",
        "rgba(79, 70, 229, " + connection.opacity + ")"
      );
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
    });

    // Draw particles
    this.particles.forEach((particle) => {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", particle.x);
      circle.setAttribute("cy", particle.y);
      circle.setAttribute("r", particle.size);
      circle.setAttribute(
        "fill",
        "rgba(255, 255, 255, " + particle.opacity + ")"
      );
      svg.appendChild(circle);
    });

    this.container.appendChild(svg);
  }

  animate() {
    if (!this.isRunning) return;

    this.particles.forEach((particle) => {
      this.updateParticle(particle);
    });

    this.findConnections();
    this.draw();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();
    this.container.innerHTML = "";
  }

  resize() {
    // Adjust particles for new container size
    this.particles.forEach((particle) => {
      particle.x = Math.min(particle.x, this.container.offsetWidth);
      particle.y = Math.min(particle.y, this.container.offsetHeight);
    });
  }
}

// Initialize particle system based on user preference
export const initParticles = (container, type = "floating") => {
  try {
    // Validate container element
    if (!container) {
      console.warn("No container provided for particle system");
      return null;
    }

    // Check for reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      console.log("Particles disabled due to reduced motion preference");
      return null;
    }

    let system;

    switch (type) {
      case "interactive":
        try {
          system = new InteractiveParticleSystem(container);
        } catch (error) {
          console.warn("Failed to create InteractiveParticleSystem, falling back to basic:", error);
          system = new ParticleSystem(container);
        }
        break;
      case "constellation":
        try {
          system = new ConstellationSystem(container);
        } catch (error) {
          console.warn("Failed to create ConstellationSystem, falling back to basic:", error);
          system = new ParticleSystem(container);
        }
        break;
      case "floating":
      default:
        system = new ParticleSystem(container);
        break;
    }

    if (!system) {
      console.warn("Failed to create any particle system");
      return null;
    }

    // Handle window resize with error protection
    const resizeHandler = () => {
      try {
        if (system && typeof system.resize === 'function') {
          system.resize();
        }
      } catch (error) {
        console.warn("Error during particle system resize:", error);
      }
    };

    window.addEventListener("resize", resizeHandler);

    console.log(`✨ Particle system initialized: ${type}`);
    return system;
  } catch (error) {
    console.error("Critical error initializing particle system:", error);
    return null;
  }
};

// Export classes for advanced usage
export { ParticleSystem, InteractiveParticleSystem, ConstellationSystem };
