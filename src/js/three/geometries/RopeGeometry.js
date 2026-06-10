/*
 * Coiled Rope Geometry
 * generates a spiral coil of rope segments, like a ceremonial binding.
 */

class RopeGeometry {
  static generate(
    coils = 5,
    segmentsPerCoil = 60,
    radius = 0.3,
    ropeThickness = 0.0
  ) {
    const positions = [];
    const normals = [];
    const texcoords = [];
    const indices = [];
    const totalPoints = coils * segmentsPerCoil;

    for (let i = 0; i <= totalPoints; i++) {
      const t = i / segmentsPerCoil;
      const angle = t * Math.PI * 2;
      const y = (i / totalPoints) * 0.8 - 0.4;
      const r = radius + (i / totalPoints) * 0.1;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      positions.push(x, y, z);
      normals.push(0, 1, 0);
      texcoords.push(t, i / totalPoints);
    }

    return {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      texcoords: new Float32Array(texcoords),
      indices: null, // line strip
      vertexCount: totalPoints + 1,
      drawMode: "LINE_STRIP",
    };
  }
}

module.exports = { RopeGeometry };
