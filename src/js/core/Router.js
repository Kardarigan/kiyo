import { Logger } from "../utils/Logger.js";
import { HomePage } from "../pages/HomePage.js";
import { AboutPage } from "../pages/AboutPage.js";
import { JournalPage } from "../pages/JournalPage.js";
import { ArtifactsPage } from "../pages/ArtifactsPage.js";
import { SisterPage } from "../pages/SisterPage.js";

export class Router {
  constructor(stateManager, eventBus) {
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.logger = new Logger("Router");
    this.currentPage = null;
    this.container = document.getElementById("page-container");
    this.pages = {
      home: HomePage,
      about: AboutPage,
      journal: JournalPage,
      artifacts: ArtifactsPage,
      sister: SisterPage,
    };
    window.addEventListener("popstate", () =>
      this.handleRoute(window.location.pathname, false)
    );
  }

  async navigate(path) {
    window.history.pushState({}, "", path);
    await this.handleRoute(path, true);
  }

  async handleRoute(path, addToHistory = true) {
    const pageName = this.pathToPageName(path);
    this.logger.log(`Routing to: ${pageName}`);
    this.eventBus.emit("page:loading");

    if (this.container) {
      this.container.style.opacity = "0";
      this.container.style.transform = "translateY(10px)";
    }
    await new Promise((r) => setTimeout(r, 200));

    if (this.currentPage && typeof this.currentPage.destroy === "function") {
      this.currentPage.destroy();
    }
    this.container.innerHTML = "";

    const PageClass = this.pages[pageName];
    if (!PageClass) {
      this.container.innerHTML = `<div class="error-state fade-enter"><h2>Page Not Found</h2><p class="text-muted">The page you're looking for does not exist.</p></div>`;
      this.eventBus.emit("page:loaded");
      this.container.style.opacity = "1";
      this.container.style.transform = "translateY(0)";
      return;
    }

    try {
      this.currentPage = new PageClass(
        this.container,
        this.stateManager,
        this.eventBus
      );
      await this.currentPage.render();
    } catch (error) {
      this.logger.error(`Failed to render "${pageName}"`, error);
      this.container.innerHTML = `<div class="error-state fade-enter"><h2>Error loading page</h2><p class="text-muted">Something went wrong. Please try again.</p></div>`;
    }

    this.eventBus.emit("route:changed", pageName);
    this.eventBus.emit("page:loaded");
    this.container.style.opacity = "1";
    this.container.style.transform = "translateY(0)";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  pathToPageName(path) {
    const clean = path.replace(/^\/+|\/+$/g, "");
    if (
      clean === "" ||
      clean === "app" ||
      clean === "home" ||
      clean === "index"
    )
      return "home";
    const parts = clean.split("/");
    const pageName = parts[0] === "app" ? parts[1] || "home" : parts[0];
    return pageName || "home";
  }
}
