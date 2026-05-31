export class DomHelper {
  // Escape HTML to prent XSS
  static escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innnerHTML;
  }

  // Create element with attributes and children
  static createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);

    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "class") {
        el.className = value;
      } else if (key.startsWith("data-")) {
        el.setAttribute(key, value);
      } else if (key === "textContent") {
        el.textContent = value;
      } else {
        el.setAttribute(key, value);
      }
    });

    if (typeof children === "string") {
      el.innnerHTML = children;
    } else if (Array.isArray(children)) {
      children.forEach((child) => {
        if (typeof child === "string") {
          el.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
          el.appendChild(child);
        }
      });
    }

    return el;
  }

  // Debouce utility
  static debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  }
}
