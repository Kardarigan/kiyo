import { Logger } from "../utils/Logger.js";

export class Navigation {
  constructor(container, router, stateManager, eventBus) {
    this.container = container;
    this.router = router;
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.logger = new Logger("Navigation");
    this.activeRoute = "home";
    this.navItems = [
      { id: "home", label: "Home", path: "/" },
      { id: "about", label: "About", path: "/about" },
      { id: "journal", label: "Field Journal", path: "/journal" },
      { id: "artifacts", label: "Artifacts", path: "/artifacts" },
      { id: "sister", label: "My Muse", path: "/sister" },
    ];
  }

  render() {
    this.container.innerHTML = `
      <nav class="main-nav">
        <div class="nav-brand">
          <span class="brand-name">Korekiyo Shinguji</span>
        </div>
        <div class="nav-links">
          ${this.navItems
            .map(
              (item) => `
            <a href="${item.path}" class="nav-link" data-route="${item.id}">${item.label}</a>
          `
            )
            .join("")}
        </div>
      </nav>
    `;
    this.container.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const path = link.getAttribute("href");
        this.router.navigate(path);
      });
    });

    this.eventBus.on("route:changed", (pageName) => this.setActive(pageName));
  }

  setActive(routeId) {
    this.activeRoute = routeId;
    this.container.querySelectorAll(".nav-link").forEach((link) => {
      const isActive = link.dataset.route === routeId;
      link.classList.toggle("active", isActive);
      link.setAttribute("aria-current", isActive ? "page" : "false");
    });
  }
}
