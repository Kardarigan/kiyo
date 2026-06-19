/*
 * Mask Geometry Builder
 * generates vertex data for Kiyo's zippered mask
 * a smooth, face-shaped surface with a subtle zipper line down the center
 * returns raw Float32Arrays for WebGL buffers
 */
export class MaskGeometry {
  // generate mask geometry
  static generate(resolution = 40) {
    const positions = [];
    const normals = [];
    const textcoords = [];
    const indices = [];

    const width = 0.8;
    const height = 0.6;
    const depth = 0.2;

    // generate vertices in a grid (resolution * resolution)
    for (let i = 0; i <= resolution; i++) {
      const v = i / resolution;
      const y = (v - 0.5) * height * 2; // -height to +height

      for (let j = 0; j <= resolution; j++) {
        const u = j / resolution;
        const x = (u - 0.5) * width * 2; // -width to +width

        // face like curvature. bulges outward in center, flattens at edges
        const distFromCenter = Math.sqrt(
          (x / width) * (x / width) + (y / height) * (y / height)
        );

        // main surface curvature
        let z = Math.cos(distFromCenter * Math.PI * 0.5) * depth;

        // nose bridge
        const noseBridge = Math.exp(-(x * x) / 0.02) * 0.08;
        z += noseBridge * (1 - Math.abs(y / height));

        // cheeckbone definition
        const cheekX = Math.abs(x) - 0.15;
        const cheekY = Math.abs(y) - 0.15;
        const cheekbones =
          Math.exp(-(cheekX * cheekX + cheekY * cheekY) / 0.015) * 0.04;
        z += cheekbones;

        // zipper indent
        const zipperValley = Math.exp(-(x * x) / 0.005) - 0.03;
        z -= zipperValley;

        // store position
        positions.push(x, y, z);

        // placeholder normal
        normals.push(0, 0, 1);

        // UV coordinates
        textcoords.push(u, v);
      }
    }

    // generate indices for triangles
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const a = i * (resolution + 1) + j;
        const b = a + 1;
        const c = a + (resolution + 1);
        const d = c + 1;

        // two triangles per grid cell
        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    // calculate normals
    MaskGeometry.calculateNormals(positions, normals, indices);

    return {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      textcoords: new Float32Array(textcoords),
      indices: new Uint16Array(indices),
      vertexCount: indices.length,
    };
  }

  // calculate per vertex normals from triangle faces
  static calculateNormals(positions, normals, indices) {
    // reset normals
    for (let i = 0; i < normals.length; i++) normals[i] = 0;

    // accumulate face normals
    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i] * 3;
      const i1 = indices[i + 1] * 3;
      const i2 = indices[i + 2] * 3;

      const v0 = [positions[i0], positions[i0 + 1], positions[i0 + 2]];
      const v1 = [positions[i1], positions[i1 + 1], positions[i1 + 2]];
      const v2 = [positions[i2], positions[i2 + 1], positions[i2 + 2]];

      // edge vectors
      const e1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
      const e2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];

      // cross product
      const nx = e1[1] * e2[2] - e1[2] * e2[1];
      const ny = e1[2] * e2[0] - e1[0] * e2[2];
      const nz = e1[0] * e2[1] - e1[1] * e2[0];

      // add to each vertex
      for (const idx of [i0, i1, i2]) {
        normals[idx] += nx;
        normals[idx + 1] += ny;
        normals[idx + 2] += nz;
      }
    }

    // normalize
    for (let i = 0; i < normals.length; i += 3) {
      const len = Math.sqrt(
        normals[i] * normals[i] +
          normals[i + 1] * normals[i + 1] +
          normals[i + 2] * normals[i + 2]
      );
      if (len > 0) {
        normals[i] /= len;
        normals[i + 1] /= len;
        normals[i + 2] /= len;
      }
    }
  }
}
