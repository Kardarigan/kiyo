/*
 * Custom GLSL Shader Library
 * of course handwritten. vertex and fragment shaders for the dark academia aesthetic
 */

export class Shaders {
  // standard lit shader with fog support
  static getLitShader() {
    return {
      vertex: `
        precision highp float;
        attribute vec3 a_position;
        attribute vec3 a_normal;
        attribute vec2 a_texcoord;
        
        uniform mat4 u_modelMatrix;
        uniform mat4 u_viewMatrix;
        uniform mat4 u_projectionMatrix;
        uniform mat4 u_normalMatrix;
        uniform float u_time;
        uniform float u_floatAmplitude;
        uniform float u_floatSpeed;
        
        varying vec3 v_normal;
        varying vec3 v_position;
        varying vec3 v_worldPosition;
        varying vec2 v_texcoord;
        
        void main() {
          // Floating animation
          vec3 pos = a_position;
          pos.y += sin(u_time * u_floatSpeed + a_position.x * 2.0) * u_floatAmplitude;
          pos.x += cos(u_time * u_floatSpeed * 0.7 + a_position.y * 1.5) * u_floatAmplitude * 0.5;
          
          vec4 worldPos = u_modelMatrix * vec4(pos, 1.0);
          vec4 viewPos = u_viewMatrix * worldPos;
          
          v_worldPosition = worldPos.xyz;
          v_position = viewPos.xyz;
          v_normal = normalize(mat3(u_normalMatrix) * a_normal);
          v_texcoord = a_texcoord;
          
          gl_Position = u_projectionMatrix * viewPos;
        }
      `,

      fragment: `
        precision highp float;
        
        varying vec3 v_normal;
        varying vec3 v_position;
        varying vec3 v_worldPosition;
        varying vec2 v_texcoord;
        
        uniform vec3 u_ambientColor;
        uniform float u_ambientIntensity;
        uniform vec3 u_keyColor;
        uniform float u_keyIntensity;
        uniform vec3 u_keyPosition;
        uniform vec3 u_rimColor;
        uniform float u_rimIntensity;
        uniform vec3 u_rimPosition;
        uniform vec3 u_objectColor;
        uniform float u_metalness;
        uniform float u_roughness;
        uniform vec3 u_fogColor;
        uniform float u_fogDensity;
        uniform float u_time;
        
        void main() {
          vec3 normal = normalize(v_normal);
          vec3 viewDir = normalize(-v_position);
          
          // Ambient
          vec3 ambient = u_ambientColor * u_ambientIntensity;
          
          // Key light (diffuse + specular)
          vec3 keyDir = normalize(u_keyPosition - v_worldPosition);
          float keyDiffuse = max(dot(normal, keyDir), 0.0);
          vec3 keyHalf = normalize(keyDir + viewDir);
          float keySpecular = pow(max(dot(normal, keyHalf), 0.0), 32.0 / (u_roughness + 0.1));
          vec3 keyLight = u_keyColor * u_keyIntensity * (keyDiffuse * 0.7 + keySpecular * 0.3 * u_metalness);
          
          // Rim light (backlight glow)
          vec3 rimDir = normalize(u_rimPosition - v_worldPosition);
          float rimFactor = 1.0 - max(dot(normal, viewDir), 0.0);
          float rimLight = pow(rimFactor, 3.0) * max(dot(normal, rimDir), 0.0);
          vec3 rim = u_rimColor * u_rimIntensity * rimLight;
          
          // Combine lighting
          vec3 litColor = u_objectColor * (ambient + keyLight) + rim;
          
          // Subtle time-based shimmer
          float shimmer = sin(u_time * 1.5 + v_worldPosition.y * 5.0) * 0.03;
          litColor += shimmer * u_ambientColor;
          
          // Fog
          float fogDistance = length(v_position);
          float fogFactor = 1.0 - exp(-u_fogDensity * fogDistance * fogDistance);
          fogFactor = clamp(fogFactor, 0.0, 1.0);
          litColor = mix(litColor, u_fogColor, fogFactor);
          
          gl_FragColor = vec4(litColor, 1.0);
        }
      `,
    };
  }

  // particle shader for dust/embers
  static getParticleShader() {
    return {
      vertex: `
        precision highp float;
        attribute vec3 a_position;
        attribute float a_size;
        attribute float a_alpha;
        
        uniform mat4 u_viewMatrix;
        uniform mat4 u_projectionMatrix;
        uniform float u_time;
        
        varying float v_alpha;
        
        void main() {
          vec4 viewPos = u_viewMatrix * vec4(a_position, 1.0);
          gl_Position = u_projectionMatrix * viewPos;
          gl_PointSize = a_size * (300.0 / -viewPos.z);
          v_alpha = a_alpha;
        }
      `,

      fragment: `
        precision highp float;
        varying float v_alpha;
        uniform vec3 u_particleColor;
        
        void main() {
          // Soft circular particle
          float dist = length(gl_PointCoord - vec2(0.5));
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          alpha *= v_alpha;
          
          gl_FragColor = vec4(u_particleColor, alpha);
        }
      `,
    };
  }

  // compile shader program from vertex and fragment sources
  static compileProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = Shaders.compileShader(
      gl,
      gl.VERTEX_SHADER,
      vertexSource
    );
    const fragmentShader = Shaders.compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentSource
    );

    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    // clean up shaders after linking
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return program;
  }

  static compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getProgramInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }
}
