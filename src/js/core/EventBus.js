export class EventBus {
  constructor() {
    this.listeners = new Map();
  }
  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => {
      const set = this.listeners.get(event);
      if (set) set.delete(callback);
    };
  }
  off(event, callback) {
    const set = this.listeners.get(event);
    if (set) set.delete(callback);
  }
  emit(event, data) {
    const set = this.listeners.get(event);
    if (set)
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in "${event}" listener:`, e);
        }
      });
  }
  once(event, callback) {
    const unsubscribe = this.on(event, (data) => {
      unsubscribe();
      callback(data);
    });
    return unsubscribe;
  }
}
