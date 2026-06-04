/*
 * Loader Component
 * controls the loading overlay visibility
 */

export class Loader {
  constructor() {
    this.element = document.getElementById("app-loader");
  }

  show() {
    if (this.element) {
      this.element.classList.remove("hidden");
    }
  }

  hide() {
    if (this.element) {
      this.element.classList.add("hidden");
    }
  }

  setVisible(visible) {
    if (visible) this.show();
    else this.hide();
  }
}
