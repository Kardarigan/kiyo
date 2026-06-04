import { Engine } from "./core/Engine.js";
import { ThreeEngine } from "./three/ThreeEngine.js";
import { AmbientScene } from "./three/AmbientScene.js";
import { CursorEffect } from "./features/CursorEffect.js";
import { ParallaxController } from "./features/ParallaxController.js";
import { EasterEggs } from "./features/EasterEggs.js";
import { Logger } from "./utils/Logger.js";

const logger = new Logger("App");

document.addEventListener("DOMContentLoaded", async () => {
  logger.log("Initializing application...");

  const engine = new Engine();

  try {
    await engine.boot();

    // 3D Background
    const ambientCanvas = document.getElementById("ambient-canvas");
    if (ambientCanvas) {
      const threeEngine = new ThreeEngine(ambientCanvas);
      await threeEngine.init();

      const characterData = engine.stateManager.getState("threeD");
      const ambientScene = new AmbientScene(ambientCanvas, {
        threeD: characterData,
      });
      const scene = await ambientScene.init(threeEngine);

      threeEngine.addScene("ambient", scene);
      threeEngine.setActiveScene("ambient");
      threeEngine.start();

      engine.stateManager.setState("threeEngine", threeEngine);
      engine.stateManager.setState("ambientScene", ambientScene);
    }

    // Custom Cursor
    const cursor = new CursorEffect();
    engine.stateManager.setState("cursor", cursor);

    // Parallax
    const parallax = new ParallaxController();
    engine.stateManager.setState("parallax", parallax);

    // Easter Eggs
    const easterEggs = new EasterEggs(engine.stateManager);
    engine.stateManager.setState("easterEggs", easterEggs);

    // Listen for CMS updates
    if (typeof BroadcastChannel !== "undefined") {
      const cmsChannel = new BroadcastChannel("kiyo-cms");
      cmsChannel.onmessage = (event) => {
        if (event.data?.type === "data-updated") {
          logger.log("CMS data updated, reloading...");
          // Reload character data without full page refresh
          engine.dataLoader.clearCache();
          engine.boot().catch((err) => logger.error("Reload failed", err));
        }
      };
      engine.stateManager.setState("cmsChannel", cmsChannel);
    }

    logger.log("Application ready");
  } catch (error) {
    logger.error("Failed to boot application", error);
    const container = document.getElementById("page-container");
    if (container) {
      container.innerHTML = `
        <div class="error-state">
          <h2>Something went wrong</h2>
          <p>Failed to initialize. Please try again later.</p>
        </div>`;
    }
  }
});
