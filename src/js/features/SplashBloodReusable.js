/*
 * Reusable Blood Splash Effect
 * Can be triggered anywhere in the app
 */

export class SplashBloodReusable {
  constructor(options = {}) {
    this.container = options.container || document.body;
    this.duration = options.duration || 2000;
    this.color = options.color || "#6b0f0f";
    this.onComplete = options.onComplete || null;

    this.canvas = null;
    this.ctx = null;
    this.isPlaying = false;
  }

  createCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
      `;
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  async trigger(x, y) {
    if (this.isPlaying) return;
    this.isPlaying = true;

    if (!this.canvas) this.createCanvas();

    const centerX = x || this.canvas.width / 2;
    const centerY = y || this.canvas.height / 2;
    const particles = [];
    const radius = 0;
    const maxRadius = Math.max(this.canvas.width, this.canvas.height) * 0.6;

    // Generate particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: centerX,
        y: centerY,
        angle: Math.random() * Math.PI * 2,
        speed: 1 + Math.random() * 6,
        size: 1 + Math.random() * 5,
        life: 1,
        decay: 0.005 + Math.random() * 0.025,
      });
    }

    return new Promise((resolve) => {
      let currentRadius = 0;
      let opacity = 0;
      let animationId = null;

      const animate = () => {
        if (!this.ctx) {
          this.isPlaying = false;
          resolve();
          return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Radial spread
        if (currentRadius < maxRadius) {
          currentRadius += 12;
          opacity = Math.min(opacity + 0.025, 0.8);

          const gradient = this.ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            currentRadius
          );
          gradient.addColorStop(0, this.color);
          gradient.addColorStop(0.5, this.color + "88");
          gradient.addColorStop(1, "transparent");

          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
          this.ctx.fill();
        }

        // Particles
        let alive = false;
        particles.forEach((p) => {
          if (p.life <= 0) return;
          alive = true;
          p.x += Math.cos(p.angle) * p.speed;
          p.y += Math.sin(p.angle) * p.speed;
          p.life -= p.decay;
          p.speed *= 0.97;

          this.ctx.fillStyle = `rgba(139, 0, 0, ${Math.max(0, p.life)})`;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          this.ctx.fill();
        });

        if (currentRadius < maxRadius || alive) {
          animationId = requestAnimationFrame(animate);
        } else {
          this.isPlaying = false;
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            this.canvas = null;
            this.ctx = null;
          }
          if (this.onComplete) this.onComplete();
          resolve();
        }
      };

      animate();
    });
  }
}
