/*
 * Coiled Rope Geometry
 * generates a spiral coil of rope segments
 */

export class RopeGeometry {
  static generate(coils = 5, segmentsPerCoil = 60, radius = 0.3) {
    const positions = [];
    const normals = [];
    const textcoords = [];
    const indices = [];
    const totalPoints = coils * segmentsPerCoil;

    // Generate vertices in a spiral
    for (let i = 0; i <= totalPoints; i++) {
      const t = i / segmentsPerCoil;
      const angle = t * Math.PI * 2;
      const y = (i / totalPoints) * 0.8 - 0.4;
      const r = radius + (i / totalPoints) * 0.05;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      positions.push(x, y, z);
      normals.push(0, 1, 0);
      textcoords.push(t, i / totalPoints);
    }

    // Generate indices for line strip
    for (let i = 0; i < totalPoints; i++) {
      indices.push(i, i + 1);
    }

    return {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      textcoords: new Float32Array(textcoords),
      indices: new Uint16Array(indices),
      vertexCount: indices.length,
      drawMode: "LINES",
    };
  }
}
