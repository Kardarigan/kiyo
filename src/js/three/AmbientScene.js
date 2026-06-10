import { SceneManager } from "./SceneManager.js";
import { MaterialFactory } from "./materials/MaterialFactory.js";
import { MaskGeometry } from "./geometries/MaskGeometry.js";
import { MeshObject } from "./geometries/MeshObject.js";
import { FogEffect } from "./effects/FogEffect.js";

/*
 * Pre-built Ambient Scene
 * sets up the floating mask scene with lighting, fog, and particles.
 * designed to be dropped into the app as the background.
 */
class AmbientScene {
  constructor(canvas, characterData) {
    this.canvas = canvas;
    this.characterData = characterData;
    this.sceneManager = null;
    this.materialFactory = null;
    this.maskObject = null;
  }

  async init(engine) {
    const gl = engine.gl;
    const threeDConfig = this.characterData?.threeD || {};

    // create material factory
    this.materialFactory = new MaterialFactory(gl);

    // create scene manager
    this.sceneManager = new SceneManager(threeDConfig);
    this.sceneManager.init(gl, engine);

    // create lit material
    const litMaterial = this.materialFactory.createLitMaterial();
    if (!litMaterial) {
      throw new Error("Failed to create lit material");
    }

    // generate mask geometry
    const maskGeom = MaskGeometry.generate(50);

    // create mask mesh
    const maskConfig = threeDConfig.objects?.[0] || {};
    this.maskObject = new MeshObject(maskGeom, "lit", {
      position: [
        maskConfig.position?.x || 0,
        maskConfig.position?.y || 0.2,
        maskConfig.position?.z || 0,
      ],
      rotation: [
        maskConfig.rotation?.x || 0,
        maskConfig.rotation?.y || 0.5,
        maskConfig.rotation?.z || 0,
      ],
      scale: [
        maskConfig.scale || 1.0,
        maskConfig.scale || 1.0,
        maskConfig.scale || 1.0,
      ],
      color: [0.75, 0.75, 0.72],
      metalness: 0.15,
      roughness: 0.55,
      floatAmplitude: 0.03,
      floatSpeed: 0.5,
    });

    this.maskObject._materialFactory = this.materialFactory;
    this.sceneManager.addObject(this.maskObject);

    // set up fog
    const fogColor = threeDConfig.ambient?.fogColor || "#0a1a0a";
    const fogDensity = threeDConfig.ambient?.fogDensity || 0.03;
    this.sceneManager.fog.setColor(fogColor);
    this.sceneManager.fog.setDensity(fogDensity);
    this.sceneManager.fog.applyToObjects(this.sceneManager.objects);

    // initialize particles
    this.sceneManager.particles.init(gl, this.materialFactory);

    // add mouse interaction
    this.initMouseInteraction();

    return this.sceneManager;
  }

  initMouseInteraction() {
    document.addEventListener("mousemove", (e) => {
      if (!this.maskObject) return;

      const x = (e.clientX / window.innerWidth - 0.5) * 0.3;
      const y = (e.clientY / window.innerHeight - 0.5) * 0.2;

      // subtle rotation toward mouse
      this.maskObject.rotation[1] = 0.5 + x;
      this.maskObject.rotation[0] = y * 0.5;
    });
  }

  getScene() {
    return this.sceneManager;
  }

  destroy() {
    if (this.sceneManager) this.sceneManager.destroy();
    if (this.materialFactory) this.materialFactory.destroy();
  }
}

module.exports = { AmbientScene };
