import { SplashBlood } from "./features/SplashBlood.js";
import { Typewriter } from "./features/Typewriter.js";
import { CandleScene } from "./three/CandleScene.js";

class SplashController {
  constructor() {
    this.typewriter = document.getElementById("typewriter");
    this.warningBox = document.getElementById("warning-box");
    this.understandBtn = document.getElementById("understand-btn");
    this.bloodCanvas = document.getElementById("blood-canvas");
    this.transitionOverlay = document.getElementById("transition-overlay");
    this.candleCanvas = document.getElementById("candle-canvas");

    this.candleScene = null;
    this.bloodEffect = null;
    this.typewriterEffect = null;

    this.init();
  }

  async init() {
    // Initialize candle 3D scene
    this.candleScene = new CandleScene(this.candleCanvas);
    await this.candleScene.init();
    this.candleScene.startAnimation();

    // Initialize blood effect
    this.bloodEffect = new SplashBlood(this.bloodCanvas);

    // Start typewriter sequence
    this.startSequence();

    // Bind events
    this.understandBtn.addEventListener("click", () => this.onUnderstand());
  }

  startSequence() {
    // Lines fade in automatically via CSS animations
    // After animations complete, show warning

    const totalAnimationTime = 7000; // 7 seconds for all lines

    setTimeout(() => {
      this.typewriter.style.display = "none";
      this.warningBox.classList.remove("hidden");

      // Trigger reflow
      void this.warningBox.offsetWidth;
      this.warningBox.classList.add("visible");
    }, totalAnimationTime);
  }

  async onUnderstand() {
    // Disable button
    this.understandBtn.disabled = true;

    // Extinguish candle
    this.candleScene.extinguish();

    // Wait for darkness
    await this.delay(800);

    // Trigger blood effect
    this.bloodCanvas.classList.remove("hidden");
    this.bloodCanvas.classList.add("active");

    await this.bloodEffect.play();

    // Fade to black
    this.transitionOverlay.classList.remove("hidden");
    this.transitionOverlay.classList.add("active");

    // Navigate to main site
    await this.delay(1500);
    window.location.href = "/app";
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Bootstrap when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new SplashController();
});
