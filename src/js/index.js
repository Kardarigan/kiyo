// ============================================================
// SPLASH PAGE CONTROLLER
// Full working candle + blood + typewriter + transition
// ============================================================

(function () {
  "use strict";

  // ----- TYPEWRITER EFFECT -----
  class SplashTypewriter {
    constructor(element, options = {}) {
      this.element = element;
      this.text =
        options.text || element.dataset.text || element.textContent || "";
      this.speed = options.speed || 60;
      this.delay = options.delay || 0;
      this.onComplete = options.onComplete || null;
      this.currentIndex = 0;
      this.isTyping = false;
    }

    async start() {
      this.isTyping = true;
      this.element.textContent = "";
      this.currentIndex = 0;

      await this.wait(this.delay);

      return new Promise((resolve) => {
        this.resolve = resolve;
        this.type();
      });
    }

    type() {
      if (!this.isTyping) return;

      if (this.currentIndex < this.text.length) {
        this.element.textContent += this.text.charAt(this.currentIndex);
        this.currentIndex++;
        setTimeout(() => this.type(), this.speed + Math.random() * 40);
      } else {
        this.isTyping = false;
        if (this.onComplete) this.onComplete();
        if (this.resolve) this.resolve();
      }
    }

    stop() {
      this.isTyping = false;
    }

    wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  }

  // ----- BLOOD SPLASH EFFECT -----
  class SplashBlood {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.particles = [];
      this.isPlaying = false;
      this.radius = 0;
      this.opacity = 0;
      this.onComplete = null;

      this.resize();
      window.addEventListener("resize", () => this.resize());
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    async play() {
      this.isPlaying = true;
      this.radius = 0;
      this.opacity = 0;
      this.particles = [];

      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;

      for (let i = 0; i < 200; i++) {
        this.particles.push({
          x: centerX,
          y: centerY,
          angle: Math.random() * Math.PI * 2,
          speed: 2 + Math.random() * 8,
          size: 1 + Math.random() * 4,
          life: 1,
          decay: 0.005 + Math.random() * 0.02,
        });
      }

      return new Promise((resolve) => {
        this.onComplete = resolve;
        this.animate();
      });
    }

    animate() {
      if (!this.isPlaying) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      const maxRadius = Math.max(this.canvas.width, this.canvas.height) * 0.8;

      // Phase 1: Radial spread
      if (this.radius < maxRadius) {
        this.radius += 15;
        this.opacity = Math.min(this.opacity + 0.03, 0.9);

        const gradient = this.ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          this.radius
        );
        gradient.addColorStop(0, "#6b0f0f");
        gradient.addColorStop(0.6, "#4a0808");
        gradient.addColorStop(1, "transparent");

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Phase 2: Particles
      let aliveParticles = false;
      this.particles.forEach((p) => {
        if (p.life <= 0) return;
        aliveParticles = true;

        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.life -= p.decay;
        p.speed *= 0.98;

        this.ctx.fillStyle = `rgba(139, 0, 0, ${Math.max(0, p.life)})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      });

      if (this.radius < maxRadius || aliveParticles) {
        requestAnimationFrame(() => this.animate());
      } else {
        this.isPlaying = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.onComplete) this.onComplete();
      }
    }

    destroy() {
      this.isPlaying = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  // ----- CANDLE FLAME (2D Canvas - More Reliable) -----
  class CandleFlame {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.isActive = true;
      this.time = 0;
      this.intensity = 1;
      this.animationId = null;

      this.resize();
      window.addEventListener("resize", () => this.resize());
    }

    resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      this.width = rect.width;
      this.height = rect.height;
    }

    startAnimation() {
      if (this.animationId) return;
      this.animate();
    }

    animate() {
      if (!this.isActive) return;
      this.time += 0.016;

      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      ctx.clearRect(0, 0, w, h);

      // Only render if intensity > 0
      if (this.intensity > 0.01) {
        const cx = w / 2;
        const cy = h / 2 + 20;

        // Flicker
        const flicker =
          1 + Math.sin(this.time * 8) * 0.05 + Math.sin(this.time * 13) * 0.03;
        const flicker2 = 1 + Math.sin(this.time * 6 + 1) * 0.04;

        // Outer glow
        const gradient = ctx.createRadialGradient(
          cx,
          cy - 20,
          2,
          cx,
          cy - 10,
          80 * this.intensity * flicker
        );
        gradient.addColorStop(
          0,
          `rgba(255, 180, 50, ${0.3 * this.intensity * flicker2})`
        );
        gradient.addColorStop(
          0.3,
          `rgba(255, 120, 30, ${0.15 * this.intensity * flicker2})`
        );
        gradient.addColorStop(1, "rgba(255, 80, 20, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy - 20, 80 * this.intensity * flicker, 0, Math.PI * 2);
        ctx.fill();

        // Inner flame
        const innerGrad = ctx.createRadialGradient(
          cx - 5 * flicker2,
          cy - 30 * flicker,
          2,
          cx,
          cy - 25 * flicker,
          35 * this.intensity * flicker
        );
        innerGrad.addColorStop(
          0,
          `rgba(255, 255, 200, ${0.9 * this.intensity})`
        );
        innerGrad.addColorStop(
          0.3,
          `rgba(255, 200, 100, ${0.8 * this.intensity})`
        );
        innerGrad.addColorStop(
          0.7,
          `rgba(255, 120, 40, ${0.6 * this.intensity})`
        );
        innerGrad.addColorStop(1, `rgba(200, 60, 20, ${0.3 * this.intensity})`);

        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        const flameW = 18 * this.intensity * flicker;
        const flameH = 50 * this.intensity * flicker;
        ctx.ellipse(
          cx - 3 * flicker2,
          cy - 25 * flicker,
          flameW,
          flameH,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Core (white-hot)
        const coreGrad = ctx.createRadialGradient(
          cx - 2 * flicker2,
          cy - 35 * flicker,
          2,
          cx,
          cy - 30 * flicker,
          12 * this.intensity
        );
        coreGrad.addColorStop(
          0,
          `rgba(255, 255, 255, ${0.5 * this.intensity})`
        );
        coreGrad.addColorStop(
          1,
          `rgba(255, 220, 150, ${0.2 * this.intensity})`
        );

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.ellipse(
          cx - 2 * flicker2,
          cy - 30 * flicker,
          8 * this.intensity,
          20 * this.intensity,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      this.animationId = requestAnimationFrame(() => this.animate());
    }

    extinguish() {
      const fade = () => {
        this.intensity -= 0.03;
        if (this.intensity > 0) {
          setTimeout(fade, 30);
        } else {
          this.intensity = 0;
          this.isActive = false;
          if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
          }
          this.ctx.clearRect(0, 0, this.width, this.height);
        }
      };
      fade();
    }

    destroy() {
      this.isActive = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
  }

  // ----- MAIN CONTROLLER -----
  document.addEventListener("DOMContentLoaded", async () => {
    const candleCanvas = document.getElementById("candle-canvas");
    const warningBox = document.getElementById("warning-box");
    const understandBtn = document.getElementById("understand-btn");
    const bloodCanvas = document.getElementById("blood-canvas");
    const transitionOverlay = document.getElementById("transition-overlay");
    const typewriterLines = document.querySelectorAll(".splash-line");

    let candleFlame = null;
    let bloodEffect = null;

    // Initialize candle
    if (candleCanvas) {
      candleFlame = new CandleFlame(candleCanvas);
      candleFlame.startAnimation();
    }

    // Initialize blood effect
    if (bloodCanvas) {
      bloodEffect = new SplashBlood(bloodCanvas);
    }

    // Start typewriter on each line with delay
    const line1 = typewriterLines[0];
    const line2 = typewriterLines[1];
    const line3 = typewriterLines[2];

    if (line1) {
      const tw1 = new SplashTypewriter(line1, {
        text: line1.dataset.text || line1.textContent,
        speed: 50,
        delay: 1000,
      });
      await tw1.start();
    }

    if (line2) {
      const tw2 = new SplashTypewriter(line2, {
        text: line2.dataset.text || line2.textContent,
        speed: 50,
        delay: 800,
      });
      await tw2.start();
    }

    if (line3) {
      const tw3 = new SplashTypewriter(line3, {
        text: line3.dataset.text || line3.textContent,
        speed: 50,
        delay: 800,
      });
      await tw3.start();
    }

    // Show warning after typewriter
    setTimeout(() => {
      if (warningBox) {
        warningBox.classList.remove("hidden");
        void warningBox.offsetWidth;
        warningBox.classList.add("visible");
      }
    }, 2000);

    // Handle "I Understand" click
    if (understandBtn) {
      understandBtn.addEventListener("click", async () => {
        understandBtn.disabled = true;

        // Extinguish candle
        if (candleFlame) candleFlame.extinguish();

        await new Promise((r) => setTimeout(r, 600));

        // Show blood
        if (bloodCanvas) {
          bloodCanvas.classList.remove("hidden");
          bloodCanvas.classList.add("active");
          if (bloodEffect) await bloodEffect.play();
        }

        // Fade to black
        if (transitionOverlay) {
          transitionOverlay.classList.remove("hidden");
          transitionOverlay.classList.add("active");
        }

        await new Promise((r) => setTimeout(r, 1000));
        window.location.href = "/app";
      });
    }
  });
})();
