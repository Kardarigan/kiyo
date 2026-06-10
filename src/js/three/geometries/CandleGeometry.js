/*
 * Candle Flame Geometry
 * returns an array of points for a particle-based flame (teardrop shape)
 */

class CandleGeometry {
  static generate(count = 200) {
    const vertices = [];
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const y = (t - 0.5) * 1.6;
      const maxWidth = 0.15;
      let width;
      if (y < 0) {
        width = maxWidth * (1 - Math.abs(y) * 1.5);
      } else {
        width = maxWidth * (1 - y) * 0.3;
      }
      const x = (Math.random() - 0.5) * width * 2;
      vertices.push(x, y, Math.random() * Math.PI * 2);
    }
    return { vertices };
  }
}

module.exports = { CandleGeometry };
