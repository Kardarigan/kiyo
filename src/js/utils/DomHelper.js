export class DomHelper {
  static escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  static createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "class") el.className = value;
      else if (key.startsWith("data-")) el.setAttribute(key, value);
      else if (key === "textContent") el.textContent = value;
      else el.setAttribute(key, value);
    });
    if (typeof children === "string") el.innerHTML = children;
    else if (Array.isArray(children)) {
      children.forEach((child) => {
        if (typeof child === "string")
          el.appendChild(document.createTextNode(child));
        else if (child instanceof Node) el.appendChild(child);
      });
    }
    return el;
  }

  static debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
}
