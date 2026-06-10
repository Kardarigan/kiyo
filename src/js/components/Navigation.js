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

  render() {
    const character = this.stateManager.getState("character");

    this.container.innerHTML = `
        <nav class="main-nav" aria-label="Main navigation">
            <div class="nav-brand">
                <span class="brand-name">${character.name.split(" ")[0]}</span>
                <span class="brand-divider">|</span>
                <span class="brand-title text-muted">${character.title}</span>
            </div>
            <ul class="nav-links">
                ${this.navItems
                  .map(
                    (item) => `
                <li>
                    <a 
                    href="${item.path}" 
                    class="nav-link" 
                    data-route="${item.id}"
                    aria-current="${
                      this.activeRoute === item.id ? "page" : "false"
                    }"
                    >
                    ${item.label}
                    </a>
                </li>
                `
                  )
                  .join("")}
            </ul>
        </nav>
    `;

    // Add click handlers
    this.container.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const path = link.getAttribute("href");
        this.router.navigate(path);
      });
    });
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
