/*
 * Typewriter text effect
 * Used on splash page and somewhere else
 */

export class Typewriter {
  constructor(element, options = {}) {
    this.element = element;
    this.text = options.text || element.textContent;
    this.speed = options.speed || 60;
    this.delay = options.delay || 0;
    this.cursor = options.cursor !== false;
    this.cursorChar = options.cursorChar || "_";
    this.onComplete = options.onComplete || null;

    this.currentIndex = 0;
    this.isTyping = false;
  }

  async start() {
    this.isTyping = true;
    this.element.textContent = "";
    this.currentIndex = 0;

    await this.wait(this.delay);

    return new Promise((resolve) => {
      this.resolve = resolve;
      this.type();
    });
  }

  type() {
    if (!this.isTyping) return;

    if (this.currentIndex < this.text.length) {
      // Remove cursor if present
      if (this.cursor && this.element.textContent.endsWith(this.cursorChar)) {
        this.element.textContent = this.element.textContent.slice(0, -1);
      }

      // Add next character
      this.element.textContent += this.text.charAt(this.currentIndex);
      this.currentIndex++;

      // Add cursor back
      if (this.cursor) {
        this.element.textContent += this.cursorChar;
      }

      setTimeout(() => {
        this.type();
      }, this.speed + Math.random() * 40);
    } else {
      this.isTyping = false;
      // Remove final cursor
      if (this.cursor && this.element.textContent.endsWith(this.cursorChar)) {
        this.element.textContent = this.element.textContent.slice(0, -1);
      }
      if (this.onComplete) this.onComplete();
      if (this.resolve) this.resolve();
    }
  }

  stop() {
    this.isTyping = false;
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
