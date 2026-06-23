import { Logger } from "../utils/Logger.js";
import { DomHelper } from "../utils/DomHelper.js";

export class JournalPage {
  constructor(container, stateManager, eventBus) {
    this.container = container;
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.logger = new Logger("JournalPage");

    this.pages = this.stateManager.getState("pages");
    this.activeEntry = null;
  }

  async render() {
    const journalData = this.pages?.journal;

    if (!journalData) {
      this.container.innerHTML =
        '<div class="error-state"><p>Journal entries unavailable</p></div>';
      return;
    }

    this.container.innerHTML = `
        <section class="journal-section page-section">
            <header class="page-header fade-enter">
                <h1 class="heading-1">${DomHelper.escapeHtml(
                  journalData.title
                )}</h1>
                <p class="body-large text-muted">${DomHelper.escapeHtml(
                  journalData.description
                )}</p>
                <div class="header-ornament"></div>
            </header>
            <div class="journal-entries">
                ${journalData.entries
                  .map(
                    (entry, index) => `
                <article class="journal-entry card slide-up-enter" data-entry="${index}">
                    <div class="entry-meta">
                    <span class="entry-date text-accent">${DomHelper.escapeHtml(
                      entry.date
                    )}</span>
                    ${
                      entry.location
                        ? `<span class="entry-location text-muted">${DomHelper.escapeHtml(
                            entry.location
                          )}</span>`
                        : ""
                    }
                    </div>
                    <h2 class="entry-title heading-3">${DomHelper.escapeHtml(
                      entry.title
                    )}</h2>
                    <div class="entry-preview body-text">
                    <p>${DomHelper.escapeHtml(
                      entry.content.substring(0, 200)
                    )}...</p>
                    </div>
                    <button class="btn btn-ghost read-more-btn" data-entry="${index}">
                    Read Full Entry
                    </button>
                </article>
                `
                  )
                  .join("")}
            </div>
        </section>
        
        <!-- Entry modal -->
        <div id="entry-modal" class="modal hidden" aria-hidden="true">
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close btn btn-ghost" aria-label="Close entry">✕</button>
                <div class="modal-body"></div>
            </div>
        </div>
    `;

    // Bind entry click handlers
    this.container.querySelectorAll(".read-more-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(btn.dataset.entry);
        this.openEntry(index, journalData.entries[index]);
      });
    });

    // Bind modal close
    const modal = this.container.querySelector("#entry-modal");
    if (modal) {
      modal
        .querySelector(".modal-overlay")
        .addEventListener("click", () => this.closeEntry());
      modal
        .querySelector(".modal-close")
        .addEventListener("click", () => this.closeEntry());
    }

    // Keyboad close
    document.addEventListener("keydown", this.handleKeydown);

    // Scroll reveal
    this.initScrollReveal();
  }

  handleKeydown = (e) => {
    if (e.key === "Escape") {
      this.closeEntry();
    }
  };

  openEntry(index, entry) {
    const modal = this.container.querySelector("#entry-modal");
    const body = modal.querySelector(".modal-body");

    body.innerHTML = `
      <div class="modal-entry-header">
          <span class="entry-date text-accent">${DomHelper.escapeHtml(
            entry.date
          )}</span>
          <span class="entry-location text-muted">${DomHelper.escapeHtml(
            entry.location || ""
          )}</span>
      </div>
      <h2 class="heading-2">${DomHelper.escapeHtml(entry.title)}</h2>
      <div class="header-ornament"></div>
      <div class="entry-full body-large">
          <p>${DomHelper.escapeHtml(entry.content)}</p>
      </div>
      <div class="modal-entry-footer handwritten">
          - K.S.
      </div>
    `;

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    this.activeEntry = index;
  }

  closeEntry() {
    const modal = this.container.querySelector("#entry-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    this.activeEntry = null;
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
    document.removeEventListener("keydown", this.handleKeydown);
    document.body.style.overflow = "";
  }
}
