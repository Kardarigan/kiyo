import { EventBus } from "./EventBus";

class StateManger {
  constructor(eventBus) {
    this.state = {};
    this.eventBus = this.eventBus;
  }

  getState(key) {
    return key ? this.state[key] : { ...this.state };
  }

  setState(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    this.eventBus.emit(`state:${key}`, { oldValue, newValue: value });
    this.eventBus.emit(`state:changed`, { key, oldValue, newValue: value });
  }

  // Subscribe to a specific state key
  watch(key, callback) {
    return this.eventBus.on(`state:${key}`, callback);
  }
}

module.exports = { StateManger };
