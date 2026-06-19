/*
 * Atmospheric Fog Controller
 * provides fog color and density to all shaders in the scene
 */
export class FogEffect {
  constructor(gl, config = {}) {
    this.gl = gl;

    // fog color (dark green-tinted for Kiyo's aesthetic)
    this.color = this.hexToRgb(config.fogColor || "#0a1a0a");
    this.density = config.fogDensity || 0.03;

    // set global clear color to match fog
    gl.clearColor(this.color[0], this.color[1], this.color[2], 1.0);
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255,
        ]
      : [0.04, 0.06, 0.04];
  }

  getColor() {
    return this.color;
  }

  getDensity() {
    return this.density;
  }

  // apply fog uniforms to all mesh objects in scene
  applyToObjects(objects) {
    objects.forEach((obj) => {
      obj._fogColor = this.color;
      obj._fogDensity = this.density;
    });
  }

  setDensity(density) {
    this.density = density;
  }

  setColor(hex) {
    this.color = this.hexToRgb(hex);
    this.gl.clearColor(this.color[0], this.color[1], this.color[2], 1.0);
  }
}