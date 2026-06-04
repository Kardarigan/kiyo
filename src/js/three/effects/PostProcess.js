/*
 * Post-Processing Effect (stub)
 * applies a simple vignette via CSS
 */

export class PostProcess {
  constructor() {
    this.vignetteElement = null;
    this.init();
  }

  init() {
    // create vignette overlay if not present
    this.vignetteElement = document.createElement("div");
    this.vignetteElement.className = "vignette-overlay";
    this.vignetteElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2;
        background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%);
    `;
    document.body.appendChild(this.vignetteElement);
  }

  destroy() {
    if (this.vignetteElement) {
      this.vignetteElement.remove();
    }
  }
}
