/*
 * Core WebGL Engine
 * handles context creation, render loop, and resource management.
 * pure WebGL 1.0 for maximum compatibility.
 */

class ThreeEngine {
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
    // Get WebGL context with useful defaults
    this.gl = this.canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });

    if (!this.gl) {
      // Fallback to experimental WebGL
      this.gl = this.canvas.getContext("experimental-webgl", {
        alpha: true,
        antialias: true,
      });
    }

    if (!this.gl) {
      throw new Error("WebGL not supported in this browser");
    }

    // Configure global GL state
    const gl = this.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Handle canvas resize
    this.resize();
    window.addEventListener("resize", () => this.resize());

    return this.gl;
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;

    if (
      this.canvas.width !== displayWidth * dpr ||
      this.canvas.height !== displayHeight * dpr
    ) {
      this.canvas.width = displayWidth * dpr;
      this.canvas.height = displayHeight * dpr;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  addScene(name, scene) {
    this.scenes.set(name, scene);
  }

  setActiveScene(name) {
    const scene = this.scenes.get(name);
    if (scene) {
      this.activeScene = scene;
    }
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
    this.deltaTime = Math.min((now - this.lastFrameTime) / 1000, 0.1); // Cap at 100ms
    this.lastFrameTime = now;
    this.time += this.deltaTime;

    // Run frame callbacks
    this.onFrameCallbacks.forEach((cb) => cb(this.time, this.deltaTime));

    // Render active scene
    if (this.activeScene) {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.activeScene.render(this.gl, this.time, this.deltaTime);
    }
  }

  onFrame(callback) {
    this.onFrameCallbacks.push(callback);
  }

  removeFrameCallback(callback) {
    const index = this.onFrameCallbacks.indexOf(callback);
    if (index !== -1) this.onFrameCallbacks.splice(index, 1);
  }

  destroy() {
    this.stop();
    this.scenes.forEach((scene) => scene.destroy());
    this.scenes.clear();
    this.onFrameCallbacks = [];
  }
}

module.exports = { ThreeEngine };
