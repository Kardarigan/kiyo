import { CameraController } from "./CameraController.js";
import { Lighting } from "./Lighting.js";
import { FogEffect } from "./effects/FogEffect.js";
import { ParticleSystem } from "./effects/ParticleSystem.js";
import { Shaders } from "./materials/Shaders.js";

/*
 * Scene Manager
 * Manages a single 3D scene: objects, camera, lights, effects.
 */

class SceneManager {
  constructor(config = {}) {
    this.config = config;
    this.objects = [];
    this.cameraController = null;
    this.lighting = null;
    this.fog = null;
    this.particles = null;
    this.clearColor = [0.05, 0.05, 0.05, 1.0];
  }

  init(gl, engine) {
    this.gl = gl;
    this.engine = engine;

    // Set clear color
    const [r, g, b, a] = this.clearColor;
    gl.clearColor(r, g, b, a);

    // Initialize camera
    this.cameraController = new CameraController(gl, this.config.camera);

    // Initialize lighting
    this.lighting = new Lighting(gl, this.config.lighting);

    // Initialize fog
    this.fog = new FogEffect(gl, this.config.ambient);

    // Initialize particles
    this.particles = new ParticleSystem(gl, 100); // 100 floating dust particles

    return this;
  }

  addObject(object3D) {
    object3D.init(this.gl);
    this.objects.push(object3D);
  }

  removeObject(object3D) {
    const index = this.objects.indexOf(object3D);
    if (index !== -1) {
      object3D.destroy(this.gl);
      this.objects.splice(index, 1);
    }
  }

  render(gl, time, deltaTime) {
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update camera
    this.cameraController.update(time, deltaTime);

    // Get camera matrices
    const viewMatrix = this.cameraController.getViewMatrix();
    const projectionMatrix = this.cameraController.getProjectionMatrix();

    // Render each object
    this.objects.forEach((obj) => {
      if (obj.visible !== false) {
        obj.update(time, deltaTime);
        obj.render(gl, viewMatrix, projectionMatrix, this.lighting, time);
      }
    });

    // render particles
    gl.depthMask(false);
    this.particles.render(gl, viewMatrix, projectionMatrix, time);
    gl.depthMask(true);
  }

  destroy() {
    this.objects.forEach((obj) => obj.destroy(this.gl));
    this.objects = [];
    if (this.particles) this.particles.destroy(this.gl);
  }
}

module.exports = { SceneManager };
