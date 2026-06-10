import { WhisperController } from "./WhisperController.js";

/**
 * Easter Eggs Controller
 * Manages hidden interactions:
 *     1- Secret phrase triggers whisper response
 *     2- Konami code alternative (type "Miyadera")
 *     3- Glitch effect on certain images
 *     4- Hidden page conrer click
 */
class EasterEggs {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.easterEggsData = stateManager.getState("easterEggs");
    this.whisperController = null;
    this.typedPhrase = "";
    this.phraseTimeout = null;
    this.glitchEnabled = this.easterEggsData?.glitchOnHover ?? true;

    this.init();
  }

  init() {
    // Listen for secret phrase typing
    document.addEventListener("keydown", this.handleKeydown.bind(this));

    // Glitch effect on portrait images
    if (this.glitchEnabled) {
      this.initGlitchEffect();
    }

    // Hidden corner click (top left corner of page)
    this.initCornerSecret();

    // Init whisper controller for audio easter eggs
    const audioData = this.stateManager.getState("audio");
    this.whisperController = new WhisperController(audioData);
  }

  handleKeydown(e) {
    // Only track if not in an input field
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    // Build typed phrase (last 20 chars)
    this.typedPhrase += e.key;
    if (this.typedPhrase.length > 20) {
      this.typedPhrase = this.typedPhrase.slice(-20);
    }

    // Check for secret phrase
    const secret = this.easterEggsData?.secretPhrase || "Miyadera";
    if (this.typedPhrase.toLowerCase().includes(secret.toLowerCase())) {
      this.triggerSecret();
      this.typedPhrase = "";
    }

    // Reset timeout
    clearTimeout(this.phraseTimeout);
    this.phraseTimeout = setTimeout(() => {
      this.typedPhrase = "";
    }, 4000);
  }

  triggerSecret() {
    const response =
      this.easterEggsData?.secretResponse || "She approves fo your curiosity.";

    // Whisper the response
    if (this.whisperController) {
      this.whisperController.playWhisper(response);
    }

    // Brief glitch effect on the whole page
    document.body.style.filter = "hue-rotate(30deg)";
    setTimeout(() => {
      document.body.style.filter = "";
    }, 200);
  }

  showSecretMessage(text) {
    const msg = document.createElement("div");
    msg.className = "secret-message";
    msg.textContent = text;
    msg.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--color-surface);
        border: 1px solid var(--color-accent);
        color: var(--color-accent);
        padding: 0.5rem 1.5rem;
        font-family: var(--font-accent);
        font-size: 0.8rem;
        letter-spacing: 0.05em;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.5s ease;
    `;
    document.body.appendChild(msg);

    requestAnimationFrame(() => {
      msg.style.opacity = "1";
    });

    setTimeout(() => {
      msg.style.opacity = "0";
      setTimeout(() => msg.remove(), 500);
    }, 3000);
  }

  initGlitchEffect() {
    document
      .querySelectorAll(".portrait-main, .portrait-side, .sister-image")
      .forEach((img) => {
        img.addEventListener("mouseenter", () => {
          img.style.filter = "sepia(0.3) brightness(0.9) hue-rotate(-5deg)";
          img.style.transform = "scale(1.005)";
        });
        img.addEventListener("mouseleave", () => {
          img.style.filter = "";
          img.style.transform = "";
        });
      });
  }

  initCornerSecret() {
    const corner = document.createElement("div");
    corner.className = "secret-corner";
    corner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 30px;
        height: 30px;
        z-index: 9998;
        cursor: default;
        opacity: 0;
    `;
    corner.addEventListener("click", () => {
      this.triggerSecret();
    });
    document.body.appendChild(corner);
  }

  destroy() {
    document.removeEventListener("keydown", this.handleKeydown);
    if (this.whisperController) this.whisperController.stop();
  }
}

module.exports = { EasterEggs };
