export class ThemeEngine {
  constructor() {
    this.root = document.documentElement;
  }
  apply(theme, character) {
    if (!theme) return;
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        this.root.style.setProperty(`--color-${key}`, value);
      });
    }
    if (theme.fonts) {
      Object.entries(theme.fonts).forEach(([key, value]) => {
        this.root.style.setProperty(`--font-${key}`, value);
      });
    }
    if (theme.ambient?.fogColor) {
      this.root.style.setProperty("--ambient-fog", theme.ambient.fogColor);
    }
    if (character?.name) {
      document.title = `${character.name} - ${character.title || "Portfolio"}`;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && character?.bio?.short) {
      metaDesc.setAttribute("content", character.bio.short);
    }
  }
  reset() {
    this.root.style = "";
  }
}
