import { DomHelper } from "../utils/DomHelper.js";

/*
 * Image Manager
 * update image references for all character assets.
 */

export class ImageManager {
  constructor(container, characterData, controller) {
    this.container = container;
    this.data = characterData;
    this.controller = controller;
    this.changes = {};
  }

  render() {
    const pages = this.data.pages || {};

    // Collect all image fields
    const imageFields = [
      {
        label: "Home — Featured Image",
        key: "home.featuredImage",
        current: pages.home?.featuredImage,
      },
      {
        label: "About — Profile Image",
        key: "about.image",
        current: pages.about?.image,
      },
      {
        label: "Sister — Portrait",
        key: "sister.image",
        current: pages.sister?.image,
      },
      {
        label: "Sister — Hairpin",
        key: "sister.hairpinImage",
        current: pages.sister?.hairpinImage,
      },
    ];

    // Add artifact images
    (pages.artifacts?.items || []).forEach((item, i) => {
      imageFields.push({
        label: `Artifact — ${item.name}`,
        key: `artifacts.items.${i}.image`,
        current: item.image,
      });
    });

    this.container.innerHTML = `
      <div class="editor-sections">
        <div class="editor-card">
          <h3 class="heading-3">Image References</h3>
          <p class="text-muted">
            Enter image filenames. Files should be placed in 
            <code>/public/images/korekiyo/</code>
          </p>
          
          ${imageFields
            .map(
              (field) => `
            <div class="form-group">
              <label class="form-label">${field.label}</label>
              <div class="image-preview-row">
                <input 
                  type="text" 
                  class="form-input" 
                  data-key="${field.key}"
                  value="${DomHelper.escapeHtml(field.current || "")}"
                  placeholder="filename.jpg"
                >
                ${
                  field.current
                    ? `
                  <img 
                    src="/images/korekiyo/${DomHelper.escapeHtml(
                      field.current
                    )}" 
                    alt="Preview"
                    class="image-thumb"
                    onerror="this.style.display='none'"
                  >
                `
                    : ""
                }
              </div>
            </div>
          `
            )
            .join("")}
          
        </div>
      </div>
    `;

    // Bind changes
    this.container.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const key = input.dataset.key;
        this.changes[key] = input.value;
        this.controller.markDirty(key);
      });
    });
  }

  getChanges() {
    return this.changes;
  }
}
