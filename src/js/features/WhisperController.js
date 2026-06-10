import { Logger } from "../utils/Logger.js";

class WhisperController {
  constructor(audioData) {
    this.logger = new Logger("Whisper");
    this.audioData = audioData;
    this.audio = null;
    this.isPlaying = false;
  }

  play() {
    if (this.isPlaying) return;

    if (!this.audio) {
      this.audio = document.getElementById("ambient-audio");
      if (!this.audio) {
        this.audio = new Audio(
          `/audio/${this.audioData?.ambient || "whisper-soft.mp3"}`
        );
        this.audio.loop = true;
        this.audio.volume = this.audioData?.volume || 0.08;
      }
    }

    this.audio.play().catch((err) => {
      this.logger.warn(
        "Audio playback failed (may require user interaction first)",
        err
      );
    });

    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying || !this.audio) return;

    // Fade out
    const fadeInterval = setInterval(() => {
      if (this.audio.volume > 0.01) {
        this.audio.volume -= 0.005;
      } else {
        clearInterval(fadeInterval);
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.volume = this.audioData?.volume || 0.08;
      }
    }, 50);

    this.isPlaying = false;
  }
}

module.exports = { WhisperController };
