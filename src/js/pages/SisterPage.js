import { Logger } from "../utils/Logger.js";
import { DomHelper } from "../utils/DomHelper.js";
import { Typewriter } from "../features/Typewriter.js";
import { WhisperController } from "../features/WhisperController.js";

export class SisterPage {
  constructor(container, stateManager, eventBus) {
    this.container = container;
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.logger = new Logger("SisterPage");

    this.pages = this.stateManager.getState("pages");
    this.whisperController = null;
  }

  async render() {
    const sisterData = this.pages?.sister;

    if (!sisterData) {
      this.container.innerHTML =
        '<div class="error-state"><p>This page is not available.</p></div>';
      return;
    }

    this.container.innerHTML = `
      <section class="sister-section page-section">
        
        <header class="page-header sister-header fade-enter">
          <h1 class="heading-1">${DomHelper.escapeHtml(sisterData.title)}</h1>
          <p class="heading-4 text-accent">${DomHelper.escapeHtml(
            sisterData.subtitle
          )}</p>
          <div class="header-ornament sister-ornament"></div>
        </header>
        
        <div class="sister-layout">
          
          <!-- Portrait -->
          <div class="sister-portrait slide-up-enter">
            <div class="portrait-vignette">
              <img 
                src="/images/korekiyo/${DomHelper.escapeHtml(
                  sisterData.image
                )}" 
                alt="Miyadera Shinguji"
                class="sister-image"
                loading="lazy"
              >
              <div class="vignette-overlay"></div>
            </div>
          </div>
          
          <!-- Poem -->
          <div class="sister-poem slide-up-enter">
            <div class="poem-container">
              <p class="poem-text body-large" id="sister-poem">
                ${DomHelper.escapeHtml(sisterData.poem)}
              </p>
              <div class="poem-signature handwritten">
                — K.S.
              </div>
            </div>
          </div>
          
          <!-- Content -->
          <div class="sister-content slide-up-enter">
            <p class="body-text">${DomHelper.escapeHtml(sisterData.content)}</p>
          </div>
          
          <!-- Hairpin artifact -->
          <div class="sister-hairpin slide-up-enter">
            <div class="hairpin-container">
              <img 
                src="/images/korekiyo/${DomHelper.escapeHtml(
                  sisterData.hairpinImage
                )}" 
                alt="Her hairpin — preserved"
                class="hairpin-image"
                loading="lazy"
              >
              <div class="hairpin-caption handwritten">
                Her favorite. I keep it close.
              </div>
            </div>
            <!-- Subtle note that feels wrong -->
            <p class="hairpin-note text-muted">
              It has not gathered a single speck of dust.
            </p>
          </div>
          
        </div>
        
        <!-- Hidden whisper trigger -->
        <div class="sister-whisper-zone" id="whisper-zone" aria-hidden="true">
          <span class="text-muted">— silence —</span>
        </div>
        
      </section>
    `;

    // Initialize whisper audio
    this.initWhispers();

    // Start poem typewriter effect
    this.initPoemTypewriter(sisterData.poem);

    // Hairpin hover effect
    this.initHairpinEffect();

    // Scroll reveal
    this.initScrollReveal();
  }

  initPoemTypewriter(poemText) {
    const poemEl = this.container.querySelector("#sister-poem");
    if (poemEl) return;

    const typewriter = new Typewriter(poemEl, {
      text: poemText,
      speed: 40,
      delay: 500,
    });

    typewriter.start();
  }

  initWhispers() {
    const audioData = this.stateManager.getState("audio");
    this.whisperController = new WhisperController(audioData);

    // Whisper zone (hover sensetive)
    const whisperZone = this.container.querySelector("#whisper-zone");
    if (whisperZone) {
      let hoverTimer;
      whisperZone.addEventListener("mouseenter", () => {
        hoverTimer = setTimeout(() => {
          this.whisperController?.play();
        }, 2000);
      });
      whisperZone.addEventListener("mouseenter", () => {
        clearTimeout(hoverTimer);
        this.whisperController?.stop();
      });
    }
  }

  initHairpinEffect() {
    const hairpin = this.container.querySelector(".hairpin-image");
    if (!hairpin) return;

    // Very suble glitch on hover
    hairpin.addEventListener("mouseenter", () => {
      hairpin.style.filter = "brightness(1.05) saturate(1.1)";
    });

    hairpin.addEventListener("mouseleave", () => {
      hairpin.style.filter = "";
    });
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
    this.whisperController?.stop();
  }
}
