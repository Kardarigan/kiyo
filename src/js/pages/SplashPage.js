import { SplashBlood } from "../features/SplashBlood.js";
import { Typewriter } from "../features/Typewriter.js";
import { CandleGeometry as CandleGeoData } from "../three/geometries/CandleGeometry.js";
import { Logger } from "../utils/Logger.js";

/*
 * Splash Page Controller
 * orchestrates the candle 3D scene, typewriter text, warning display,
 * and blood transition. can be used as a standalone page or entry point.
 */

class SplashPage {
  constructor(container) {
    this.container = container;
    this.logger = new Logger("SplashPage");
    this.candleScene = null;
    this.bloodEffect = null;
    this.typewritter = null;
    this.warningBox = null;
    this.understandBtn = null;
    this.bloodCanvas = null;
    this.transitionOverlay = null;
    this.candleCanvas = null;
  }

  async render() {
    this.candleCanvas = document.getElementById("candle-canvas");
    this.warningBox = document.getElementById("warning-box");
    this.understandBtn = document.getElementById("understand-btn");
    this.bloodCanvas = document.getElementById("blood-canvas");
    this.transitionOverlay = document.getElementById("transition-overlay");

    // initialize candle 3D scene using raw WebGL
    if (this.candleCanvas) {
      this.candleScene = new CandleScene(this.candleCanvas);
      await this.candleScene.init();
      this.candleScene.startAnimation();
    }

    // blood effect
    if (this.bloodCanvas) {
      this.bloodEffect = new SplashBlood(this.bloodCanvas);
    }

    this.startSequence();
  }

  startSequence() {
    const totalAnimationTime = 7000;
    setTimeout(() => {
      const typewriterEl = document.getElementById("typewriter");
      if (typewriterEl) typewriterEl.style.display = "none";
      if (this.warningBox) {
        this.warningBox.classList.remove("hidden");
        void this.warningBox.offsetWidth;
        this.warningBox.classList.add("visible");
      }
    }, totalAnimationTime);

    if (this.understandBtn) {
      this.understandBtn.addEventListener("click", () => this.onUnderstand());
    }
  }

  async onUnderstand() {
    if (this.understandBtn) this.understandBtn.disabled = true;
    if (this.candleScene) this.candleScene.extinguish();
    await this.delay(800);

    if (this.bloodCanvas) {
      this.bloodCanvas.classList.remove("hidden");
      this.bloodCanvas.classList.add("active");
      await this.bloodEffect.play();
    }

    if (this.transitionOverlay) {
      this.transitionOverlay.classList.remove("hidden");
      this.transitionOverlay.classList.add("active");
    }

    await this.delay(1500);
    window.location.href = "/app";
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  destroy() {
    if (this.candleScene) this.candleScene.destroy();
    if (this.bloodEffect) this.bloodEffect.destroy();
  }
}

// CandleScene using WebGL
class CandleScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl", { alpha: true, antialies: true });
    this.program = null;
    this.buffer = null;
    this.time = 0;
    this.intensity = 1;
    this.animationId = null;
  }

  async init() {
    const gl = this.gl;

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
        gl_Position = vec4(pos, 0.0, 1.0);
        gl_PointSize = 3.0 * u_intensity;
      }
    `;
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
    const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
    this.program = this.createProgram(vs, fs);
    const geom = CandleGeoData.generate(200);
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(geom.vertices),
      gl.STATIC_DRAW
    );
    const posLoc = gl.getAttribLocation(this.program, "a_position");
    const offsetLoc = gl.getAttribLocation(this.program, "a_offset");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 12, 0);
    gl.enableVertexAttribArray(offsetLoc);
    gl.vertexAttribPointer(offsetLoc, 1, gl.FLOAT, false, 12, 8);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  compileShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    return shader;
  }

  createProgram(vs, fs) {
    const prog = this.gl.createProgram();
    this.gl.attachShader(prog, vs);
    this.gl.attachShader(prog, fs);
    this.gl.linkProgram(prog);
    return prog;
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.clientWidth * dqr;
    this.canvas.height = this.canvas.clientHeight * dqr;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  startAnimation() {
    this.animate();
  }

  animate() {
    this.time += 0.016;
    this.gl.useProgram(this.program);
    this.gl.uniform1f(
      this.gl.getUniformLocation(this.program, "u_time"),
      this.time
    );
    this.gl.uniform1f(
      this.gl.getUniformLocation(this.program, "u_intensity"),
      this.intensity
    );
    this.gl.drawArray(this.gl.POINTS, 0, 200);
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  extinguish() {
    const fade = () => {
      this.intensity -= 0.05;
      if (this.intensity > 0) setTimeout(fade, 50);
      else {
        this.intensity = 0;
        cancelAnimationFrame(this.animationId);
      }
    };
    fade();
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
  }
}

module.exports = { SplashPage, candleScene };
