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
    const particle = {
      element: this.createElement(),
      x: random.float(0, this.container.offsetWidth),
      y: random.float(
        this.container.offsetHeight,
        this.container.offsetHeight + 100
      ),
      vx: random.float(-0.5, 0.5),
      vy: random.float(-2, -0.5),
      life: 1,
      decay: random.float(0.005, 0.015),
      size: random.float(2, 6),
      color: this.getRandomColor(),
    };

    particle.element.style.left = particle.x + "px";
    particle.element.style.top = particle.y + "px";
    particle.element.style.width = particle.size + "px";
    particle.element.style.height = particle.size + "px";
    particle.element.style.backgroundColor = particle.color;

    this.container.appendChild(particle.element);
    this.particles.push(particle);

    return particle;
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
    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Update life
    particle.life -= particle.decay;

    // Apply physics
    particle.vy += 0.01; // gravity
    particle.vx += random.float(-0.01, 0.01); // turbulence

    // Update DOM element
    particle.element.style.left = particle.x + "px";
    particle.element.style.top = particle.y + "px";
    particle.element.style.opacity = particle.life;

    // Check if particle should be removed
    if (
      particle.life <= 0 ||
      particle.y < -50 ||
      particle.x < -50 ||
      particle.x > this.container.offsetWidth + 50
    ) {
      return false;
    }

    return true;
  }

  animate() {
    if (!this.isRunning) return;

    // Update existing particles
    this.particles = this.particles.filter((particle) => {
      const shouldKeep = this.updateParticle(particle);
      if (!shouldKeep) {
        particle.element.remove();
      }
      return shouldKeep;
    });

    // Create new particles
    while (this.particles.length < this.maxParticles) {
      this.createParticle();
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
    super(container);
    this.mouse = { x: 0, y: 0 };
    this.mouseInfluence = 50;
    this.setupMouseEvents();
  }

  setupMouseEvents() {
    this.container.addEventListener("mousemove", (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.container.addEventListener("mouseleave", () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });
  }

  updateParticle(particle) {
    // Check if particle is valid
    if (
      !particle ||
      typeof particle.x !== "number" ||
      typeof particle.y !== "number"
    ) {
      return;
    }

    // Calculate distance to mouse
    const dx = this.mouse.x - particle.x;
    const dy = this.mouse.y - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Apply mouse influence
    if (distance < this.mouseInfluence) {
      const force = (this.mouseInfluence - distance) / this.mouseInfluence;
      particle.vx += (dx / distance) * force * 0.1;
      particle.vy += (dy / distance) * force * 0.1;
    }

    return super.updateParticle(particle);
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
  // Check for reduced motion preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  let system;

  switch (type) {
    case "interactive":
      system = new InteractiveParticleSystem(container);
      break;
    case "constellation":
      system = new ConstellationSystem(container);
      break;
    case "floating":
    default:
      system = new ParticleSystem(container);
      break;
  }

  // Handle window resize
  window.addEventListener("resize", () => {
    system.resize();
  });

  return system;
};

// Export classes for advanced usage
export { ParticleSystem, InteractiveParticleSystem, ConstellationSystem };
