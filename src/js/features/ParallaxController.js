/*
 * Subtle Parallax Effect
 * adds depth to the page by moving certain elements at different rates on scroll.
 */

export class ParallaxController {
  constructor() {
    this.elements = [];
    this.ticking = false;
    this.scrollY = 0;

    this.init();
  }

  init() {
    // Find all elements with data-parallax attribute
    this.conllectElements();

    // Observe DOM changes to catch dynamically added elements
    this.observer = new MutationObserver(() => this.conllectElements);
    this.observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener(
      "scroll",
      () => {
        this.scrollY = window.scrollY;
        if (!this.ticking) {
          requestAnimationFrame(() => {
            this.update();
            this.ticking = false;
          });
          this.ticking = true;
        }
      },
      { passive: true }
    );
    // Initial update
    this.scrollY = window.scrollY;
    this.update();
  }

  conllectElements() {
    this.elements = [];
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      this.elements.push({ el, speed });
    });
  }

  update() {
    const viewportHeight = window.innerHeight;

    this.elements.forEach(({ el, speed }) => {
      const rect = el.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = elementCenter - viewportHeight / 2;
      const translateY = distanceFromCenter * speed;

      // Only apply if element is near viewport
      if (rect.bottom > -200 && rect.top < viewportHeight + 200) {
        el.style.transform = `translateY(${translateY}px)`;
      }
    });
  }

  destroy() {
    window.removeEventListener("scroll", this.update);
    if (this.observer) this.observer.disconnect();
  }
}
