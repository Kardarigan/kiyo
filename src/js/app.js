(function () {
  const Logger = {
    log: function (module, ...args) {
      console.log(`[${module}]`, ...args);
    },
    error: function (module, ...args) {
      console.error(`[${module}]`, ...args);
    },
    warn: function (module, ...args) {
      console.warn(`[${module}]`, ...args);
    },
  };

  // simple Router
  class Router {
    constructor() {
      this.routes = {
        home: this.renderHome,
        about: this.renderAbout,
        journal: this.renderJournal,
        artifacts: this.renderArtifacts,
        sister: this.renderSister,
      };
      this.currentPage = null;
      this.container = document.getElementById("page-container");

      window.addEventListener("popstate", () =>
        this.handleRoute(window.location.pathname)
      );
    }

    async navigate(path) {
      window.history.pushState({}, "", path);
      await this.handleRoute(path);
    }

    async handleRoute(path) {
      const pageName = this.getPageName(path);
      Logger.log("Router", `Routing to: ${pageName}`);

      if (this.container) {
        this.container.style.opacity = "0";
        await new Promise((r) => setTimeout(r, 200));
      }

      const renderer = this.routes[pageName];
      if (renderer && this.container) {
        await renderer.call(this, this.container);
      } else if (this.container) {
        this.container.innerHTML =
          '<div class="error-state"><h2>Page Not Found</h2></div>';
      }

      if (this.container) {
        this.container.style.opacity = "1";
        window.scrollTo({ top: 0 });
      }
    }

    getPageName(path) {
      const clean = path.replace(/^\/+|\/+$/g, "");
      if (clean === "" || clean === "app" || clean === "home") return "home";
      return clean.split("/")[0] || "home";
    }

    async renderHome(container) {
      const response = await fetch("/api/v1/character");
      const data = await response.json();
      const char = data.character;
      const home = data.pages.home;

      container.innerHTML = `
        <section class="home-hero">
          <div class="hero-content">
            <h1 class="hero-name heading-1">${this.escapeHtml(char.name)}</h1>
            <p class="hero-subtitle heading-4 text-accent">${this.escapeHtml(
              char.title
            )}</p>
            <blockquote class="hero-quote body-large text-muted">"${this.escapeHtml(
              home.heroQuote
            )}"</blockquote>
          </div>
          <div class="hero-image">
            <div class="image-frame">
              <img src="/images/korekiyo/${this.escapeHtml(
                home.featuredImage
              )}" alt="${this.escapeHtml(char.name)}" class="portrait-main">
            </div>
          </div>
        </section>
        <section class="home-intro">
          <div class="intro-card card">
            <p class="body-large">${this.escapeHtml(char.bio.short)}</p>
          </div>
        </section>
      `;
    }

    async renderAbout(container) {
      const response = await fetch("/api/v1/character");
      const data = await response.json();
      const char = data.character;
      const about = data.pages.about;

      let appearanceHtml = "";
      for (const [key, value] of Object.entries(char.appearance || {})) {
        appearanceHtml += `
          <div class="appearance-item">
            <span class="appearance-key text-accent">${this.escapeHtml(
              key
            )}</span>
            <span class="appearance-desc">${this.escapeHtml(value)}</span>
          </div>
        `;
      }

      container.innerHTML = `
        <section class="about-section page-section">
          <header class="page-header">
            <h1 class="heading-1">${this.escapeHtml(about.title)}</h1>
            <div class="header-ornament"></div>
          </header>
          <div class="about-layout">
            <div class="about-content">
              <div class="about-text body-large">
                <p>${this.escapeHtml(char.bio.full)}</p>
              </div>
              <div class="about-details">
                <div class="detail-item">
                  <span class="detail-label text-accent">Affiliation</span>
                  <span class="detail-value">${this.escapeHtml(
                    char.affiliation
                  )}</span>
                </div>
              </div>
            </div>
            <aside class="about-image">
              <div class="image-frame portrait-frame">
                <img src="/images/korekiyo/${this.escapeHtml(
                  about.image
                )}" alt="${this.escapeHtml(char.name)}" class="portrait-side">
              </div>
            </aside>
          </div>
          <div class="about-appearance">
            <h3 class="heading-3">Physical Description</h3>
            <div class="appearance-grid">${appearanceHtml}</div>
          </div>
        </section>
      `;
    }

    async renderJournal(container) {
      const response = await fetch("/api/v1/character");
      const data = await response.json();
      const journal = data.pages.journal;

      let entriesHtml = "";
      for (const entry of journal.entries || []) {
        entriesHtml += `
          <article class="journal-entry card" onclick="window.showJournalEntry('${this.escapeHtml(
            entry.date
          )}', '${this.escapeHtml(entry.title)}', '${this.escapeHtml(
          entry.content
        )}')">
            <div class="entry-meta">
              <span class="entry-date text-accent">${this.escapeHtml(
                entry.date
              )}</span>
              <span class="entry-location text-muted">${this.escapeHtml(
                entry.location || ""
              )}</span>
            </div>
            <h2 class="entry-title heading-3">${this.escapeHtml(
              entry.title
            )}</h2>
            <div class="entry-preview body-text">
              <p>${this.escapeHtml(entry.content.substring(0, 200))}...</p>
            </div>
            <button class="btn btn-ghost">Read Full Entry</button>
          </article>
        `;
      }

      container.innerHTML = `
        <section class="journal-section page-section">
          <header class="page-header">
            <h1 class="heading-1">${this.escapeHtml(journal.title)}</h1>
            <p class="body-large text-muted">${this.escapeHtml(
              journal.description
            )}</p>
            <div class="header-ornament"></div>
          </header>
          <div class="journal-entries">${entriesHtml}</div>
        </section>
        <div id="journal-modal" class="modal hidden">
          <div class="modal-overlay"></div>
          <div class="modal-content">
            <button class="modal-close btn btn-ghost" onclick="document.getElementById('journal-modal').classList.add('hidden')">✕</button>
            <div id="modal-body"></div>
          </div>
        </div>
      `;
    }

    async renderArtifacts(container) {
      const response = await fetch("/api/v1/character");
      const data = await response.json();
      const artifacts = data.pages.artifacts;

      let itemsHtml = "";
      for (let i = 0; i < (artifacts.items || []).length; i++) {
        const item = artifacts.items[i];
        itemsHtml += `
          <article class="artifact-card card" onclick="window.showArtifactDetail(${i})">
            <div class="artifact-image-container">
              <img src="/images/korekiyo/${this.escapeHtml(
                item.image
              )}" alt="${this.escapeHtml(item.name)}" class="artifact-image">
              ${
                item.threed
                  ? '<span class="artifact-badge text-accent">3D View</span>'
                  : ""
              }
            </div>
            <div class="artifact-info">
              <h3 class="artifact-name heading-3">${this.escapeHtml(
                item.name
              )}</h3>
              <p class="artifact-origin text-muted">${this.escapeHtml(
                item.origin
              )}</p>
              <p class="artifact-desc body-text">${this.escapeHtml(
                item.description.substring(0, 120)
              )}...</p>
            </div>
          </article>
        `;
      }

      window.artifactItems = artifacts.items || [];

      container.innerHTML = `
        <section class="artifacts-section page-section">
          <header class="page-header">
            <h1 class="heading-1">${this.escapeHtml(artifacts.title)}</h1>
            <p class="body-large text-muted">${this.escapeHtml(
              artifacts.description
            )}</p>
            <div class="header-ornament"></div>
          </header>
          <div class="artifacts-grid">${itemsHtml}</div>
        </section>
        <div id="artifact-modal" class="modal hidden">
          <div class="modal-overlay"></div>
          <div class="modal-content modal-artifact">
            <button class="modal-close btn btn-ghost" onclick="document.getElementById('artifact-modal').classList.add('hidden')">✕</button>
            <div id="artifact-modal-body"></div>
          </div>
        </div>
      `;
    }

    async renderSister(container) {
      const response = await fetch("/api/v1/character");
      const data = await response.json();
      const sister = data.pages.sister;

      container.innerHTML = `
        <section class="sister-section page-section">
          <header class="page-header sister-header">
            <h1 class="heading-1">${this.escapeHtml(sister.title)}</h1>
            <p class="heading-4 text-accent">${this.escapeHtml(
              sister.subtitle
            )}</p>
            <div class="header-ornament sister-ornament"></div>
          </header>
          <div class="sister-layout">
            <div class="sister-portrait">
              <div class="portrait-vignette">
                <img src="/images/korekiyo/${this.escapeHtml(
                  sister.image
                )}" alt="Miyadera Shinguji" class="sister-image">
                <div class="vignette-overlay"></div>
              </div>
            </div>
            <div class="sister-poem">
              <div class="poem-container">
                <p class="poem-text body-large">${this.escapeHtml(
                  sister.poem
                )}</p>
                <div class="poem-signature handwritten">— K.S.</div>
              </div>
            </div>
            <div class="sister-content">
              <p class="body-text">${this.escapeHtml(sister.content)}</p>
            </div>
            <div class="sister-hairpin">
              <div class="hairpin-container">
                <img src="/images/korekiyo/${this.escapeHtml(
                  sister.hairpinImage
                )}" alt="Her hairpin" class="hairpin-image">
                <div class="hairpin-caption handwritten">Her favorite. I keep it close.</div>
              </div>
              <p class="hairpin-note text-muted">It has not gathered a single speck of dust.</p>
            </div>
          </div>
        </section>
      `;
    }

    escapeHtml(str) {
      if (!str) return "";
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }
  }

  // global functions for modals
  window.showJournalEntry = function (date, title, content) {
    const modal = document.getElementById("journal-modal");
    const body = document.getElementById("modal-body");
    if (modal && body) {
      body.innerHTML = `
        <div class="modal-entry-header">
          <span class="entry-date text-accent">${date}</span>
        </div>
        <h2 class="heading-2">${title}</h2>
        <div class="header-ornament"></div>
        <div class="entry-full body-large"><p>${content}</p></div>
        <div class="modal-entry-footer handwritten">— K.S.</div>
      `;
      modal.classList.remove("hidden");
    }
  };

  window.showArtifactDetail = function (index) {
    const item = window.artifactItems[index];
    if (!item) return;
    const modal = document.getElementById("artifact-modal");
    const body = document.getElementById("artifact-modal-body");
    if (modal && body) {
      body.innerHTML = `
        <div class="modal-artifact-layout">
          <div class="modal-artifact-image">
            <img src="/images/korekiyo/${item.image}" alt="${item.name}">
          </div>
          <div class="modal-artifact-info">
            <span class="text-accent">${item.origin}</span>
            <h2 class="heading-2">${item.name}</h2>
            <div class="header-ornament"></div>
            <p class="body-large">${item.description}</p>
          </div>
        </div>
      `;
      modal.classList.remove("hidden");
    }
  };

  // navigation component
  class Navigation {
    constructor(router) {
      this.router = router;
      this.container = document.getElementById("site-navigation");
      this.activeRoute = "home";
      this.render();
    }

    async render() {
      const response = await fetch("/api/v1/character");
      const data = await response.json();
      const char = data.character;

      this.container.innerHTML = `
        <nav class="main-nav">
          <div class="nav-brand">
            <span class="brand-name">${char.name.split(" ")[0]}</span>
            <span class="brand-divider">|</span>
            <span class="brand-title text-muted">${char.title}</span>
          </div>
          <ul class="nav-links">
            <li><a href="/app" class="nav-link" data-route="home">Home</a></li>
            <li><a href="/app/about" class="nav-link" data-route="about">About</a></li>
            <li><a href="/app/journal" class="nav-link" data-route="journal">Field Journal</a></li>
            <li><a href="/app/artifacts" class="nav-link" data-route="artifacts">Artifacts</a></li>
            <li><a href="/app/sister" class="nav-link" data-route="sister">My Muse</a></li>
          </ul>
        </nav>
      `;

      this.container.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const path = link.getAttribute("href");
          this.router.navigate(path);
        });
      });
    }
  }

  // initialize app
  document.addEventListener("DOMContentLoaded", async () => {
    const router = new Router();
    const nav = new Navigation(router);

    // apply theme colors from data
    const response = await fetch("/api/v1/character");
    const data = await response.json();
    const theme = data.theme;

    if (theme && theme.colors) {
      for (const [key, value] of Object.entries(theme.colors)) {
        document.documentElement.style.setProperty(`--color-${key}`, value);
      }
    }

    document.title = `${data.character.name} - ${data.character.title}`;

    await router.handleRoute(window.location.pathname);
  });
})();
