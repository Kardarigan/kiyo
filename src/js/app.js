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

  // custom cursor implementation
  class SimpleCursor {
    constructor() {
      this.cursor = document.getElementById("custom-cursor");
      if (!this.cursor) return;

      this.cursor.style.opacity = "1";
      document.body.classList.add("custom-cursor-active");

      document.addEventListener("mousemove", (e) => {
        this.cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      });

      // Interactive elements
      document
        .querySelectorAll("a, button, .journal-entry, .artifact-card")
        .forEach((el) => {
          el.addEventListener("mouseenter", () => {
            this.cursor.classList.add("cursor-interactive");
          });
          el.addEventListener("mouseleave", () => {
            this.cursor.classList.remove("cursor-interactive");
          });
        });
    }
  }

  // router
  class Router {
    constructor() {
      this.routes = {
        home: this.renderHome,
        about: this.renderAbout,
        journal: this.renderJournal,
        artifacts: this.renderArtifacts,
        sister: this.renderSister,
      };
      this.container = document.getElementById("page-container");
      this.currentPage = null;

      window.addEventListener("popstate", () => {
        this.handleRoute(window.location.pathname);
      });
    }

    async navigate(path) {
      window.history.pushState({}, "", path);
      await this.handleRoute(path);
    }

    async handleRoute(path) {
      // Get just the page name from the path
      const pageName = this.getPageName(path);
      console.log("Routing to:", pageName);

      if (this.container) {
        this.container.style.opacity = "0";
        await new Promise((r) => setTimeout(r, 200));
      }

      const renderer = this.routes[pageName];
      if (renderer && this.container) {
        await renderer.call(this, this.container);
      } else if (this.container) {
        this.container.innerHTML = `
          <div class="error-state">
            <h2>Page Not Found</h2>
            <p class="text-muted">The page you're looking for does not exist.</p>
          </div>`;
      }

      if (this.container) {
        this.container.style.opacity = "1";
        window.scrollTo({ top: 0 });
      }
    }

    getPageName(path) {
      const clean = path.replace(/^\/+|\/+$/g, "");
      if (clean === "" || clean === "app" || clean === "home") return "home";
      // Extract first part after app/
      const parts = clean.split("/");
      if (parts[0] === "app") {
        return parts[1] || "home";
      }
      return parts[0] || "home";
    }

    // page renderings
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
              )}" alt="${this.escapeHtml(
        char.name
      )}" class="portrait-main" onerror="this.src='/images/placeholder.jpg'">
            </div>
          </div>
        </section>
        <section class="home-intro">
          <div class="intro-card card">
            <p class="body-large">${this.escapeHtml(char.bio.short)}</p>
          </div>
        </section>
        ${
          home.sections &&
          home.sections
            .map(
              (section) => `
          ${
            section.type === "quote"
              ? `
            <section class="home-quote-section">
              <blockquote class="accent-quote">
                <p class="body-text">"${this.escapeHtml(section.content)}"</p>
              </blockquote>
            </section>
          `
              : ""
          }
        `
            )
            .join("")
        }
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
                )}" alt="${this.escapeHtml(
        char.name
      )}" class="portrait-side" onerror="this.src='/images/placeholder.jpg'">
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
      for (let i = 0; i < (journal.entries || []).length; i++) {
        const entry = journal.entries[i];
        entriesHtml += `
          <article class="journal-entry card" onclick="window.showJournalEntry(${i})">
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
            <div id="journal-modal-body"></div>
          </div>
        </div>
      `;
    }

    async renderArtifacts(container) {
      const response = await fetch("/api/v1/character");
      const data = await response.json();
      const artifacts = data.pages.artifacts;

      window.artifactItems = artifacts.items || [];

      let itemsHtml = "";
      for (let i = 0; i < (artifacts.items || []).length; i++) {
        const item = artifacts.items[i];
        itemsHtml += `
          <article class="artifact-card card" onclick="window.showArtifactDetail(${i})">
            <div class="artifact-image-container">
              <img src="/images/korekiyo/${this.escapeHtml(
                item.image
              )}" alt="${this.escapeHtml(
          item.name
        )}" class="artifact-image" onerror="this.src='/images/placeholder.jpg'">
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
                )}" alt="Miyadera Shinguji" class="sister-image" onerror="this.src='/images/placeholder.jpg'">
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
                )}" alt="Her hairpin" class="hairpin-image" onerror="this.src='/images/placeholder.jpg'">
                <div class="hairpin-caption handwritten">Her favorite. I keep it close.</div>
              </div>
              <p class="hairpin-note text-muted">It has not gathered a single speck of dust.</p>
            </div>
          </div>
          <div class="sister-whisper-zone">
            <span class="text-muted">— silence —</span>
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

  // Blood Splatter Effect
  class BloodSplatter {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.drops = [];
      this.isPlaying = false;
    }

    init() {
      // Create canvas if it doesn't exist
      this.canvas = document.createElement("canvas");
      this.canvas.id = "blood-splatter";
      this.canvas.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.5s ease;
        `;
      document.body.appendChild(this.canvas);

      this.ctx = this.canvas.getContext("2d");
      this.resize();
      window.addEventListener("resize", () => this.resize());
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    // Trigger a blood splatter at random position
    splash(count = 30, intensity = 1) {
      if (this.isPlaying) return;
      this.isPlaying = true;

      this.canvas.style.opacity = "1";
      this.drops = [];

      // Random position on screen
      const centerX =
        Math.random() * this.canvas.width * 0.6 + this.canvas.width * 0.2;
      const centerY =
        Math.random() * this.canvas.height * 0.6 + this.canvas.height * 0.2;

      // Generate blood drops
      for (let i = 0; i < count * intensity; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 15 * intensity;
        const size = 2 + Math.random() * 12 * intensity;
        const spread = 0.3 + Math.random() * 0.7;

        this.drops.push({
          x: centerX,
          y: centerY,
          targetX: centerX + Math.cos(angle) * speed * spread * 30,
          targetY: centerY + Math.sin(angle) * speed * spread * 30,
          size: size,
          life: 1,
          decay: 0.008 + Math.random() * 0.02,
          angle: angle,
          speed: speed * spread,
          gravity: 0.1 + Math.random() * 0.3,
          isSplatter: Math.random() > 0.7,
        });
      }

      // Add some small splatter dots
      for (let i = 0; i < count * 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 80 * intensity;
        this.drops.push({
          x: centerX + Math.cos(angle) * dist,
          y: centerY + Math.sin(angle) * dist - 10,
          targetX: centerX + Math.cos(angle) * (dist + 20 + Math.random() * 30),
          targetY:
            centerY + Math.sin(angle) * (dist + 20 + Math.random() * 30) + 20,
          size: 1 + Math.random() * 3,
          life: 1,
          decay: 0.01 + Math.random() * 0.03,
          angle: angle,
          speed: 0.5 + Math.random() * 2,
          gravity: 0.1 + Math.random() * 0.2,
          isSplatter: true,
        });
      }

      this.animate();

      // Auto fade out
      setTimeout(() => {
        this.fadeOut();
      }, 2000);
    }

    animate() {
      if (this.drops.length === 0) {
        this.fadeOut();
        return;
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let alive = false;
      this.drops.forEach((d) => {
        if (d.life <= 0) return;
        alive = true;

        // Move toward target
        d.x += (d.targetX - d.x) * 0.08;
        d.y += (d.targetY - d.y) * 0.08 + d.gravity;
        d.life -= d.decay;

        // Draw blood drop
        const alpha = Math.max(0, d.life * 0.9);
        const red = 120 + Math.random() * 30;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;

        // Main drop
        const gradient = this.ctx.createRadialGradient(
          d.x - d.size * 0.2,
          d.y - d.size * 0.2,
          0,
          d.x,
          d.y,
          d.size
        );
        gradient.addColorStop(0, `rgba(180, 20, 20, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(139, 0, 0, ${alpha * 0.8})`);
        gradient.addColorStop(1, `rgba(80, 0, 0, ${alpha * 0.3})`);

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(d.x, d.y, d.size * d.life, 0, Math.PI * 2);
        this.ctx.fill();

        // Splatter streaks
        if (d.isSplatter && d.size > 3) {
          this.ctx.strokeStyle = `rgba(139, 0, 0, ${alpha * 0.5})`;
          this.ctx.lineWidth = d.size * 0.3;
          this.ctx.beginPath();
          this.ctx.moveTo(d.x, d.y);
          this.ctx.lineTo(
            d.x + Math.cos(d.angle + 0.5) * d.size * 2,
            d.y + Math.sin(d.angle + 0.5) * d.size * 2
          );
          this.ctx.stroke();
        }

        this.ctx.restore();
      });

      if (alive) {
        requestAnimationFrame(() => this.animate());
      } else {
        this.fadeOut();
      }
    }

    fadeOut() {
      this.isPlaying = false;
      this.canvas.style.opacity = "0";
      setTimeout(() => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drops = [];
      }, 500);
    }

    // Trigger blood on page navigation
    triggerOnPageLoad() {
      // Random chance to trigger
      if (Math.random() > 0.001) return;
      setTimeout(() => {
        this.splash(20 + Math.random() * 30, 0.5 + Math.random());
      }, 300 + Math.random() * 500);
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

    // initialize blood splatter
    const blood = new BloodSplatter();
    blood.init();

    // trigger random blood on page load
    setTimeout(() => {
      blood.triggerOnPageLoad();
    }, 1000);

    // trigger on navigation
    const origNavigate = router.navigate.bind(router);
    router.navigate = async function (path) {
      await origNavigate(path);
      blood.triggerOnPageLoad();
    };
    window.blood = blood;

    // initialize cursor
    const cursor = new SimpleCursor();

    // hide loader after everything is loaded
    const loader = document.getElementById("app-loader");
    if (loader) {
      loader.classList.add("hidden");
    }

    await router.handleRoute(window.location.pathname);
  });

  // hide loader after everything loads
  function hideLoader() {
    const loader = document.getElementById("app-loader");
    if (loader) {
      loader.classList.add("hidden");
    }
  }

  // call hideLoader after navigation renders
  setTimeout(hideLoader, 500);
})();
