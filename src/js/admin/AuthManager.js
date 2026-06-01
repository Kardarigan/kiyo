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
  }
}
