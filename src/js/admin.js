import { AuthManager } from "./admin/AuthManager.js";
import { ContentEditor } from "./admin/ContentEditor.js";
import { ThemeCustomizer } from "./admin/ThemeCustomizer.js";
import { ImageManager } from "./admin/ImageManager.js";
import { SaveManager } from "./admin/SaveManager.js";
import { DataLoader } from "./core/DataLoader.js";
import { Logger } from "./utils/Logger.js";

class AdminController {
  constructor() {
    this.logger = new Logger("Admin");
    this.auth = new AuthManager();
    this.dataLoader = new DataLoader();
    this.saveManager = new SaveManager();
    this.characterData = null;
    this.configData = null;
    this.dirtyFields = new Set();

    // UI Elements
    this.loginScreen = document.getElementById("admin-login");
    this.adminPanel = document.getElementById("admin-panel");
    this.loginForm = document.getElementById("login-form");
    this.loginError = document.getElementById("login-error");
    this.logoutBtn = document.getElementById("logout-btn");
    this.saveAllBtn = document.getElementById("save-all-btn");
    this.saveStatus = document.getElementById("save-status");

    // Editors
    this.contentEditor = null;
    this.themeCustomizer = null;
    this.imageManager = null;

    this.init();
  }

  async init() {
    // check if already authenticated
    if (this.auth.isAuthenticated()) {
      await this.showPanel();
      return;
    }

    // Show login
    this.loginScreen.style.display = "flex";
    this.adminPanel.classList.remove("active");

    // Bind login
    this.loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    this.logoutBtn.addEventListener("click", () => this.handleLogout());
    this.saveAllBtn.addEventListener("click", () => this.handleSaveAll());

    // Bind sidebar navigation
    document.querySelectorAll(".sidebar-link").forEach((link) => {
      link.addEventListener("click", () => {
        const panel = link.dataset.panel;
        this.switchPanel(panel);
      });
    });
  }

  async handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const success = await this.auth.login(username, password);

    if (success) {
      this.loginError.classList.add("hidden");
      await this.showPanel();
    } else {
      this.loginError.textContent = "Invalid credentials, Try again.";
      this.loginError.classList.remove("hidden");
    }
  }

  async showPanel() {
    this.loginScreen.style.display = "none";
    this.adminPanel.classList.add("active");

    // Load data
    this.characterData = await this.dataLoader.fetchCharacter();
    this.configData = await this.dataLoader.fetchConfig();

    if (!this.characterData) {
      this.setStatus("Failed to load character data", "error");
      return;
    }

    // Initialize editors
    this.contentEditor = new ContentEditor(
      document.getElementById("content-editor-container"),
      this.characterData,
      this
    );
    this.contentEditor.render();

    this.themeCustomizer = new ThemeCustomizer(
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

    // Switch to first panel
    this.switchPanel("content");
  }

  handleLogout() {
    this.auth.logout();
    this.loginScreen.style.display = "flex";
    this.adminPanel.classList.remove("active");
  }

  switchPanel(panelName) {
    // Hide all panels
    document.querySelectorAll(".admin-section").forEach((section) => {
      section.style.display = "none";
      section.classList.remove("active");
    });

    // Show selected panel
    const panel = document.getElementById(`panel-${panelName}`);
    if (panel) {
      panel.style.display = "block";
      panel.classList.add("active");
    }

    // Update sidebar
    document.querySelectorAll(".sidebar-link").forEach((link) => {
      link.classList.toggle("active", link.dataset.panel === panelName);
    });
  }

  markDirty(field) {
    this.dirtyFields.add(field);
    this.saveAllBtn.textContent = `Save all Changes (${this.dirtyFields.size})`;
  }

  async handleSaveAll() {
    if (this.dirtyFields.size === 0) {
      this.setStatus("No changes to save", "info");
      return;
    }

    this.saveAllBtn.disabled = true;
    this.setStatus("Saving...", "info");

    try {
      // Colelct all changes
      const updates = {
        theme: this.themeCustomizer?.getChanges(),
        images: this.imageManager?.getChanges(),
        content: this.contentEditor?.getChanges(),
      };

      // Merge into character data
      const updatedData = { ...this.characterData };

      if (updates.theme) {
        updatedData.theme = {
          ...updatedData.theme,
          ...updates.theme,
        };
      }
      if (updates.images) {
        // Merge image changes into pages
        Object.entries(updates.images).forEach(([key, value]) => {
          const [section, field] = key.split(".");
          if (updatedData.pages[section]) {
            updatedData.pages[section][field] = value;
          }
        });
      }
      if (updates.content) {
        Object.entries(updates.content).forEach(([key, value]) => {
          const [section, field] = key.split(".");
          if (updatedData.pages[section]) {
            updatedData.pages[section][field] = value;
          }
        });
      }

      const result = await this.saveManager.saveCharacter(
        updatedData.character.id,
        updatedData
      );

      if (result.success) {
        this.dirtyFields.clear();
        this.saveAllBtn.textContent = "Save All Changes";
        this.setStatus("All changes saved successfully", "success");

        // Reload main site if open
        this.saveManager.notifyMainSite();
      } else {
        throw new Error(result.error || "Save failed");
      }
    } catch (error) {
      this.setStatus(`Save failed: ${error.message}`, "error");
    }

    this.saveAllBtn.disabled = false;
  }

  setStatus(message, type = "info") {
    this.saveStatus.textContent = message;
    this.saveStatus.className = `save-status save-${type}`;

    if (type === "success") {
      setTimeout(() => {
        this.saveStatus.textContent = "";
      }, 3000);
    }
  }
}
