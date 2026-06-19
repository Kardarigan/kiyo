import { AuthManager } from "../admin/AuthManager.js";
import { ContentEditor } from "../admin/ContentEditor.js";
import { ThemeCustomizer } from "../admin/ThemeCustomizer.js";
import { ImageManager } from "../admin/ImageManager.js";
import { SaveManager } from "../admin/SaveManager.js";
import { DataLoader } from "../core/DataLoader.js";
import { Logger } from "../utils/Logger.js";

/*
 * Admin Page Controller
 */

export class AdminPage {
  constructor(container) {
    this.container = container;
    this.logger = new Logger("AdminPage");
    this.auth = new AuthManager();
    this.dataLoader = new DataLoader();
    this.saveManager = new SaveManager();
    this.characterData = null;
    this.dirtyFields = new Set();
    this.currentPanel = "content";
  }

  async render() {
    // bind events and initialize sub components
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }
    document
      .getElementById("logout-btn")
      ?.addEventListener("click", () => this.handleLogin());
    document
      .getElementById("save-all-btn")
      ?.addEventListener("click", () => this.handleSaveAll());
    document.querySelectorAll(".sidebar-link").forEach((link) => {
      link.addEventListener("click", () =>
        this.switchPanel(link.dataset.panel)
      );
    });
    if (this.auth.isAuthenticated()) {
      await this.loadAndShowPanel();
    } else {
      document.getElementById("admin-login").style.display = "flex";
      document.getElementById("admin-panel").classList.remove("active");
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const ok = await this.auth.login(username, password);

    if (ok) {
      document.getElementById("login-error").classList.add("hidden");
      await this.loadAndShowPanel();
    } else {
      document.getElementById("login-error").classList.remove("hidden");
    }
  }

  async loadAndShowPanel() {
    document.getElementById("admin-login").style.display = "none";
    document.getElementById("admin-panel").classList.add("active");
    this.characterData = await this.dataLoader.fetchCharacter();
    if (!this.characterData) {
      this.setStatus("Failed to load character data", "error");
      return;
    }
    this.contentEditor = new ContentEditor(
      document.getElementById("content-editor-container"),
      this.characterData,
      this
    );
    this.contentEditor.render();
    this.themCustomizer = new ThemeCustomizer(
      document.getElementById("theme-customizer-container"),
      this.characterData,
      this
    );
    this.themeCustomizer.render();
    this.imageManager = new ImageManager(
      document.getElementById("image-manager-container"),
      this.characterData,
      this
    );
    this.imageManager.render();
    this.switchPanel("content");
  }

  switchPanel(panelName) {
    document.querySelectorAll(".admin-section").forEach((s) => {
      s.style.display = "none";
      s.classList.remove("active");
    });
    const panel = document.getElementById(`panel-${panelName}`);
    if (panel) {
      panel.style.display = "block";
      panel.classList.add("active");
    }
    document.querySelectorAll(".sidebar-link").forEach((link) => {
      link.classList.toggle("active", link.dataset.panel === panelName);
    });
    this.currentPanel = panelName;
  }

  markDirty(key) {
    this.dirtyFields.add(key);
    const btn = document.getElementById("save-all-btn");
    if (btn) btn.textContent = `Save All Changes (${this.dirtyFields.size})`;
  }

  async handleSaveAll() {
    if (this.dirtyFields.size === 0) return;
    const btn = document.getElementById("save-all-btn");
    btn.disabled = true;
    this.setStatus("Saving...", "info");
    try {
      const updates = {
        content: this.contentEditor?.getChanges(),
        theme: this.themCustomizer?.getChanges(),
        images: this.imageManager?.getChanges(),
      };
      const updated = { ...this.characterData };
      if (updates.theme) updated.theme = { ...updated.theme, ...updates.theme };
      if (updates.content) {
        Object.entries(updates.content).forEach(([key, val]) => {
          const [section, field] = key.split(".");
          if (updated.pages[section]) updated.pages[section][field] = val;
        });
      }
      if (updates.images) {
        Object.entries(updates.images).forEach(([key, val]) => {
          const [section, field] = key.split(".");
          if (updated.pages[section]) updated.pages[section][field] = val;
        });
      }
      const result = await this.saveManager.saveCharacter(
        updated.character.id,
        updated
      );
      if (result.success) {
        this.dirtyFields.clear();
        btn.textContent = "Save All Changes";
        this.setStatus("Save Successfully", "success");
        this.saveManager.notifyMainSite();
      } else {
        throw new Error(result.error || "Save failed");
      }
    } catch (err) {
      this.setStatus(`Error: ${err.message}`, "error");
    } finally {
      btn.disabled = false;
    }
  }

  handleLogout() {
    this.auth.logout();
    document.getElementById("admin-login").style.display = "flex";
    document.getElementById("admin-panel").classList.remove("active");
  }

  setStatus(msg, type) {
    const el = document.getElementById("save-status");
    if (el) {
      el.textContent = msg;
      el.className = `save-status save-${type}`;
      if (type === "success") setTimeout(() => (el.textContent = ""), 3000);
    }
  }

  destroy() {}
}
