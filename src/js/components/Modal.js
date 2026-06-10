/*
 * Reusable modal component
 */

class Modal {
  constructor() {
    this.isOpen = false;
    this.onClose = null;
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  open(content, onClose = null) {
    // Find or create modal
    let modal = document.getElementById("global-modal");

    if (!modal) {
      modal = document.createElement("div");
      modal.id = "global-modal";
      modal.className = "modal";
      modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <button class="modal-close btn btn-ghost" aria-label="Close">✕</button>
          <div class="modal-body"></div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    modal.querySelector(".modal-body").innerHTML = content;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");

    this.isOpen = true;
    this.onClose = onClose;

    // Bind events
    modal
      .querySelector(".modal-overlay")
      .addEventListener("click", () => this.onClose());
    modal
      .querySelector(".modal-close")
      .addEventListener("click", () => this.onClose());
    document.addEventListener("keydown", this.handleKeydown);

    document.body.style.overflow = "hidden";
  }

  close() {
    const modal = document.getElementById("global-modal");
    if (!modal) return;

    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");

    this.isOpen = false;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", this.handleKeydown);

    if (this.onClose) this.onClose();
  }

  handleKeydown(e) {
    if (e.key === "Escape") this.close();
  }
}

module.exports = { Modal };
