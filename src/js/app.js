// Application entry point

import { Engine } from "./core/Engine.js";
import { Logger } from "./utils/Logger.js";

const logger = new Logger("App");

document.addEventListener("DOMContentLoaded", async () => {
  logger.log("Initializing application...");

  const engine = new Engine();

  try {
    await engine.boot();
    logger.log("Application ready");
  } catch (error) {
    logger.error("Failed to boot application", error);

    // Show fallback message
    const container = document.getElementById("page-container");
    if (container) {
      container.innerHTML = `
        <div class="error-state">
          <h2>Something went wrong</h2>
          <p>Failed to load character data. Please try again later.</p>
        </div>
      `;
    }
  }
});
