import { Logger } from "../utils/Logger.js";
import { DomHelper } from "../utils/DomHelper.js";

class ArtifactsPage {
  constructor(container, stateManager, eventBus) {
    this.container = container;
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.logger = new Logger("ArtifactsPage");

    this.pages = this.stateManager.getState("pages");
    this.activeItem = null;
  }

  async render() {
    const artifactsData = this.pages?.artifacts;

    if (!artifactsData) {
      this.container.innerHTML =
        '<div class="error-state"><p>Artifacts collection unavailable.</p></div>';
      return;
    }

    this.container.innerHTML = `
      <section class="artifacts-section page-section">
        
        <header class="page-header fade-enter">
          <h1 class="heading-1">${DomHelper.escapeHtml(
            artifactsData.title
          )}</h1>
          <p class="body-large text-muted">${DomHelper.escapeHtml(
            artifactsData.description
          )}</p>
          <div class="header-ornament"></div>
        </header>
        
        <div class="artifacts-grid">
          ${artifactsData.items
            .map(
              (item, index) => `
            <article class="artifact-card card slide-up-enter" data-artifact="${index}">
              <div class="artifact-image-container">
                <img 
                  src="/images/korekiyo/${DomHelper.escapeHtml(item.image)}" 
                  alt="${DomHelper.escapeHtml(item.name)}"
                  class="artifact-image"
                  loading="lazy"
                >
                ${
                  item.threed
                    ? '<span class="artifact-badge text-accent">3D View</span>'
                    : ""
                }
              </div>
              <div class="artifact-info">
                <h3 class="artifact-name heading-3">${DomHelper.escapeHtml(
                  item.name
                )}</h3>
                <p class="artifact-origin text-muted">${DomHelper.escapeHtml(
                  item.origin
                )}</p>
                <p class="artifact-desc body-text">${DomHelper.escapeHtml(
                  item.description.substring(0, 120)
                )}...</p>
              </div>
            </article>
          `
            )
            .join("")}
        </div>
        
      </section>
      
      <!-- Artifact detail modal -->
      <div id="artifact-modal" class="modal hidden" aria-hidden="true">
        <div class="modal-overlay"></div>
        <div class="modal-content modal-artifact">
          <button class="modal-close btn btn-ghost" aria-label="Close">✕</button>
          <div class="modal-body"></div>
        </div>
      </div>
    `;

    // Bind click handlers
    this.container.querySelectorAll(".artifact-card").forEach((card) => {
      card.addEventListener("click", () => {
        const index = parseInt(card.dataset.artifact);
        this.openDetail(index, artifactsData.items[index]);
      });
    });

    // Modal close
    const modal = this.container.querySelector("#artifact-modal");
    if (modal) {
      modal
        .querySelector(".modal-overlay")
        .addEventListener("click", () => this.closeDetail());
      modal
        .querySelector(".modal-close")
        .addEventListener("click", () => this.closeDetail());
    }

    document.addEventListener("keydown", this.handleKeydown);
    this.initScrollReveal();
  }

  handleKeydown = (e) => {
    if (e.key === " Escape") this.closeDetail();
  };

  openDetail(index, item) {
    const modal = this.container.querySelector("#artifact-modal");
    const body = modal.querySelector(".modal-body");

    body.innerHTML = `
      <div class="modal-artifact-layout">
        <div class="modal-artifact-image">
          <img 
            src="/images/korekiyo/${DomHelper.escapeHtml(item.image)}" 
            alt="${DomHelper.escapeHtml(item.name)}"
          >
        </div>
        <div class="modal-artifact-info">
          <span class="text-accent">${DomHelper.escapeHtml(item.origin)}</span>
          <h2 class="heading-2">${DomHelper.escapeHtml(item.name)}</h2>
          <div class="header-ornament"></div>
          <p class="body-large">${DomHelper.escapeHtml(item.description)}</p>
          ${
            item.threed
              ? '<p class="text-muted handwritten">— Rotate view available in 3D viewer</p>'
              : ""
          }
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    this.activeItem = index;
  }

  closeDetail() {
    const modal = this.container.querySelector("#artifact-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    this.activeItem = null;
  }

  initScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 }
    );

    this.container.querySelectorAll(".slide-up-enter").forEach((el) => {
      observer.observe(el);
    });
  }

  destory() {
    document.removeEventListener("keydown", this.handleKeydown);
    document.body.style.overflow = "";
  }
}

module.exports = { ArtifactsPage };
