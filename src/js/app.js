(function () {
  window.App = {
    easterEggs: null,
    whisper: null,
    parallax: null,
    router: null,
    stateManager: null,
  };

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

  // === EASTER EGGS ===
  class EasterEggManager {
    constructor() {
      this.secretPhrase = "Miyadera";
      this.typed = "";
      this.whisperTexts = [
        "Kehehe...",
        "Beautiful, isn't it?",
        "Humanity never ceases to amaze.",
      ];

      document.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
          return;
        this.typed += e.key;
        if (this.typed.length > 20) this.typed = this.typed.slice(-20);
        if (
          this.typed.toLowerCase().includes(this.secretPhrase.toLowerCase())
        ) {
          this.triggerSecret();
          this.typed = "";
        }
        clearTimeout(this.phraseTimeout);
        this.phraseTimeout = setTimeout(() => {
          this.typed = "";
        }, 4000);
      });

      // Hidden corner to Sister page
      const corner = document.createElement("div");
      corner.style.cssText = `position:fixed;top:0;left:0;width:40px;height:40px;z-index:9998;cursor:pointer;opacity:0.01;`;
      corner.addEventListener("click", () => {
        this.triggerSecret();
        setTimeout(() => (window.location.href = "/app/sister"), 1000);
      });
      document.body.appendChild(corner);

      // Initial glitch effect
      this.initGlitchEffect();
    }

    triggerSecret() {
      const msg = document.createElement("div");
      msg.className = "secret-message";
      msg.textContent = "She approves of your curiosity.";
      msg.style.cssText = `position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#141414;border:1px solid #c9a84c;color:#c9a84c;padding:0.5rem 1.5rem;font-family:"Cinzel",serif;font-size:0.8rem;letter-spacing:0.05em;z-index:9999;opacity:0;transition:opacity 0.5s ease;`;
      document.body.appendChild(msg);
      setTimeout(() => (msg.style.opacity = "1"), 10);
      setTimeout(() => {
        msg.style.opacity = "0";
        setTimeout(() => msg.remove(), 500);
      }, 3000);
      document.body.style.filter = "hue-rotate(30deg)";
      setTimeout(() => {
        document.body.style.filter = "";
      }, 200);

      // Play whisper when secret is triggered
      if (window.App.whisper) {
        window.App.whisper.playRandom();
      }
    }

    // Glitch effect on images
    initGlitchEffect() {
      document
        .querySelectorAll(
          ".portrait-main, .portrait-side, .sister-image, .artifact-image"
        )
        .forEach((img) => {
          if (img._glitchAttached) return;
          img._glitchAttached = true;
          img.addEventListener("mouseenter", () => {
            img.style.filter = "sepia(0.3) brightness(0.9) hue-rotate(-5deg)";
            img.style.transform = "scale(1.005)";
          });
          img.addEventListener("mouseleave", () => {
            img.style.filter = "";
            img.style.transform = "";
          });
        });
    }
  }

  // === WHISPER ===
  class WhisperController {
    constructor() {
      this.isPlaying = false;
      this.whisperTexts = [
        "Kehehe...",
        "Beautiful, isn't it?",
        "Humanity never ceases to amaze.",
      ];
    }
    play(text) {
      if (this.isPlaying || !("speechSynthesis" in window)) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.4;
      utterance.pitch = 0.8;
      utterance.volume = 0.3;
      window.speechSynthesis.speak(utterance);
      this.isPlaying = true;
      setTimeout(() => {
        this.isPlaying = false;
      }, 2000);
    }
    playRandom() {
      this.play(
        this.whisperTexts[Math.floor(Math.random() * this.whisperTexts.length)]
      );
    }
    stop() {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      this.isPlaying = false;
    }
  }

  // === PARALLAX ===
  class ParallaxController {
    constructor() {
      this.elements = [];
      this.ticking = false;
      this.init();
    }
    init() {
      this.collectElements();
      window.addEventListener(
        "scroll",
        () => {
          if (!this.ticking) {
            requestAnimationFrame(() => {
              this.update();
              this.ticking = false;
            });
            this.ticking = true;
          }
        },
        { passive: true }
      );
    }
    collectElements() {
      this.elements = [];
      document.querySelectorAll("[data-parallax]").forEach((el) => {
        this.elements.push({
          el,
          speed: parseFloat(el.dataset.parallax) || 0.1,
        });
      });
    }
    update() {
      const vh = window.innerHeight;
      this.elements.forEach(({ el, speed }) => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = center - vh / 2;
        if (rect.bottom > -200 && rect.top < vh + 200) {
          el.style.transform = `translateY(${dist * speed}px)`;
        }
      });
    }
  }

  // === ROUTER ===
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
      window.addEventListener("popstate", () =>
        this.handleRoute(window.location.pathname)
      );
      this.onPageChange = null;
    }
    async navigate(path) {
      window.history.pushState({}, "", path);
      await this.handleRoute(path);
    }
    async handleRoute(path) {
      const pageName = this.getPageName(path);
      if (this.container) this.container.style.opacity = "0";
      await new Promise((r) => setTimeout(r, 200));
      const renderer = this.routes[pageName];
      if (renderer && this.container) await renderer.call(this, this.container);
      else if (this.container)
        this.container.innerHTML = `<div class="error-state"><h2>Page Not Found</h2></div>`;

      // Notify page change
      if (this.onPageChange) {
        this.onPageChange(pageName);
      }

      if (this.container) {
        this.container.style.opacity = "1";
        window.scrollTo({ top: 0 });
      }
    }
    getPageName(path) {
      const clean = path.replace(/^\/+|\/+$/g, "");
      if (clean === "" || clean === "app" || clean === "home") return "home";
      const parts = clean.split("/");
      return parts[0] === "app" ? parts[1] || "home" : parts[0];
    }
    escapeHtml(str) {
      if (!str) return "";
      const d = document.createElement("div");
      d.textContent = str;
      return d.innerHTML;
    }

    async renderHome(c) {
      const r = await fetch("/api/v1/character"),
        d = await r.json();
      c.innerHTML = `
        <section class="home-hero">
          <div class="hero-content" data-parallax="0.05">
            <h1 class="hero-name heading-1">${this.escapeHtml(
              d.character.name
            )}</h1>
            <p class="hero-subtitle heading-4 text-accent">${this.escapeHtml(
              d.character.title
            )}</p>
            <blockquote class="hero-quote body-large text-muted">"${this.escapeHtml(
              d.pages.home.heroQuote
            )}"</blockquote>
          </div>
          <div class="hero-image" data-parallax="0.1">
            <div class="image-frame">
              <img src="/images/korekiyo/${this.escapeHtml(
                d.pages.home.featuredImage
              )}" alt="${this.escapeHtml(
        d.character.name
      )}" class="portrait-main" onerror="this.src='/images/placeholder.jpg'">
            </div>
          </div>
        </section>
        <section class="home-intro" data-parallax="0.02">
          <div class="intro-card card"><p class="body-large">${this.escapeHtml(
            d.character.bio.short
          )}</p></div>
        </section>
      `;
    }

    async renderAbout(c) {
      const r = await fetch("/api/v1/character"),
        d = await r.json();
      let appearanceHtml = "";
      for (const [key, value] of Object.entries(d.character.appearance || {})) {
        appearanceHtml += `<div class="appearance-item" data-parallax="0.03"><span class="appearance-key text-accent">${this.escapeHtml(
          key
        )}</span><span class="appearance-desc">${this.escapeHtml(
          value
        )}</span></div>`;
      }
      c.innerHTML = `
        <section class="about-section page-section">
          <header class="page-header"><h1 class="heading-1">${this.escapeHtml(
            d.pages.about.title
          )}</h1><div class="header-ornament"></div></header>
          <div class="about-layout">
            <div class="about-content" data-parallax="0.05"><div class="about-text body-large"><p>${this.escapeHtml(
              d.character.bio.full
            )}</p></div>
              <div class="about-details"><div class="detail-item"><span class="detail-label text-accent">Affiliation</span><span class="detail-value">${this.escapeHtml(
                d.character.affiliation
              )}</span></div></div>
            </div>
            <aside class="about-image" data-parallax="0.08"><div class="image-frame portrait-frame"><img src="/images/korekiyo/${this.escapeHtml(
              d.pages.about.image
            )}" alt="${this.escapeHtml(
        d.character.name
      )}" class="portrait-side" onerror="this.src='/images/placeholder.jpg'"></div></aside>
          </div>
          <div class="about-appearance"><h3 class="heading-3">Physical Description</h3><div class="appearance-grid">${appearanceHtml}</div></div>
        </section>
      `;
    }

    async renderJournal(c) {
      const r = await fetch("/api/v1/character"),
        d = await r.json();
      let entriesHtml = "";
      for (let i = 0; i < (d.pages.journal.entries || []).length; i++) {
        const entry = d.pages.journal.entries[i];
        entriesHtml += `<article class="journal-entry card" data-parallax="0.04" onclick="window.showJournalEntry(${i})">
          <div class="entry-meta"><span class="entry-date text-accent">${this.escapeHtml(
            entry.date
          )}</span><span class="entry-location text-muted">${this.escapeHtml(
          entry.location || ""
        )}</span></div>
          <h2 class="entry-title heading-3">${this.escapeHtml(entry.title)}</h2>
          <div class="entry-preview body-text"><p>${this.escapeHtml(
            entry.content.substring(0, 200)
          )}...</p></div>
          <button class="btn btn-ghost">Read Full Entry</button>
        </article>`;
      }
      c.innerHTML = `
        <section class="journal-section page-section">
          <header class="page-header"><h1 class="heading-1">${this.escapeHtml(
            d.pages.journal.title
          )}</h1><p class="body-large text-muted">${this.escapeHtml(
        d.pages.journal.description
      )}</p><div class="header-ornament"></div></header>
          <div class="journal-entries">${entriesHtml}</div>
        </section>
        <div id="journal-modal" class="modal hidden"><div class="modal-overlay"></div><div class="modal-content"><button class="modal-close btn btn-ghost" onclick="document.getElementById('journal-modal').classList.add('hidden')">✕</button><div id="journal-modal-body"></div></div></div>
      `;
    }

    async renderArtifacts(c) {
      const r = await fetch("/api/v1/character"),
        d = await r.json();
      window.artifactItems = d.pages.artifacts.items || [];
      let itemsHtml = "";
      for (let i = 0; i < window.artifactItems.length; i++) {
        const item = window.artifactItems[i];
        itemsHtml += `<article class="artifact-card card" data-parallax="0.06" onclick="window.showArtifactDetail(${i})">
          <div class="artifact-image-container"><img src="/images/korekiyo/${this.escapeHtml(
            item.image
          )}" alt="${this.escapeHtml(
          item.name
        )}" class="artifact-image" onerror="this.src='/images/placeholder.jpg'">${
          item.threed
            ? '<span class="artifact-badge text-accent">3D View</span>'
            : ""
        }</div>
          <div class="artifact-info"><h3 class="artifact-name heading-3">${this.escapeHtml(
            item.name
          )}</h3><p class="artifact-origin text-muted">${this.escapeHtml(
          item.origin
        )}</p><p class="artifact-desc body-text">${this.escapeHtml(
          item.description.substring(0, 120)
        )}...</p></div>
        </article>`;
      }
      c.innerHTML = `
        <section class="artifacts-section page-section">
          <header class="page-header"><h1 class="heading-1">${this.escapeHtml(
            d.pages.artifacts.title
          )}</h1><p class="body-large text-muted">${this.escapeHtml(
        d.pages.artifacts.description
      )}</p><div class="header-ornament"></div></header>
          <div class="artifacts-grid">${itemsHtml}</div>
        </section>
        <div id="artifact-modal" class="modal hidden"><div class="modal-overlay"></div><div class="modal-content modal-artifact"><button class="modal-close btn btn-ghost" onclick="document.getElementById('artifact-modal').classList.add('hidden')">✕</button><div id="artifact-modal-body"></div></div></div>
      `;
    }

    async renderSister(c) {
      const r = await fetch("/api/v1/character"),
        d = await r.json();
      const sister = d.pages.sister;
      c.innerHTML = `
        <section class="sister-section page-section">
          <header class="page-header sister-header"><h1 class="heading-1">${this.escapeHtml(
            sister.title
          )}</h1><p class="heading-4 text-accent">${this.escapeHtml(
        sister.subtitle
      )}</p><div class="header-ornament sister-ornament"></div></header>
          <div class="sister-layout">
            <div class="sister-portrait" data-parallax="0.08"><div class="portrait-vignette"><img src="/images/korekiyo/${this.escapeHtml(
              sister.image
            )}" alt="Miyadera Shinguji" class="sister-image" onerror="this.src='/images/placeholder.jpg'"><div class="vignette-overlay"></div></div></div>
            <div class="sister-poem" data-parallax="0.03"><div class="poem-container"><p class="poem-text body-large">${this.escapeHtml(
              sister.poem
            )}</p><div class="poem-signature handwritten">— K.S.</div></div></div>
            <div class="sister-content" data-parallax="0.02"><p class="body-text">${this.escapeHtml(
              sister.content
            )}</p></div>
            <div class="sister-hairpin" data-parallax="0.05"><div class="hairpin-container"><img src="/images/korekiyo/${this.escapeHtml(
              sister.hairpinImage
            )}" alt="Her hairpin" class="hairpin-image" onerror="this.src='/images/placeholder.jpg'"><div class="hairpin-caption handwritten">Her favorite. I keep it close.</div></div><p class="hairpin-note text-muted">It has not gathered a single speck of dust.</p></div>
          </div>
          <div class="sister-whisper-zone" data-parallax="0.01"><span class="text-muted">— silence —</span></div>
        </section>
      `;

      // Add whisper to sister page - FIXED to use window.App.whisper
      setTimeout(() => {
        const zone = document.querySelector(".sister-whisper-zone");
        if (zone && window.App.whisper) {
          let timer;
          zone.addEventListener("mouseenter", () => {
            timer = setTimeout(() => window.App.whisper.playRandom(), 2000);
          });
          zone.addEventListener("mouseleave", () => {
            clearTimeout(timer);
            window.App.whisper.stop();
          });
        }
      }, 100);
    }
  }

  // === MODALS ===
  window.showJournalEntry = function (index) {
    const modal = document.getElementById("journal-modal");
    const body = document.getElementById("journal-modal-body");
    if (!modal || !body) return;
    fetch("/api/v1/character")
      .then((r) => r.json())
      .then((data) => {
        const entry = data.pages.journal.entries[index];
        if (!entry) return;
        body.innerHTML = `<div class="modal-entry-header"><span class="entry-date text-accent">${entry.date}</span></div><h2 class="heading-2">${entry.title}</h2><div class="header-ornament"></div><div class="entry-full body-large"><p>${entry.content}</p></div><div class="modal-entry-footer handwritten">— K.S.</div>`;
        modal.classList.remove("hidden");
      });
  };

  window.showArtifactDetail = function (index) {
    const modal = document.getElementById("artifact-modal");
    const body = document.getElementById("artifact-modal-body");
    const item = window.artifactItems?.[index];
    if (!modal || !body || !item) return;
    body.innerHTML = `<div class="modal-artifact-layout"><div class="modal-artifact-image"><img src="/images/korekiyo/${item.image}" alt="${item.name}"></div><div class="modal-artifact-info"><span class="text-accent">${item.origin}</span><h2 class="heading-2">${item.name}</h2><div class="header-ornament"></div><p class="body-large">${item.description}</p></div></div>`;
    modal.classList.remove("hidden");
  };

  // === NAVIGATION ===
  const navContainer = document.querySelector(".site-navigation");

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("href");
      Router.navigate(target);
    });
  });

  // === INIT ===
  document.addEventListener("DOMContentLoaded", async () => {
    const router = new Router();
    const nav = new Navigation(router);

    const r = await fetch("/api/v1/character");
    const data = await r.json();
    if (data.theme?.colors) {
      for (const [key, value] of Object.entries(data.theme.colors)) {
        document.documentElement.style.setProperty(`--color-${key}`, value);
      }
    }
    document.title = `${data.character.name} - ${data.character.title}`;

    // Initialize features
    window.App.easterEggs = new EasterEggManager();
    window.App.whisper = new WhisperController();
    window.App.parallax = new ParallaxController();
    window.App.router = router;

    // Hide loader
    const loader = document.getElementById("app-loader");
    if (loader) loader.classList.add("hidden");

    // Handle initial route
    await router.handleRoute(window.location.pathname);

    // Set up page change callback
    router.onPageChange = (pageName) => {
      console.log("📄 Page changed to:", pageName);

      // Re-collect parallax elements
      if (window.App.parallax) {
        setTimeout(() => window.App.parallax.collectElements(), 100);
      }

      // Refresh glitch effect for new images
      if (window.App.easterEggs) {
        setTimeout(() => window.App.easterEggs.initGlitchEffect(), 100);
      }

      // Trigger random whisper on sister page
      if (pageName === "sister" && window.App.whisper) {
        setTimeout(() => window.App.whisper.playRandom(), 1500);
      }
    };
    w;
  });
})();
