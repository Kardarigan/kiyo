/*
 * Dynamic Lighting System
 * provides ambient, key, and rim light data to shaders
 */

class Lighting {
  constructor(gl, config = {}) {
    this.gl = gl;

    this.ambient = {
      color: this.hexToTgb(config.ambient?.color || "#1a2a1a"),
      intensity: config.ambient?.intensity || 0.4,
    };

    this.key = {
      color: this.hexToTgb(config.key?.color || "#d4a843"),
      intensity: config.key?.intensity || 0.8,
      position: config.key?.position
        ? [config.key.position.x, config.key.position.y, config.key.position.z]
        : [2, 1, 2],
    };

    this.rim = {
      color: this.hexToTgb(config.rim?.color || "#4a3a2a"),
      intensity: config.rim?.intensity || 0.3,
      position: config.rim?.position
        ? [config.rim.position.x, config.rim.position.y, config.rim.position.z]
        : [-1, 0.5, -1],
    };
  }

  hexToTgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255,
        ]
      : [1, 1, 1];
  }

  // returns a flat array of uniforms for shaders
  getUniformData() {
    return {
      ambientColor: this.ambient.color,
      ambientIntensity: this.ambient.intensity,
      keyColor: this.key.color,
      keyIntensity: this.key.intensity,
      keyPosition: this.key.position,
      rimColor: this.rim.color,
      rimIntensity: this.rim.intensity,
      rimPosition: this.rim.position,
    };
  }
}

module.exports = { Lighting };
