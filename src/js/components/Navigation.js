import { Logger } from "../utils/Logger.js";

class Navigation {
  constructor(container, router, stateManager, eventBus) {
    this.container = container;
    this.router = router;
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.logger = new Logger("Navigation");

    this.activeRoute = "home";

    // navigation items defined by the character's pages
    this.navItems = [
      { id: "home", label: "Home", path: "/app" },
      { id: "about", label: "About", path: "/app/about" },
      { id: "journal", label: "Field Journal", path: "/app/journal" },
      { id: "artifacts", label: "Artifacts", path: "/app/artifacts" },
      { id: "sister", label: "My Muse", path: "/app/sister" },
    ];

    // Listen for route changes
    this.eventBus.on("route:changed", (pageName) => {
      this.setActive(pageName);
    });
  }

  static render(container) {
    container.innerHTML = `
    <nav class="main-nav">
      <div class="nav-brand">
        <span class="brand-name">Korekiyo Shinguji</span>
      </div>
      <div class="nav-links">
        <a href="/app" class="nav-link">Home</a>
        <a href="/app/about" class="nav-link">About</a>
        <a href="/app/journal" class="nav-link">Journal</a>
        <a href="/app/artifacts" class="nav-link">Artifacts</a>
        <a href="/app/sister" class="nav-link">Sister</a>
      </div>
    </nav>
  `;
  }

  setActive(routeId) {
    this.activeRoute = routeId;
    this.container.querySelectorAll(".nav-link").forEach((link) => {
      const isActive = link.dataset.route === routeId;
      link.setAttribute("aria-content", isActive ? "page" : "false");
      link.classList.toggle("active", isActive);
    });
  }
}

module.exports = { Navigation };
