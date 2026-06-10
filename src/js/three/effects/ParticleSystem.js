import { MaterialFactory } from "../materials/MaterialFactory.js";

/*
 * Floating Dust Particle System
 * renders atmospheric dust motes drifting through the scene.
 */

class ParticleSystem {
  constructor(gl, count = 100) {
    this.gl = gl;
    this.count = count;
    this.particles = [];
    this.materialFactory = null;
    this.buffer = null;
    this.material = null;

    this.generateParticles();
  }

  generateParticles() {
    const positions = [];
    const sizes = [];
    const alphas = [];

    for (let i = 0; i < this.count; i++) {
      // random position in a sphere around origin
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 1.5 + Math.random() * 3;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi) - 1; // Bias toward camera

      positions.push(x, y, z);
      sizes.push(1 + Math.random() * 3);
      alphas.push(0.1 + Math.random() * 0.3);
    }

    this.particleData = {
      positions: new Float32Array(positions),
      sizes: new Float32Array(sizes),
      alphas: new Float32Array(alphas),
    };
  }

  init(gl, materialFactory) {
    this.gl = gl;
    this.materialFactory = materialFactory;
    this.material = materialFactory.createParticleMaterial();

    if (!this.material) return;

    // create buffer
    this.buffer = {
      position: this.createBuffer(this.particleData.positions),
      size: this.createBuffer(this.particleData.sizes),
      alpha: this.createBuffer(this.particleData.alphas),
    };
  }

  createBuffer(data) {
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    return buffer;
  }

  render(gl, viewMatrix, projectionMatrix, time) {
    if (!this.material || !this.buffer) return;

    gl.useProgram(this.material.program);

    // set uniforms
    gl.uniformMatrix4fv(this.material.uniforms.viewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(
      this.material.uniforms.projectionMatrix,
      false,
      projectionMatrix
    );
    gl.uniform1f(this.material.uniforms.time, time);

    // warm golden dust
    gl.uniform3fv(this.material.uniforms.particleColor, [0.8, 0.65, 0.35]);

    // bind attributes
    this.bindAttribute(
      this.material.attributes.position,
      this.buffer.position,
      3
    );
    this.bindAttribute(this.material.attributes.size, this.buffer.size, 1);
    this.bindAttribute(this.material.attributes.alpha, this.buffer.alpha, 1);

    // draw points
    gl.drawArrays(gl.POINTS, 0, this.count);
  }

  bindAttribute(location, buffer, size) {
    if (location === -1) return;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.enableVertexAttribArray(location);
    this.gl.vertexAttribPointer(location, size, this.gl.FLOAT, false, 0, 0);
  }

  destroy(gl) {
    if (this.buffer) {
      if (this.buffer.position) gl.deleteBuffer(this.buffer.position);
      if (this.buffer.size) gl.deleteBuffer(this.buffer.size);
      if (this.buffer.alpha) gl.deleteBuffer(this.buffer.alpha);
    }
  }
}

module.exports = { ParticleSystem };
