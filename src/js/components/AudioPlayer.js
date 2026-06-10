/*
 * Audio Player Utility
 * handles playing one shot sounds (zipper, whispers)
 */

class AudioPlayer {
  constructor() {
    this.sounds = {};
    this.enabled = true;
  }

  async load(name, url) {
    if (this.sounds[name]) return this.sounds[name];

    return new Promise((resolve) => {
      const audio = new Audio(url);
      audio.addEventListener(
        "canplaythrough",
        () => {
          this.sounds[name] = audio;
          resolve(audio);
        },
        { once: true }
      );
      audio.addEventListener("error", () => resolve(null));
      audio.load();
    });
  }

  play(name, options = {}) {
    if (!this.enabled) return;

    const sound = this.sounds[name];
    if (!sound) return;

    // Clone for overlapping playback
    const clone = sound.cloneNode();
    clone.volume = options.volume ?? 0.3;
    clone.playbackRate = options.playbackRate ?? 1.0;
    clone.play().catch(() => {});
  }

  setEnabled(state) {
    this.enabled = state;
  }
}

module.exports = { AudioPlayer };
