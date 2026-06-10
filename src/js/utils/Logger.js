class Logger {
  constructor(module) {
    this.module = module;
  }

  log(...args) {
    console.log(`[${this.module}]`, ...args);
  }

  warn(...args) {
    console.warn(`[${this.module}]`, ...args);
  }

  error(...args) {
    console.error(`[${this.module}]`, ...args);
  }

  debug(...args) {
    if (typeof window !== "undefined" && window.DEBUG) {
      console.debug(`[${this.module}]`, ...args);
    }
  }
}

module.exports = { Logger };
