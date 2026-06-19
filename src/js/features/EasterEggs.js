import { WhisperController } from "./WhisperController.js";

export class EasterEggs {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.easterEggsData = stateManager.getState("easterEggs") || {};
    this.whisperController = new WhisperController(
      stateManager.getState("audio") || {}
    );
    this.typedPhrase = "";
    this.phraseTimeout = null;
    this.secretPhrase = this.easterEggsData.secretPhrase || "Miyadera";
    this.secretResponse =
      this.easterEggsData.secretResponse || "She approves of your curiosity.";
    this.glitchEnabled = this.easterEggsData.glitchOnHover !== false;
    this.init();
  }

  init() {
    document.addEventListener("keydown", this.handleKeydown.bind(this));
    if (this.glitchEnabled) this.initGlitchEffect();
    this.initCornerSecret();
  }

  handleKeydown(e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    this.typedPhrase += e.key;
    if (this.typedPhrase.length > 20)
      this.typedPhrase = this.typedPhrase.slice(-20);
    if (
      this.typedPhrase.toLowerCase().includes(this.secretPhrase.toLowerCase())
    ) {
      this.triggerSecret();
      this.typedPhrase = "";
    }
    clearTimeout(this.phraseTimeout);
    this.phraseTimeout = setTimeout(() => {
      this.typedPhrase = "";
    }, 4000);
  }

  triggerSecret() {
    this.whisperController.playWhisper(this.secretResponse);
    document.body.style.filter = "hue-rotate(30deg)";
    setTimeout(() => {
      document.body.style.filter = "";
    }, 200);
    this.showSecretMessage(this.secretResponse);
  }

  showSecretMessage(text) {
    const msg = document.createElement("div");
    msg.className = "secret-message";
    msg.textContent = text;
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
    corner.style.cssText =
      "position:fixed;top:0;left:0;width:30px;height:30px;z-index:9998;opacity:0;";
    corner.addEventListener("click", () => this.triggerSecret());
    document.body.appendChild(corner);
  }

  destroy() {
    document.removeEventListener("keydown", this.handleKeydown);
    this.whisperController.stop();
  }
}
