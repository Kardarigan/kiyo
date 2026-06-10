/*
 * Server side validation for character data
 */

export class Validator {
  static validateCharacterUpdate(data) {
    const errors = [];
    if (!data) {
      errors.push("No data provided.");
      return { valid: false, errors };
    }

    // required top level keys
    const required = ["character", "theme", "pages"];
    for (const key of required) {
      if (!(key in data)) errors.push(`Missing required key: ${key}`);
    }
    if (data.character && !data.character.name) {
      errors.push("Character name is required.");
    }
    return { valid: errors.length === 0, errors };
  }
}
