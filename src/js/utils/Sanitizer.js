/*
 * Input Sanitizer
 * escapes HTML and prevents XSS
 */
export class Sanitizer {
  static escapeHtml(str) {
    if (!str) return "";
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "/": "&#x2F;",
    };
    return str.replace(/[&<>"'/]/g, (char) => map[char]);
  }

  static sanitizeInput(str) {
    return Sanitizer.escapeHtml(str.trim());
  }

  static sanitizeObject(obj) {
    if (typeof obj === "string") return Sanitizer.sanitizeInput(obj);
    if (Array.isArray(obj))
      return obj.map((item) => Sanitizer.sanitizeObject(item));
    if (obj && typeof obj === "object") {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        cleaned[key] = Sanitizer.sanitizeObject(value);
      }
      return cleaned;
    }
    return obj;
  }
}
