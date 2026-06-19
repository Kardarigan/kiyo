// ============================================================
// app.js - Main entry point for the character showcase app
// Uses modular ES6 imports; runs after DOM is ready.
// ============================================================

// --- Core modules ---
import { Router } from "./core/Router.js";
import { StateManager } from "./core/StateManager.js";
import { EventBus } from "./core/EventBus.js";
import { DataLoader } from "./core/DataLoader.js";
import { ThemeEngine } from "./core/ThemeEngine.js";

// --- Features ---
import { EasterEggs } from "./features/EasterEggs.js";
import { WhisperController } from "./features/WhisperController.js";
import { ParallaxController } from "./features/ParallaxController.js";

// --- Components ---
import { Navigation } from "./components/Navigation.js";

// --- 3D (optional, but we include it) ---
import { ThreeEngine } from "./three/ThreeEngine.js";
import { AmbientScene } from "./three/AmbientScene.js";

// --- Utilities ---
import { Logger } from "./utils/Logger.js";

// ------------------------------------------------------------------
// Initialisation
// ------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
  const logger = new Logger("App");
  logger.log("Starting application...");

  // ----- 1. Core instances -----
  const eventBus = new EventBus();
  const stateManager = new StateManager(eventBus);
  const dataLoader = new DataLoader();
  const themeEngine = new ThemeEngine();

  // ----- 2. Load character data -----
  const characterData = await dataLoader.fetchCharacter();
  if (!characterData) {
    document.getElementById("app-loader").classList.add("hidden");
    document.getElementById("page-container").innerHTML =
      '<div class="error-state"><p>Failed to load character data. Please try again later.</p></div>';
    logger.error("No character data received.");
    return;
  }

  // ----- 3. Populate state -----
  stateManager.setState("character", characterData.character);
  stateManager.setState("theme", characterData.theme);
  stateManager.setState("pages", characterData.pages);
  stateManager.setState("easterEggs", characterData.easterEggs || {});
  stateManager.setState("threeD", characterData.threeD || {});
  stateManager.setState("audio", characterData.audio || {});
  stateManager.setState("meta", characterData.meta || {});

  // ----- 4. Apply theme (colors, fonts) -----
  themeEngine.apply(characterData.theme, characterData.character);

  // ----- 5. Setup router -----
  const router = new Router(stateManager, eventBus);
  // Router will handle page rendering and navigation

  // ----- 6. Render navigation -----
  const navContainer = document.querySelector(".site-navigation");
  if (navContainer) {
    const navigation = new Navigation(
      navContainer,
      router,
      stateManager,
      eventBus
    );
    navigation.render();
  } else {
    logger.warn("Navigation container not found.");
  }

  // ----- 7. Initialise features (Easter eggs, whispers, parallax) -----
  const easterEggs = new EasterEggs(stateManager);

  window.App = window.App || {};
  window.App.whisper = easterEggs.whisperController; // exposed for SisterPage

  // Auto-play whisper audio using the existing controller
  easterEggs.whisperController.autoPlay();
  // Parallax
  const parallax = new ParallaxController();

  // ----- 8. Initialize 3D background -----
  const canvas = document.getElementById("ambient-canvas");
  if (canvas && characterData.threeD) {
    try {
      // Make canvas visible and positioned
      canvas.style.display = "block";
      canvas.style.opacity = "0.25";

      const engine = new ThreeEngine(canvas);
      await engine.init();

      // Pass the character data to ambient scene
      const ambientScene = new AmbientScene(canvas, characterData);
      const sceneManager = await ambientScene.init(engine);

      if (sceneManager) {
        engine.addScene("ambient", sceneManager);
        engine.setActiveScene("ambient");
        engine.start();
        logger.log("3D ambient scene started.");
      } else {
        throw new Error("Scene manager creation failed");
      }
    } catch (error) {
      logger.warn("3D scene failed to initialize:", error);
      canvas.style.display = "none";
    }
  } else {
    // Hide canvas if no 3D config
    if (canvas) canvas.style.display = "none";
  }

  // ----- 9. Handle initial route -----
  const initialPath = window.location.pathname;
  await router.handleRoute(initialPath);

  // ----- 10. Hide loader -----
  const loader = document.getElementById("app-loader");
  if (loader) loader.classList.add("hidden");

  // ----- 11. Broadcast ready event -----
  eventBus.emit("app:ready");

  logger.log("Application ready.");

  // (Optional) Re‑collect parallax elements after initial render
  setTimeout(() => parallax.collectElements(), 300);
});
