import { DomHelper } from "../utils/DomHelper.js";

/*
 * Reusable Content Card Component
 * creates a styled card with optional image, title, text, and action
 */

export class ContentCard {
  static render({ image, title, subtitle, text, action, classes = "" }) {
    return `
    <article class="card content-card ${classes}">
      ${
        image
          ? `
        <div class="card-image">
          <img src="${DomHelper.escapeHtml(image)}" alt="${DomHelper.escapeHtml(
              title || ""
            )}" loading="lazy">
        </div>
      `
          : ""
      }
      <div class="card-body">
        ${
          title
            ? `<h3 class="heading-3">${DomHelper.escapeHtml(title)}</h3>`
            : ""
        }
        ${
          subtitle
            ? `<p class="text-muted">${DomHelper.escapeHtml(subtitle)}</p>`
            : ""
        }
        ${text ? `<p class="body-text">${DomHelper.escapeHtml(text)}</p>` : ""}
        ${
          action
            ? `<button class="btn btn-ghost">${DomHelper.escapeHtml(
                action
              )}</button>`
            : ""
        }
      </div>
    </article>
  `;
  }
}
