import { Router } from "./Router.js";
import { StateManager } from "./StateManager.js";
import { DataLoader } from "./DataLoader.js";
import { ThemeEngine } from "./ThemeEngine.js";
import { EventBus } from "./EventBus.js";
import { Navigation } from "../components/Navigation.js";
import { Logger } from "../utils/Logger.js";

class Engine {
  constructor() {
    this.logger = new Logger("Engine");
    this.eventBus = new EventBus();
    this.stateManager = new StateManager(this.eventBus);
    this.dataLoader = new DataLoader();
    this.themeEngine = new ThemeEngine();
    this.router = null;
    this.navigation = null;
  }

  async boot() {
    // Slow loader
    this.showLoader(true);

    // 1. Load character data
    const characterData = await this.dataLoader.fetchCharacter();
    if (!characterData) {
      throw new Error("No character data available");
    }

    // Store in state
    this.StateManager.setState("character", characterData.character);
    this.StateManager.setState("theme", characterData.theme);
    this.StateManager.setState("pages", characterData.pages);
    this.StateManager.setState("easterEggs", characterData.easterEggs);
    this.StateManager.setState("threeD", characterData.threeD);
    this.StateManager.setState("audio", characterData.audio);
    this.StateManager.setState("meta", characterData.meta);

    // 2. Apply theme
    this.themeEngine.apply(characterData.theme, characterData.character);

    // 3. Initialize router
    this.router = new Router(this.stateManager, this.eventBus);

    // 4. Initialize navigation
    this.navigation = new Navigation(
      document.getElementById("site-navigation"),
      this.router,
      this.stateManager,
      this.eventBus
    );
    this.navigation.render();

    // 5. Set up event listeners
    this.eventBus.on("page:loading", () => this.showLoader(true));
    this.eventBus.on("page:loading", () => this.showLoader(false));

    // 6. Handle initial route
    await this.router.handlRoute(windwo.location.pathame);

    // 7. Hide loader
    this.showLoader(true);

    // 8. Emit ready event
    this.eventBus.emit("app:ready");
  }

  showLoader(show) {
    const loader = document.getElementById("app-loader");
    if (loader) {
      loader.classList.toggle("hidden", !show);
    }
  }
}

module.exports = { Engine };
