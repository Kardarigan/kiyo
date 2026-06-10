/*
 * Camera Controller
 * manages view and projection matrices with subtle floating animation.
 */

class CameraController {
  constructor(gl, config = {}) {
    this.gl = gl;

    // Position
    this.position = config.position
      ? [config.position.x, config.position.y, config.position.z]
      : [0, 0.3, 3.5];

    // Position
    this.target = config.lookAt
      ? [config.position.x, config.position.y, config.position.z]
      : [0, 0.3, 3.5];

    // FOV
    this.fov = ((config.fov || 45) * Math.PI) / 180;
    this.near = 0.1;
    this.far = 100;

    // Matrices
    this.viewMatrix = new Float32Array(16);
    this.projectionMatrix = new Float32Array(16);

    // Animation
    this.basePosition = [...this.position];
    this.floatAmplitude = 0.05;
    this.floatSpeed = 0.3;

    this.updateProjection();
  }

  updateProjection() {
    const aspect = this.gl.canvas.width / (this.gl.canvas.height || 1);
    this.perspective(
      this.projectionMatrix,
      this.fov,
      aspect,
      this.near,
      this.far
    );
  }

  update(time, deltaTime) {
    const floatY = Math.sin(time * this.floatSpeed) * this.floatAmplitude;
    const floatX =
      Math.cos(time * this.floatSpeed * 0.7) * this.floatAmplitude * 0.5;

    this.position[0] = this.basePosition[0] + floatX;
    this.position[1] = this.basePosition[1] + floatY;

    this.lookAt(this.viewMatrix, this.position, this.target, [0, 1, 0]);
  }

  getViewMatrix() {
    return this.viewMatrix;
  }

  getProjectionMatrix() {
    return this.projectionMatrix;
  }

  // Matrix Math
  perspective(out, fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1 / (near - far);

    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;

    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;

    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;

    out[12] = 0;
    out[13] = 0;
    out[14] = 2 * far * near * nf;
    out[15] = 0;
  }

  lookAt(out, eye, center, up) {
    let zx = eye[0] - center[0];
    let zy = eye[1] - center[1];
    let zz = eye[2] - center[2];

    // normalize z
    let len = Math.sqrt(zx * zx + zy * zy + zz * zz);
    if (len > 0) {
      zx *= len;
      zy *= len;
      zz *= len;
    }

    // cross product: up * z = x
    let xx = up[1] * zz - up[2] * zy;
    let xy = up[2] * zx - up[0] * zz;
    let xz = up[0] * zy - up[1] * zx;

    len = Math.sqrt(xx * xx + xy * xy + xz * xz);

    if (len > 0) {
      xx /= len;
      xy /= len;
      xz /= len;
    }

    //cross product: z * x = y
    let yx = zy * xz - zz * xy;
    let yy = zz * xx - zx * xz;
    let yz = zx * xy - zy * xx;

    out[0] = xx;
    out[1] = yx;
    out[2] = zx;
    out[3] = 0;

    out[4] = xy;
    out[5] = yy;
    out[6] = zy;
    out[7] = 0;

    out[8] = xz;
    out[9] = yz;
    out[10] = zz;
    out[11] = 0;

    out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
    out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
    out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
    out[15] = 1;
  }
}

module.exports = { CameraController };
