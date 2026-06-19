export class DataLoader {
  constructor(baseUrl = "/api/v1") {
    this.baseUrl = baseUrl;
    this.cache = new Map();
  }
  async fetchCharacter(id = null) {
    const url = id
      ? `${this.baseUrl}/characters/${id}`
      : `${this.baseUrl}/character`;
    if (this.cache.has(url)) return this.cache.get(url);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      this.cache.set(url, data);
      return data;
    } catch (error) {
      console.error("DataLoader: Failed to fetch character data", error);
      return null;
    }
  }
  async fetchConfig() {
    try {
      const response = await fetch(`${this.baseUrl}/config`);
      if (!response.ok) throw new Error("Failed to fetch config");
      return await response.json();
    } catch (error) {
      console.error("DataLoader: Failed to fetch config", error);
      return null;
    }
  }
  async listCharacters() {
    try {
      const response = await fetch(`${this.baseUrl}/characters`);
      if (!response.ok) throw new Error("Failed to fetch characters list");
      return await response.json();
    } catch (error) {
      console.error("DataLoader: Failed to fetch characters list", error);
      return { characters: [] };
    }
  }
}
