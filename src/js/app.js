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

  // ----- Core instances -----
  const eventBus = new EventBus();
  const stateManager = new StateManager(eventBus);
  const dataLoader = new DataLoader();
  const themeEngine = new ThemeEngine();

  // ----- Load character data -----
  const characterData = await dataLoader.fetchCharacter();
  if (!characterData) {
    document.getElementById("app-loader").classList.add("hidden");
    document.getElementById("page-container").innerHTML =
      '<div class="error-state"><p>Failed to load character data. Please try again later.</p></div>';
    logger.error("No character data received.");
    return;
  }

  // ----- Zipper Sound on Clicks -----
  document.addEventListener("click", (e) => {
    const zipper = document.getElementById("zipper-sound");
    if (zipper) {
      zipper.currentTime = 0;
      zipper.play().catch(() => {});
    }
  });

  // ----- Unlock audio on first user interaction -----
  const unlockAudio = () => {
    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audio) => {
      audio
        .play()
        .then(() => audio.pause())
        .catch(() => {});
    });
    document.removeEventListener("click", unlockAudio);
    document.removeEventListener("touchstart", unlockAudio);
  };
  document.addEventListener("click", unlockAudio, { once: true });
  document.addEventListener("touchstart", unlockAudio, { once: true });

  // ----- Loop and Opening Song -----
  const opening = document.getElementById("opening-music");
  const loop = document.getElementById("bg-music");
  if (opening && loop) {
    opening.volume = 0.3;
    loop.volume = 0.15;
    opening
      .play()
      .then(() => {
        opening.onended = () => {
          loop.play();
        };
      })
      .catch(() => loop.play());
  }

  // ----- Populate state -----
  stateManager.setState("character", characterData.character);
  stateManager.setState("theme", characterData.theme);
  stateManager.setState("pages", characterData.pages);
  stateManager.setState("easterEggs", characterData.easterEggs || {});
  stateManager.setState("threeD", characterData.threeD || {});
  stateManager.setState("audio", characterData.audio || {});
  stateManager.setState("meta", characterData.meta || {});

  // ----- Apply theme (colors, fonts) -----
  themeEngine.apply(characterData.theme, characterData.character);

  // ----- Setup router -----
  const router = new Router(stateManager, eventBus);
  // Router will handle page rendering and navigation

  // ----- Render navigation -----
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

  // ----- Initialise features (easter eggs, whispers, parallax) -----
  const easterEggs = new EasterEggs(stateManager);

  window.App = window.App || {};
  window.App.whisper = easterEggs.whisperController;

  // Autoplay whisper audio using the existing controller
  easterEggs.whisperController.autoPlay();
  // Parallax
  const parallax = new ParallaxController();

  // ----- Initialize 3D background -----
  const canvas = document.getElementById("ambient-canvas");
  if (canvas && characterData.threeD) {
    try {
      canvas.style.display = "block";
      canvas.style.opacity = "0.3"; // increase opacity
      const engine = new ThreeEngine(canvas);
      await engine.init();
      const ambientScene = new AmbientScene(canvas, characterData);
      const sceneManager = await ambientScene.init(engine);
      if (sceneManager) {
        engine.addScene("ambient", sceneManager);
        engine.setActiveScene("ambient");
        engine.start();
        logger.log("3D ambient scene started.");
      }
    } catch (error) {
      logger.warn("3D scene failed:", error);
      canvas.style.display = "none";
    }
  } else {
    if (canvas) canvas.style.display = "none";
  }

  // ----- Handle initial route -----
  const initialPath = window.location.pathname;
  await router.handleRoute(initialPath);

  // -----  Hide loader -----
  const loader = document.getElementById("app-loader");
  if (loader) loader.classList.add("hidden");

  // -----  Broadcast ready event -----
  eventBus.emit("app:ready");
  logger.log("Application ready.");

  // recollect parallax elements after initial render
  setTimeout(() => parallax.collectElements(), 300);
});
