/*
 * Katana Blade Geometry
 * procedurally generates a simplified curved blade with handle
 */

export class KatanaGeometry {
  static generate() {
    const positions = [];
    const normals = [];
    const texcoords = [];
    const indices = [];

    const bladeLength = 2.0;
    const bladeWidth = 0.08;
    const handleLength = 0.6;
    const curveDepth = 0.05;
    const segments = 40;

    // Curved Blade
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const z = -bladeLength / 2 + t * bladeLength;
      // slight curve
      const yCurve = Math.sin(t * Math.PI) * curveDepth;
      const w = bladeWidth * (1 - t * 0.3); // taper

      // top edge (x = w, y = 0)
      positions.push(w, yCurve, z);
      positions.push(-w, yCurve, z);
      texcoords.push(1, t);
      texcoords.push(0, t);
      // normals (just placeholders)
      normals.push(0, 1, 0);
      normals.push(0, 1, 0);
    }

    // handle (straight)
    const handleStartZ = bladeLength / 2;
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const z = handleStartZ + t * handleLength;
      const w = 0.06;
      positions.push(w, 0, z);
      positions.push(-w, 0, z);
      texcoords.push(1, 1);
      texcoords.push(0, 1);
      normals.push(0, 1, 0);
      normals.push(0, 1, 0);
    }

    // generate indices for blade strip
    const bladeVertCount = (segments + 1) * 2;
    for (let i = 0; i < segments; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }

    // handle indices (offset by blade vertex count)
    const handleOffset = bladeVertCount;
    for (let i = 0; i < 10; i++) {
      const a = handleOffset + i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }

    // compute normals
    KatanaGeometry.computeFlatNormals(positions, normals, indices);

    return {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      texcoords: new Float32Array(texcoords),
      indices: new Uint16Array(indices),
      vertexCount: indices.length,
    };
  }

  static computeFlatNormals(positions, normals, indices) {
    // set all normals to (0, 1, 0) for demonstration
    for (let i = 0; i < normals.length; i += 3) {
      normals[i] = 0;
      normals[i + 1] = 1;
      normals[i + 2] = 0;
    }
  }
}
