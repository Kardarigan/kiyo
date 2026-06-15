class StateManager {
  constructor(eventBus) {
    this.state = {};
    this.eventBus = eventBus;
  }

  getState(key) {
    return key ? this.state[key] : { ...this.state };
  }

  setState(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    if (this.eventBus) {
      this.eventBus.emit(`state:${key}`, { oldValue, newValue: value });
      this.eventBus.emit(`state:changed`, { key, oldValue, newValue: value });
    }
  }

  watch(key, callback) {
    if (this.eventBus) {
      return this.eventBus.on(`state:${key}`, callback);
    }
    return () => {};
  }
}

export { StateManager };
