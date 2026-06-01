import { Shaders } from "./Shaders.js";
/*
 * Material Factory
 * creates and manages WebGL shader programs with uniform locations
 */

export class MaterialFactory {
  constructor(gl) {
    this.gl = gl;
    this.programs = new Map();
  }

  createLitMaterial(options = {}) {
    const key = "lit";
    if (this.programs.has(key)) return this.programs.get(key);

    const shader = Shaders.getLitShader();
    const program = Shaders.compileProgram(
      thi.gl,
      shader.vertex,
      shader.fragment
    );

    if (!program) return null;

    const material = {
      program,
      uniforms: {
        modelMatrix: this.gl.getUniformLocation(program, "u_modelMatrix"),
        viewMatrix: this.gl.getUniformLocation(program, "u_viewMatrix"),
        projectionMatrix: this.gl.getUniformLocation(
          program,
          "u_projectionMatrix"
        ),
        normalMatrix: this.gl.getUniformLocation(program, "u_normalMatrix"),
        time: this.gl.getUniformLocation(program, "u_time"),
        floatAmplitude: this.gl.getUniformLocation(program, "u_floatAmplitude"),
        floatSpeed: this.gl.getUniformLocation(program, "u_floatSpeed"),
        ambientColor: this.gl.getUniformLocation(program, "u_ambientColor"),
        ambientIntensity: this.gl.getUniformLocation(
          program,
          "u_ambientIntensity"
        ),
        keyColor: this.gl.getUniformLocation(program, "u_keyColor"),
        keyIntensity: this.gl.getUniformLocation(program, "u_keyIntensity"),
        keyPosition: this.gl.getUniformLocation(program, "u_keyPosition"),
        rimColor: this.gl.getUniformLocation(program, "u_rimColor"),
        rimIntensity: this.gl.getUniformLocation(program, "u_rimIntensity"),
        rimPosition: this.gl.getUniformLocation(program, "u_rimPosition"),
        objectColor: this.gl.getUniformLocation(program, "u_objectColor"),
        metalness: this.gl.getUniformLocation(program, "u_metalness"),
        roughness: this.gl.getUniformLocation(program, "u_roughness"),
        fogColor: this.gl.getUniformLocation(program, "u_fogColor"),
        fogDensity: this.gl.getUniformLocation(program, "u_fogDensity"),
      },
      attributes: {
        position: this.gl.getAttribLocation(program, "a_position"),
        normal: this.gl.getAttribLocation(program, "a_normal"),
        texcoord: this.gl.getAttribLocation(program, "a_texcoord"),
      },
    };

    this.programs.set(key, material);
    return material;
  }

  createParticleMaterial() {
    const key = "particle";
    if (this.programs.has(key)) return this.programs.get(key);

    const shader = Shaders.getParticleShader();
    const program = Shader.compileProgram(
      this.gl,
      shader.vertex,
      shader.fragment
    );

    if (!program) return null;

    const material = {
      program,
      uniforms: {
        viewMatrix: this.gl.getUniformLocation(program, "u_viewMatrix"),
        projectionMatrix: this.gl.getUniformLocation(
          program,
          "u_projectionMatrix"
        ),
        time: this.gl.getUniformLocation(program, "u_time"),
        particleColor: this.gl.getUniformLocation(program, "u_particleColor"),
      },
      attributes: {
        position: this.gl.getAttribLocation(program, "a_position"),
        size: this.gl.getAttribLocation(program, "a_size"),
        alpha: this.gl.getAttribLocation(program, "a_alpha"),
      },
    };

    this.programs.set(key, material);
    return material;
  }

  getMaterial(key) {
    return this.programs.get(key);
  }

  destroy() {
    this.programs.forEach((material) => {
      this.gl.deleteProgram(material.program);
    });
    this.programs.clear();
  }
}
