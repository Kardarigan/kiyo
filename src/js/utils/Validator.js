/*
 * Client side Validator
 * checks data integrity before saving
 */
class Validator {
  static isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  static isValidHexColor(value) {
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
  }

  static isValidImageFilename(value) {
    return /^[a-zA-Z0-9_\-\.]+\.(webp|jpg|jpeg|png|svg)$/.test(value);
  }

  static validateCharacterData(data) {
    const errors = [];
    if (!data?.character?.name) errors.push("Character name is required.");
    if (data?.pages) {
      for (const [page, content] of Object.entries(data.pages)) {
        if (typeof content !== "object")
          errors.push(`Page "${page}" content must be an object.`);
      }
    }
    return { valid: errors.length === 0, errors };
  }
}

module.exports = { Validator };
