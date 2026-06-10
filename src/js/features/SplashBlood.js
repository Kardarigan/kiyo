/*
 * Canvas-based blood splash effect
 * Uses particle system and radial expansion
 * No images required — pure canvas rendering
 */

class SplashBlood {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.isPlaying = false;
    this.radius = 0;
    this.opacity = 0;

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

    // Generate blood particles
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

    // Phase 1: Radia spread (dark blood pool)
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

    // Phase 2: Particles (splatter)
    let aliveParticles = false;
    this.particles.forEach((p) => {
      if (p.life <= 0) return;
      aliveParticles = true;

      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;
      p.life = p.decay;
      p.speed *= 0.98;

      this.ctx.fillStyle = `rbga(139, 0, 0, ${p.life})`;
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

module.exports = { SplashBlood };
