export class ThemeEngine {
  constructor() {
    this.root = document.documentElement;
  }

  apply(theme, character) {
    if (!theme) return;

    // Apply colors
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        this.root.style.setProperty(`--color-${key}`, value);
      });
    }

    // Apply fonts
    if (theme.fonts) {
      Object.entries(theme.fonts).forEach(([key, value]) => {
        this.root.style.setProperty(`--font-${key}`, value);
      });
    }

    // Apply ambient settings
    if (theme.ambient) {
      if (theme.ambient.fogColor) {
        this.root.style.setProperty("--ambient-fog", the.ambient.fogColor);
      }
    }

    // Update document title
    if (character?.name) {
      document.title = `${character.name} - ${character.title || "Portfolio"}`;
    }

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && character?.bio?.short) {
      metaDesc.setAttribute("content", character.bio.short);
    }
  }

  // Reset to defaults
  reset() {
    this.root.style = "";
  }
}
