(function () {
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
      if (this.ctx) {
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
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
      if (!this.isPlaying || !this.ctx) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      const maxRadius = Math.max(this.canvas.width, this.canvas.height) * 0.8;

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
      if (this.ctx)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  class CandleScene {
    constructor(canvas) {
      this.canvas = canvas;
      this.gl = null;
      this.program = null;
      this.buffer = null;
      this.time = 0;
      this.intensity = 1;
      this.animationId = null;
      this.isActive = false;
    }

    async init() {
      // Try to get WebGL context with fallbacks
      this.gl =
        this.canvas.getContext("webgl") ||
        this.canvas.getContext("experimental-webgl") ||
        null;

      // If WebGL is not available, gracefully skip 3D effects
      if (!this.gl) {
        console.warn("WebGL not supported - candle effect disabled");
        this.isActive = false;
        return false;
      }

      this.isActive = true;

      // Vertex shader - simpler version for better compatibility
      const vsSource = `
        attribute vec2 a_position;
        attribute float a_offset;
        uniform float u_time;
        uniform float u_intensity;
        varying float v_brightness;
        void main() {
          vec2 pos = a_position;
          float wave = sin(u_time * 3.0 + a_offset) * 0.02 * u_intensity;
          float flicker = sin(u_time * 7.0 + a_offset * 2.0) * 0.01 * u_intensity;
          pos.x += wave + flicker;
          pos.y += abs(wave) * 0.5;
          v_brightness = 1.0 - (a_position.y + 0.8) * 0.7;
          gl_PointSize = 3.0 * u_intensity;
          gl_Position = vec4(pos, 0.0, 1.0);
        }
      `;

      // Fragment shader
      const fsSource = `
        precision mediump float;
        varying float v_brightness;
        uniform float u_intensity;
        void main() {
          vec3 flameColor = mix(vec3(0.85,0.35,0.05), vec3(0.95,0.65,0.15), v_brightness);
          float alpha = v_brightness * u_intensity * 0.9;
          gl_FragColor = vec4(flameColor, alpha);
        }
      `;

      // Compile shaders
      const vs = this.compileShader(this.gl.VERTEX_SHADER, vsSource);
      const fs = this.compileShader(this.gl.FRAGMENT_SHADER, fsSource);

      if (!vs || !fs) {
        console.warn("Shader compilation failed - candle effect disabled");
        this.isActive = false;
        return false;
      }

      this.program = this.createProgram(this.gl, vs, fs);

      if (!this.program) {
        console.warn("Program creation failed - candle effect disabled");
        this.isActive = false;
        return false;
      }

      // Generate candle geometry (particle positions)
      const vertices = [];
      for (let i = 0; i < 200; i++) {
        const t = i / 200;
        const y = (t - 0.5) * 1.6;
        let width = 0.15;
        if (y < 0) {
          width = 0.15 * (1 - Math.abs(y) * 1.5);
        } else {
          width = 0.15 * (1 - y) * 0.3;
        }
        const x = (Math.random() - 0.5) * width * 2;
        vertices.push(x, y, Math.random() * Math.PI * 2);
      }

      this.buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        this.gl.STATIC_DRAW
      );

      const posLoc = this.gl.getAttribLocation(this.program, "a_position");
      const offsetLoc = this.gl.getAttribLocation(this.program, "a_offset");

      this.gl.enableVertexAttribArray(posLoc);
      this.gl.vertexAttribPointer(posLoc, 2, this.gl.FLOAT, false, 12, 0);
      this.gl.enableVertexAttribArray(offsetLoc);
      this.gl.vertexAttribPointer(offsetLoc, 1, this.gl.FLOAT, false, 12, 8);

      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

      this.resize();
      window.addEventListener("resize", () => this.resize());

      return true;
    }

    compileShader(type, source) {
      try {
        const shader = this.gl.createShader(type);
        if (!shader) return null;

        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
          const info = this.gl.getShaderInfoLog(shader);
          console.warn("Shader compile error:", info);
          this.gl.deleteShader(shader);
          return null;
        }

        return shader;
      } catch (e) {
        console.warn("Shader creation failed:", e);
        return null;
      }
    }

    createProgram(gl, vs, fs) {
      try {
        const prog = gl.createProgram();
        if (!prog) return null;

        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);

        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
          console.warn("Program link error:", gl.getProgramInfoLog(prog));
          gl.deleteProgram(prog);
          return null;
        }

        return prog;
      } catch (e) {
        console.warn("Program creation failed:", e);
        return null;
      }
    }

    resize() {
      if (!this.gl || !this.canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const width = this.canvas.clientWidth;
      const height = this.canvas.clientHeight;

      if (width > 0 && height > 0) {
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      }
    }

    startAnimation() {
      if (!this.isActive || !this.gl) return;
      this.animate();
    }

    animate() {
      if (!this.isActive || !this.gl || !this.program) return;

      this.time += 0.016;

      this.gl.useProgram(this.program);

      const timeLoc = this.gl.getUniformLocation(this.program, "u_time");
      const intensityLoc = this.gl.getUniformLocation(
        this.program,
        "u_intensity"
      );

      if (timeLoc) this.gl.uniform1f(timeLoc, this.time);
      if (intensityLoc) this.gl.uniform1f(intensityLoc, this.intensity);

      this.gl.drawArrays(this.gl.POINTS, 0, 200);

      this.animationId = requestAnimationFrame(() => this.animate());
    }

    extinguish() {
      if (!this.isActive) return;

      const fade = () => {
        this.intensity -= 0.05;
        if (this.intensity > 0) {
          setTimeout(fade, 50);
        } else {
          this.intensity = 0;
          if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
          }
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
      if (this.gl && this.buffer) {
        this.gl.deleteBuffer(this.buffer);
      }
    }
  }

  // Main controller
  document.addEventListener("DOMContentLoaded", async () => {
    const candleCanvas = document.getElementById("candle-canvas");
    const warningBox = document.getElementById("warning-box");
    const understandBtn = document.getElementById("understand-btn");
    const bloodCanvas = document.getElementById("blood-canvas");
    const transitionOverlay = document.getElementById("transition-overlay");

    let candleScene = null;
    let bloodEffect = null;

    // Initialize candle scene if canvas exists
    if (candleCanvas) {
      candleScene = new CandleScene(candleCanvas);
      const success = await candleScene.init();
      if (success) {
        candleScene.startAnimation();
      } else {
        // Hide candle canvas if WebGL failed
        candleCanvas.style.display = "none";
      }
    }

    // Initialize blood effect
    if (bloodCanvas) {
      bloodEffect = new SplashBlood(bloodCanvas);
    }

    // Auto-show warning after typewriter animations
    const totalAnimationTime = 7000;
    setTimeout(() => {
      const typewriterEl = document.getElementById("typewriter");
      if (typewriterEl) typewriterEl.style.display = "none";
      if (warningBox) {
        warningBox.classList.remove("hidden");
        // Force reflow then add visible class
        void warningBox.offsetWidth;
        warningBox.classList.add("visible");
      }
    }, totalAnimationTime);

    // Handle understand button click
    if (understandBtn) {
      understandBtn.addEventListener("click", async () => {
        understandBtn.disabled = true;

        // Extinguish candle (fade out)
        if (candleScene) candleScene.extinguish();

        // Wait for darkness
        await new Promise((r) => setTimeout(r, 800));

        // Show blood effect
        if (bloodCanvas) {
          bloodCanvas.classList.remove("hidden");
          bloodCanvas.classList.add("active");
          if (bloodEffect) await bloodEffect.play();
        }

        // Fade to black transition
        if (transitionOverlay) {
          transitionOverlay.classList.remove("hidden");
          transitionOverlay.classList.add("active");
        }

        // Navigate to main site
        await new Promise((r) => setTimeout(r, 1500));
        window.location.href = "/app";
      });
    }
  });
})();
