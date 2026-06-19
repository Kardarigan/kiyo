/*
 * Core WebGL Engine
 * handles context creation, render loop, and resource management.
 * pure WebGL 1.0 for maximum compatibility.
 */

export class ThreeEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = null;
    this.scenes = new Map();
    this.activeScene = null;
    this.animationId = null;
    this.isRunning = false;
    this.time = 0;
    this.deltaTime = 0;
    this.lastFrameTime = 0;
    this.onFrameCallbacks = [];
  }

  async init() {
    try {
      this.gl = this.canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      if (!this.gl) {
        this.gl = this.canvas.getContext("experimental-webgl", {
          alpha: true,
          antialias: true,
        });
      }
      if (!this.gl) {
        throw new Error("WebGL not supported");
      }

      const gl = this.gl;
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);

      this.resize();
      window.addEventListener("resize", () => this.resize());

      return this.gl;
    } catch (error) {
      console.warn("WebGL initialization failed:", error);
      this.canvas.style.display = "none";
      throw error;
    }
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.clientWidth,
      h = this.canvas.clientHeight;
    if (this.canvas.width !== w * dpr || this.canvas.height !== h * dpr) {
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  addScene(name, scene) {
    this.scenes.set(name, scene);
  }
  setActiveScene(name) {
    this.activeScene = this.scenes.get(name);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  loop() {
    if (!this.isRunning) return;
    this.animationId = requestAnimationFrame(() => this.loop());
    const now = performance.now();
    this.deltaTime = Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;
    this.time += this.deltaTime;
    this.onFrameCallbacks.forEach((cb) => cb(this.time, this.deltaTime));
    if (this.activeScene) {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.activeScene.render(this.gl, this.time, this.deltaTime);
    }
  }

  onFrame(callback) {
    this.onFrameCallbacks.push(callback);
  }
  removeFrameCallback(callback) {
    const i = this.onFrameCallbacks.indexOf(callback);
    if (i !== -1) this.onFrameCallbacks.splice(i, 1);
  }

  destroy() {
    this.stop();
    this.scenes.forEach((s) => s.destroy());
    this.scenes.clear();
    this.onFrameCallbacks = [];
  }
}
