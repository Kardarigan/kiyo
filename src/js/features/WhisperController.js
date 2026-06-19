import { Logger } from "../utils/Logger.js";

export class WhisperController {
  constructor(audioData) {
    this.logger = new Logger("Whisper");
    this.audioData = audioData;
    this.audio = null;
    this.isPlaying = false;
    this.whisperTexts = [
      "Kehehe...",
      "Beautiful, isn't it?",
      "Humanity never ceases to amaze.",
    ];
  }

  // Play ambient audio (the MP3 file)
  play() {
    if (this.isPlaying) return;

    if (!this.audio) {
      this.audio = document.getElementById("ambient-audio");
      if (!this.audio) {
        this.audio = new Audio(
          `/audio/korekiyo/${this.audioData?.ambient || "whisper-soft.mp3"}`
        );
        this.audio.loop = true;
        this.audio.volume = this.audioData?.volume || 0.08;
      } else {
        this.audio.loop = true;
        this.audio.volume = this.audioData?.volume || 0.08;
      }
    }

    this.audio.play().catch((err) => {
      this.logger.warn(
        "Audio playback failed (may need user interaction first)",
        err
      );
    });
    this.isPlaying = true;
  }

  // Stop ambient audio with fade
  stop() {
    if (!this.isPlaying || !this.audio) return;

    const fade = setInterval(() => {
      if (this.audio.volume > 0.01) {
        this.audio.volume -= 0.005;
      } else {
        clearInterval(fade);
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.volume = this.audioData?.volume || 0.08;
      }
    }, 50);
    this.isPlaying = false;
  }

  // Speech synthesis for text whispers (used by EasterEggs)
  playWhisper(text) {
    if (!("speechSynthesis" in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.4;
    utterance.pitch = 0.8;
    utterance.volume = 0.3;
    window.speechSynthesis.speak(utterance);
  }

  // Play a random whisper text using speech synthesis
  playRandomWhisper() {
    const text =
      this.whisperTexts[Math.floor(Math.random() * this.whisperTexts.length)];
    this.playWhisper(text);
  }

  // Autoplay ambient audio with user gesture fallback
  autoPlay() {
    this.play();

    if (!this.isPlaying) {
      const resumeAudio = () => {
        this.play();
        document.removeEventListener("click", resumeAudio);
        document.removeEventListener("touchstart", resumeAudio);
        document.removeEventListener("keydown", resumeAudio);
      };

      document.addEventListener("click", resumeAudio, { once: true });
      document.addEventListener("touchstart", resumeAudio, { once: true });
      document.addEventListener("keydown", resumeAudio, { once: true });
    }
  }
}
