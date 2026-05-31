import { Logger } from "../utils/Logger.js";
import { DomHelper } from "../utils/DomHelper.js";

export class HomePage {
  constructor(container, stateManager, eventBus) {
    this.container = container;
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.logger = new Logger("HomePage");

    this.character = this.stateManager.getState("character");
    this.pages = this.stateManager.getState("pages");
  }

  async render() {
    const homeData = this.pages?.home;
    if (!homeData) {
      this.container.innerHTML = "<p>No home page data available.</p>";
      return;
    }

    const character = this.character;

    this.container.innerHTML = `
    <section class="home-hero">
        <div class="hero-content">
            <h1 class="hero-name heading-1">${DomHelper.escapeHtml(
              character.name
            )}</h1>
            <p class="hero-subtitle heading-4 text-accent">${DomHelper.escapeHtml(
              character.title
            )}</p>
            <blockquote class="hero-quote body-large text-muted">
            "${DomHelper.escapeHtml(homeData.heroQuote)}"
            </blockquote>
        </div>
        <div class="hero-image">
            <div class="image-frame">
            <img 
                src="/images/korekiyo/${homeData.featuredImage}" 
                alt="${DomHelper.escapeHtml(character.name)} portrait"
                class="portrait-main"
                loading="eager"
            >
            </div>
        </div>
        </section>
        
        <section class="home-intro">
        <div class="intro-card card">
            <p class="body-large">${DomHelper.escapeHtml(
              character.bio.short
            )}</p>
        </div>
        </section>
        
        ${
          homeData.sections
            ? homeData.sections
                .map((section) => {
                  if (section.type === "quote") {
                    return `
            <section class="home-quote-section">
                <blockquote class="accent-quote">
                <p class="body-text">"${DomHelper.escapeHtml(
                  section.content
                )}"</p>
                </blockquote>
            </section>`;
                  }
                  return "";
                })
                .join("")
            : ""
        }`;
  }

  destroy() {
    // Clear the container's content
    if (this.container) {
      this.container.innerHTML = "";
    }

    // Remove references to avoid memory leaks
    this.container = null;
    this.stateManager = null;
    this.eventBus = null;
    this.logger = null;
    this.character = null;
    this.pages = null;
  }
}
