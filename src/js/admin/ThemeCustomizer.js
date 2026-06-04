/*
 * Theme Customizer
 * live color picker and font selector for the dark academia theme.
 */

export class ThemeCustomizer {
  constructor(container, characterData, controller) {
    this.container = container;
    this.data = characterData;
    this.controller = controller;
    this.changes = {};
  }

  render() {
    const theme = this.data.theme || {};
    const colors = theme.colors || {};

    this.container.innerHTML = `
        <div class="editor-sections">
          
          <!-- Colors -->
          <div class="editor-card">
            <h3 class="heading-3">Color Palette</h3>
            <p class="text-muted">Adjust colors. Changes preview in real-time.</p>
            
            <div class="color-grid">
              ${Object.entries({
                "Primary Background": "primary",
                "Primary Light": "primaryLight",
                "Secondary Surface": "secondary",
                "Accent Gold": "accent",
                "Accent Dim": "accentDim",
                "Blood Red": "blood",
                "Text Primary": "textPrimary",
                "Text Secondary": "textSecondary",
                "Text Muted": "textMuted",
                Background: "background",
                Surface: "surface",
                Parchment: "parchment",
                "Parchment Dark": "parchmentDark",
              })
                .map(
                  ([label, key]) => `
                <div class="color-item">
                  <label class="form-label">${label}</label>
                  <div class="color-input-group">
                    <input 
                      type="color" 
                      class="color-picker" 
                      data-key="colors.${key}"
                      value="${colors[key] || "#000000"}"
                    >
                    <input 
                      type="text" 
                      class="form-input color-hex" 
                      data-key="colors.${key}"
                      value="${colors[key] || "#000000"}"
                      placeholder="#000000"
                    >
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          
          <!-- Fonts -->
          <div class="editor-card">
            <h3 class="heading-3">Typography</h3>
            
            ${Object.entries({
              "Heading Font": "heading",
              "Body Font": "body",
              "Accent Font": "accent",
              "Handwritten Font": "handwritten",
            })
              .map(
                ([label, key]) => `
              <div class="form-group">
                <label class="form-label">${label}</label>
                <input 
                  type="text" 
                  class="form-input" 
                  data-key="fonts.${key}"
                  value="${(theme.fonts && theme.fonts[key]) || ""}"
                  placeholder="Garamond Rough Pro"
                >
              </div>
            `
              )
              .join("")}
          </div>
          
          <!-- Ambient Settings -->
          <div class="editor-card">
            <h3 class="heading-3">Ambient Settings</h3>
            
            <div class="form-group">
              <label class="form-label">Fog Color</label>
              <div class="color-input-group">
                <input 
                  type="color" 
                  class="color-picker" 
                  data-key="ambient.fogColor"
                  value="${
                    (theme.ambient && theme.ambient.fogColor) || "#0a1a0a"
                  }"
                >
                <input 
                  type="text" 
                  class="form-input color-hex" 
                  data-key="ambient.fogColor"
                  value="${
                    (theme.ambient && theme.ambient.fogColor) || "#0a1a0a"
                  }"
                >
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Fog Density</label>
              <input 
                type="range" 
                class="form-range" 
                data-key="ambient.fogDensity"
                min="0.01" 
                max="0.1" 
                step="0.005"
                value="${(theme.ambient && theme.ambient.fogDensity) || 0.03}"
              >
              <span class="range-value text-muted">
                ${(theme.ambient && theme.ambient.fogDensity) || 0.03}
              </span>
            </div>
          </div>
          
        </div>
      `;

    // Bind color picker changes
    this.container.querySelectorAll(".color-picker").forEach((picker) => {
      picker.addEventListener("input", (e) => {
        const key = picker.dataset.key;
        const hexInput = this.container.querySelector(
          `.color-hex[data-key="${key}"]`
        );
        if (hexInput) hexInput.value = e.target.value;
        this.changes[key] = e.target.value;
        this.controller.markDirty(key);
        this.previewColor(key, e.target.value);
      });
    });

    // Bind hex input changes
    this.container.querySelectorAll(".color-hex").forEach((input) => {
      input.addEventListener("input", (e) => {
        const key = input.dataset.key;
        const picker = this.container.querySelector(
          `.color-picker[data-key="${key}"]`
        );
        if (picker) picker.value = e.target.value;
        this.changes[key] = e.target.value;
        this.controller.markDirty(key);
        this.previewColor(key, e.target.value);
      });
    });

    // Bind font changes
    this.container
      .querySelectorAll('input[data-key^="fonts."]')
      .forEach((input) => {
        input.addEventListener("input", (e) => {
          const key = input.dataset.key;
          this.changes[key] = e.target.value;
          this.controller.markDirty(key);
        });
      });

    // Bind range changes
    this.container.querySelectorAll(".form-range").forEach((range) => {
      range.addEventListener("input", (e) => {
        const key = range.dataset.key;
        const display = range.nextElementSibling;
        if (display) display.textContent = e.target.value;
        this.changes[key] = parseFloat(e.target.value);
        this.controller.markDirty(key);
      });
    });
  }

  previewColor(key, value) {
    const cssVar = `--color-${key.split(".")[1]}`;
    document.documentElement.style.setProperty(cssVar, value);
  }

  getChanges() {
    return this.changes;
  }
}
