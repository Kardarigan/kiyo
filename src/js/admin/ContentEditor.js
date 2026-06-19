import { DomHelper } from "../utils/DomHelper.js";

/*
 * Content Editor
 * editable fields for all page content sections
 */

export class ContentEditor {
  constructor(container, characterData, controller) {
    this.container = container;
    this.data = characterData;
    this.controller = controller;
    this.changes = {};
  }

  redner() {
    const pages = this.data.pages || {};

    this.container.innerHTML = `
      <div class="editor-sections">
        
        <!-- Home Page -->
        <div class="editor-card">
          <h3 class="heading-3">Home Page</h3>
          <div class="form-group">
            <label class="form-label">Hero Quote</label>
            <textarea 
              class="form-textarea" 
              data-key="home.heroQuote"
              rows="2"
            >${DomHelper.escapeHtml(pages.home?.heroQuote || "")}</textarea>
          </div>
        </div>
        
        <!-- About Page -->
        <div class="editor-card">
          <h3 class="heading-3">About Page</h3>
          <div class="form-group">
            <label class="form-label">Title</label>
            <input 
              type="text" 
              class="form-input" 
              data-key="about.title"
              value="${DomHelper.escapeHtml(pages.about?.title || "")}"
            >
          </div>
          <div class="form-group">
            <label class="form-label">Content</label>
            <textarea 
              class="form-textarea" 
              data-key="about.content"
              rows="6"
            >${DomHelper.escapeHtml(pages.about?.content || "")}</textarea>
          </div>
        </div>
        
        <!-- Journal -->
        <div class="editor-card">
          <h3 class="heading-3">Field Journal</h3>
          <div class="form-group">
            <label class="form-label">Section Title</label>
            <input 
              type="text" 
              class="form-input" 
              data-key="journal.title"
              value="${DomHelper.escapeHtml(pages.journal?.title || "")}"
            >
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea 
              class="form-textarea" 
              data-key="journal.description"
              rows="3"
            >${DomHelper.escapeHtml(
              pages.journal?.description || ""
            )}</textarea>
          </div>
          
          <h4 class="heading-4" style="margin-top:var(--space-lg);">Journal Entries</h4>
          ${(pages.journal?.entries || [])
            .map(
              (entry, i) => `
            <div class="editor-subcard">
              <p class="text-muted" style="margin-bottom:var(--space-sm);">Entry #${
                i + 1
              }</p>
              <div class="form-group">
                <label class="form-label">Date</label>
                <input 
                  type="text" 
                  class="form-input" 
                  data-key="journal.entries.${i}.date"
                  value="${DomHelper.escapeHtml(entry.date || "")}"
                >
              </div>
              <div class="form-group">
                <label class="form-label">Title</label>
                <input 
                  type="text" 
                  class="form-input" 
                  data-key="journal.entries.${i}.title"
                  value="${DomHelper.escapeHtml(entry.title || "")}"
                >
              </div>
              <div class="form-group">
                <label class="form-label">Content</label>
                <textarea 
                  class="form-textarea" 
                  data-key="journal.entries.${i}.content"
                  rows="4"
                >${DomHelper.escapeHtml(entry.content || "")}</textarea>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <!-- Artifacts -->
        <div class="editor-card">
          <h3 class="heading-3">Artifacts Collection</h3>
          ${(pages.artifacts?.items || [])
            .map(
              (item, i) => `
            <div class="editor-subcard">
              <p class="text-muted" style="margin-bottom:var(--space-sm);">Item #${
                i + 1
              }: ${DomHelper.escapeHtml(item.name)}</p>
              <div class="form-group">
                <label class="form-label">Name</label>
                <input 
                  type="text" 
                  class="form-input" 
                  data-key="artifacts.items.${i}.name"
                  value="${DomHelper.escapeHtml(item.name || "")}"
                >
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea 
                  class="form-textarea" 
                  data-key="artifacts.items.${i}.description"
                  rows="3"
                >${DomHelper.escapeHtml(item.description || "")}</textarea>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <!-- Sister Page -->
        <div class="editor-card">
          <h3 class="heading-3">Sister's Page</h3>
          <div class="form-group">
            <label class="form-label">Title</label>
            <input 
              type="text" 
              class="form-input" 
              data-key="sister.title"
              value="${DomHelper.escapeHtml(pages.sister?.title || "")}"
            >
          </div>
          <div class="form-group">
            <label class="form-label">Poem</label>
            <textarea 
              class="form-textarea" 
              data-key="sister.poem"
              rows="4"
            >${DomHelper.escapeHtml(pages.sister?.poem || "")}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Content</label>
            <textarea 
              class="form-textarea" 
              data-key="sister.content"
              rows="6"
            >${DomHelper.escapeHtml(pages.sister?.content || "")}</textarea>
          </div>
        </div>
        
      </div>
    `;

    // Bind change events
    this.container.querySelectorAll("input, textarea").forEach((input) => {
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
