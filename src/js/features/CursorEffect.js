/*
 * Custom Zipper Cursor
 * replaces the default cursor with a zipper pull that follows the mouse.
 * plays a subtle zipper sound on click btw
 */

class CursorEffect {
  constructor() {
    this.cursorElement = null;
    this.isVisible = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.audio = null;
    this.audioLoaded = false;
    this.enabled = true;

    this.init();
  }

  init() {
    // create cursor element if not already in DOM
    this.cursorElement = document.getElementById("custom-cursor");
    if (!this.cursorElement) {
      this.cursorElement = document.createElement("div");
      this.cursorElement.id = "custom-cursor";
      this.cursorElement.className = "custom-cursor";
      this.cursorElement.innerHTML = '<span class="cursor-zipper">⏤</span>';
      this.cursorElement.setAttribute("aria-hidden", true);
      document.body.appendChild(this.cursorElement);
    }

    // Preload zipper sound
    this.audio = new Audio("/audio/zipper-sound.mp3");
    this.audio.volume = 0.15;
    this.audio.addEventListener("canplaythrough", () => {
      this.audioLoaded = true;
    });

    // Hide default cursor on non touch devices
    if (!this.isTouchDevice()) {
      document.documentElement.style.cursor = "none";
    }

    // Events
    document.addEventListener("mousemove", this.onMouseMove.bind(this), {
      passive: true,
    });
    document.addEventListener("mouseenter", this.onMouseEnter.bind(this));
    document.addEventListener("mouseleave", this.onMouseLeave.bind(this));
    document.addEventListener("click", this.onClick.bind(this));

    // Handle interactive elements - show alternative cursor state
    document
      .querySelectorAll(
        'a, button, input, textarea, [role="button"], .journal-entry, .artifact-card'
      )
      .forEach((el) => {
        el.addEventListener("mouseenter", () => {
          this.cursorElement.classList.add("cursor-interactive");
        });
        el.addEventListener("mouseleave", () => {
          this.cursorElement.classList.remove("cursor-interactive");
        });
      });

    // start animation loop
    this.animate();
  }

  isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  onMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    this.isVisible = true;
  }

  onMouseEnter() {
    this.isVisible = true;
    this.cursorElement.style.opacity = "1";
  }

  onMouseLeave() {
    this.isVisible = false;
    this.cursorElement.style.opacity = "0";
  }

  onClick() {
    if (!this.enabled || !this.audioLoaded) return;
    // Play zipper sound with slight randomness
    this.audio.currentTime = 0;
    this.audio.playbackRate = 0.9 + Math.random() * 0.2;
    this.audio.play().catch(() => {});
  }

  animate() {
    // Smooth follow with easing
    const ease = 0.15;
    this.currentX += (this.mouseX - this.currentX) * ease;
    this.currentY += (this.mouseY - this.currentY) * ease;

    if (this.cursorElement) {
      this.cursorElement.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
    }

    requestAnimationFrame(this.animate.bind(this));
  }

  setEnabled(state) {
    this.enabled = state;
    if (!state) {
      document.documentElement.style.cursor = "auto";
      this.cursorElement.style.display = "none";
    } else {
      if (!this.isTouchDevice()) {
        document.documentElement.style.cursor = "none";
      }
      this.cursorElement.style.display = "block";
    }
  }

  destroy() {
    document.documentElement.style.cursor = "auto";
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseenter", this.onMouseEnter);
    document.removeEventListener("mouseleave", this.onMouseLeave);
    document.removeEventListener("click", this.onClick);
    if (this.cursorElement) this.cursorElement.remove();
  }
}

module.exports = { CursorEffect };
