/*
 * Authentication Manager
 * uses basic auth via fetch to validate credentials
 * stores auth token in sessionStorage for the session
 */

export class AuthManager {
  constructor() {
    this.storageKey = "kiyo_cms_auth";
  }

  isAuthenticated() {
    const auth = sessionStorage.getItem(this.storageKey);
    return !!auth;
  }

  async login(username, password) {
    try {
      // encode credentials
      const token = btoa(`${username}:${password}`);

      // test against API
      const response = await fetch("/api/v1/config", {
        headers: {
          Authorization: `Basic ${token}`,
        },
      });

      if (response.ok) {
        sessionStorage.setItem(this.storageKey, token);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Auth error:", error);
      return false;
    }
  }

  logout() {
    sessionStorage.removeItem(this.storageKey);
  }

  getAuthHeaders() {
    const token = sessionStorage.getItem(this.storageKey);
    if (!token) return {};

    return {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json",
    };
  }
}
