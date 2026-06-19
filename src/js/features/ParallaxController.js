export class ParallaxController {
  constructor() {
    this.elements = [];
    this.ticking = false;
    this.scrollY = 0;
    this.rafId = null;
    this.init();
  }

  init() {
    this.collectElements();

    // Watch for DOM changes
    this.observer = new MutationObserver(() => this.collectElements());
    this.observer.observe(document.body, { childList: true, subtree: true });

    // Scroll listener with RAF
    window.addEventListener(
      "scroll",
      () => {
        this.scrollY = window.scrollY;
        if (!this.ticking) {
          this.ticking = true;
          this.rafId = requestAnimationFrame(() => {
            this.update();
            this.ticking = false;
          });
        }
      },
      { passive: true }
    );

    // Also update on resize
    window.addEventListener(
      "resize",
      () => {
        this.collectElements();
      },
      { passive: true }
    );

    // Initial update
    this.scrollY = window.scrollY;
    this.update();
  }

  collectElements() {
    this.elements = [];
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      // Store original position
      if (!el._originalTransform) {
        el._originalTransform = el.style.transform || "";
      }
      this.elements.push({ el, speed });
    });

    // Also collect images with .portrait-main, .portrait-side, .sister-image
    document
      .querySelectorAll(
        ".portrait-main, .portrait-side, .sister-image, .artifact-image"
      )
      .forEach((el) => {
        if (!el.dataset.parallax) {
          el.dataset.parallax = "0.08";
          const speed = 0.08;
          if (!el._originalTransform) {
            el._originalTransform = el.style.transform || "";
          }
          this.elements.push({ el, speed });
        }
      });
  }

  update() {
    const vh = window.innerHeight;
    this.elements.forEach(({ el, speed }) => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = center - vh / 2;

      // Only apply if element is near viewport
      if (rect.bottom > -200 && rect.top < vh + 200) {
        const offset = dist * speed;
        el.style.transform = `${
          el._originalTransform || ""
        } translateY(${offset}px)`;
        el.style.willChange = "transform";
      }
    });
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    window.removeEventListener("scroll", this.update);
    if (this.observer) this.observer.disconnect();
  }
}
