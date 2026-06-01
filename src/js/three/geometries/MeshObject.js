/*
 * Generic 3D Mesh Object
 * Holds geometry buffers, material reference, and renders itself.
 */

export class MeshObject {
  constructor(geometry, materialKey, options = {}) {
    this.geometry = geometry;
    this.materialKey = materialKey;
    this.visible = true;

    // Transform
    this.position = options.position || [0, 0, 0];
    this.rotation = options.rotation || [0, 0, 0];
    this.scale = options.scale || [1, 1, 1];

    // Material properties
    this.objectColor = options.color || [0.9, 0.85, 0.7]; // Parchment white
    this.metalness = options.metalness || 0.1;
    this.roughness = options.roughness || 0.7;

    // Animation
    this.floatAmplitude = options.floatAmplitude || 0.02;
    this.floatSpeed = options.floatSpeed || 0.8;

    // Buffers
    this.vao = null;
    this.buffers = {};
  }

  init(gl) {
    // Create VAO-like structure (manual attribute binding)
    this.buffers.position = this.createBuffer(gl, this.geometry.positions);
    this.buffers.normal = this.createBuffer(gl, this.geometry.normals);
    this.buffers.texcoord = this.createBuffer(gl, this.geometry.texcoords);
    this.buffers.index = this.createIndexBuffer(gl, this.geometry.indices);
  }

  createBuffer(gl, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  }

  createIndexBuffer(gl, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  }

  update(time, deltaTime) {
    // Subclasses can override for animation
  }

  render(gl, viewMatrix, projectionMatrix, lighting, time) {
    // Get material
    const materialFactory = this._materialFactory;
    if (!materialFactory) return;

    const material = materialFactory.getMaterial(this.materialKey);
    if (!material) return;

    gl.useProgram(material.program);

    // Compute model matrix
    const modelMatrix = this.computeModelMatrix(time);
    const normalMatrix = this.computeNormalMatrix(modelMatrix);

    // Set uniforms
    this.setUniformMatrix(gl, material.uniforms.modelMatrix, modelMatrix);
    this.setUniformMatrix(gl, material.uniforms.viewMatrix, viewMatrix);
    this.setUniformMatrix(
      gl,
      material.uniforms.projectionMatrix,
      projectionMatrix
    );
    this.setUniformMatrix(gl, material.uniforms.normalMatrix, normalMatrix);

    gl.uniform1f(material.uniforms.time, time);
    gl.uniform1f(material.uniforms.floatAmplitude, this.floatAmplitude);
    gl.uniform1f(material.uniforms.floatSpeed, this.floatSpeed);

    // Lighting uniforms
    const lightData = lighting.getUniformData();
    gl.uniform3fv(material.uniforms.ambientColor, lightData.ambientColor);
    gl.uniform1f(
      material.uniforms.ambientIntensity,
      lightData.ambientIntensity
    );
    gl.uniform3fv(material.uniforms.keyColor, lightData.keyColor);
    gl.uniform1f(material.uniforms.keyIntensity, lightData.keyIntensity);
    gl.uniform3fv(material.uniforms.keyPosition, lightData.keyPosition);
    gl.uniform3fv(material.uniforms.rimColor, lightData.rimColor);
    gl.uniform1f(material.uniforms.rimIntensity, lightData.rimIntensity);
    gl.uniform3fv(material.uniforms.rimPosition, lightData.rimPosition);

    // Object properties
    gl.uniform3fv(material.uniforms.objectColor, this.objectColor);
    gl.uniform1f(material.uniforms.metalness, this.metalness);
    gl.uniform1f(material.uniforms.roughness, this.roughness);

    // Fog
    const fogColor = this._fogColor || [0.04, 0.06, 0.04];
    const fogDensity = this._fogDensity || 0.03;
    gl.uniform3fv(material.uniforms.fogColor, fogColor);
    gl.uniform1f(material.uniforms.fogDensity, fogDensity);

    // Bind attributes
    this.bindAttribute(
      gl,
      material.attributes.position,
      this.buffers.position,
      3
    );
    this.bindAttribute(gl, material.attributes.normal, this.buffers.normal, 3);
    this.bindAttribute(
      gl,
      material.attributes.texcoord,
      this.buffers.texcoord,
      2
    );

    // Bind index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);

    // Draw
    gl.drawElements(
      gl.TRIANGLES,
      this.geometry.vertexCount,
      gl.UNSIGNED_SHORT,
      0
    );
  }

  bindAttribute(gl, location, buffer, size) {
    if (location === -1) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  }

  setUniformMatrix(gl, location, matrix) {
    if (location) gl.uniformMatrix4fv(location, false, matrix);
  }

  computeModelMatrix(time) {
    // Simple TRS matrix (4×4 column-major)
    const m = this.identityMatrix();

    // Translation
    m[12] = this.position[0];
    m[13] = this.position[1];
    m[14] = this.position[2];

    // Rotation (Euler XYZ)
    const rx = this.rotation[0];
    const ry = this.rotation[1];
    const rz = this.rotation[2];

    // Rotation matrices multiplied (simplified for small angles)
    const cosX = Math.cos(rx),
      sinX = Math.sin(rx);
    const cosY = Math.cos(ry),
      sinY = Math.sin(ry);
    const cosZ = Math.cos(rz),
      sinZ = Math.sin(rz);

    m[0] = cosY * cosZ * this.scale[0];
    m[1] = cosY * sinZ * this.scale[0];
    m[2] = -sinY * this.scale[0];

    m[4] = (sinX * sinY * cosZ - cosX * sinZ) * this.scale[1];
    m[5] = (sinX * sinY * sinZ + cosX * cosZ) * this.scale[1];
    m[6] = sinX * cosY * this.scale[1];

    m[8] = (cosX * sinY * cosZ + sinX * sinZ) * this.scale[2];
    m[9] = (cosX * sinY * sinZ - sinX * cosZ) * this.scale[2];
    m[10] = cosX * cosY * this.scale[2];

    return m;
  }

  computeNormalMatrix(modelMatrix) {
    // Normal matrix = inverse transpose of upper 3×3
    // For simplicity, extract and invert 3×3
    const m = modelMatrix;
    const n = this.identityMatrix();

    // Copy upper 3×3
    n[0] = m[0];
    n[1] = m[1];
    n[2] = m[2];
    n[4] = m[4];
    n[5] = m[5];
    n[6] = m[6];
    n[8] = m[8];
    n[9] = m[9];
    n[10] = m[10];

    // For pure rotation + uniform scale, this is sufficient
    return n;
  }

  identityMatrix() {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }

  destroy(gl) {
    if (this.buffers.position) gl.deleteBuffer(this.buffers.position);
    if (this.buffers.normal) gl.deleteBuffer(this.buffers.normal);
    if (this.buffers.texcoord) gl.deleteBuffer(this.buffers.texcoord);
    if (this.buffers.index) gl.deleteBuffer(this.buffers.index);
  }
}
