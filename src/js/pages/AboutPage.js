import { Logger } from "../utils/Logger.js";
import { DomHelper } from "../utils/DomHelper.js";

export class AboutPage {
  constructor(container, stateManager, eventBus) {
    this.container = container;
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.logger = new Logger("AboutPage");

    this.character = this.stateManager.getState("character");
    this.pages = this.stateManager.getState("pages");
  }

  async render() {
    const aboutData = this.pages?.about;
    const character = this.character;

    if (!aboutData || !character) {
      this.container.innerHTML =
        '<div class="error-state"><p>Content unavailable.</p></div>';
      return;
    }

    this.container.innerHTML = `
      <section class="about-section page-section fade-enter">
          <header class="page-header">
              <h1 class="heading-1">${DomHelper.escapeHtml(
                aboutData.title
              )}</h1>
              <div class="header-ornament"></div>
          </header>
    
          <div class="about-layout">
              <div class="about-content">
                  <div class="about-text body-large slide-up-enter">
                      <p>${DomHelper.escapeHtml(character.bio.full)}</p>
                  </div>
    
                  <div class="about-details slide-up-center">
                      <div class="detail-item">
                          <span class="detail-label text-accent">Affiliation</span
                          ><span class="detail-value">${DomHelper.escapeHtml(
                            character.affiliation
                          )}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label text-accent">Field of Study</span>
                          <span class="detail-value"
                          >Cultural Anthropology &amp; Folkloristics</span
                          >
                      </div>
                      <div class="detail-item">
                          <span class="detail-label text-accent">Focus</span
                          ><span class="detail-value"
                          >Funerary customs, spiritual rituals, the macabre</span
                          >
                      </div>
                  </div>
              </div>
    
              <aside class="about-image slide-up-enter">
                  <div class="image-frame portrait-frame">
                      <img
                          src="/images/korekiyo/${DomHelper.escapeHtml(
                            aboutData.image
                          )}"
                          alt="${DomHelper.escapeHtml(
                            character.name
                          )} — side profile"
                          class="portrait-side"
                          loading="lazy"
                      />
                      <div class="image-caption handwritten">A moment of reflection</div>
                  </div>
              </aside>
          </div>
    
          <div class="about-appearance slide-up-enter">
              <h3 class="heading-3">Physical Description</h3>
                  <div class="appearance-grid">
                  ${Object.entries(character.appearance || {})
                    .map(
                      ([key, value]) => `
                  <div class="appearance-item">
                      <span class="appearance-key text-accent"
                          >${DomHelper.escapeHtml(key)}</span
                      >
                      <span class="appearance-desc">${DomHelper.escapeHtml(
                        value
                      )}</span>
                  </div>`
                    )
                    .join("")}
              </div>
          </div>
      </section>
    `;

    this.initScrollReveal();
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

  destroy() {
    if (this.container) {
      this.container.innerHTML = "";
    }

    this.container = null;
    this.stateManager = null;
    this.eventBus = null;
    this.logger = null;
    this.character = null;
    this.pages = null;
  }
}
