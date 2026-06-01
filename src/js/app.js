import { Engine } from "./core/Engine.js";
import { ThreeEngine } from "./three/ThreeEngine.js";
import { AmbientScene } from "./three/AmbientScene.js";
import { Logger } from "./utils/Logger.js";

const logger = new Logger("App");

document.addEventListener("DOMContentLoaded", async () => {
  logger.log("Initializing application...");

  const engine = new Engine();

  try {
    await engine.boot();

    // Initialize 3D background
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

      // Store for cleanup
      engine.stateManager.setState("threeEngine", threeEngine);
      engine.stateManager.setState("ambientScene", ambientScene);
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
