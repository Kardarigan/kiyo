/**
 * Save Manger
 * sends updated data to the server API for persistence
 */

export class SaveManager {
  constructor() {
    this.baseUrl = "/api/v1";
  }

  getAuthHeaders() {
    const token = sessionStorage.getItem("kiyo_cms_auth");
    return {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json",
    };
  }

  async saveCharacter(characterId, data) {
    try {
      const response = await fetch(`${this.baseUrl}/character`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          characterId,
          data,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("SaveManager: Save failed", error);
      return { success: false, error: error.message };
    }
  }

  async saveConfig(data) {
    try {
      const response = await fetch(`${this.baseUrl}/config`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ data }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("SaveManager: Config save failed", error);
      return { success: false, error: error.message };
    }
  }

  notifyMainSite() {
    // if main site is open in another tab, dispatch event
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("kiyo-cms");
      channel.postMessage({ type: "data-updated" });
      channel.close();
    }
  }
}
