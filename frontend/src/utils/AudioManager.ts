class AudioManager {
  private static instance: AudioManager;
  private context: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private unlocked = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private async initialize() {
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Load your notification sound
      const response = await fetch('/orderNotification.wav');
      const arrayBuffer = await response.arrayBuffer();
      this.buffer = await this.context.decodeAudioData(arrayBuffer);
      // Attempt silent play
      await this.playSilent();
      this.unlocked = true;
    } catch (e) {
      console.error('Audio init failed', e);
    }
  }

  private async playSilent() {
    if (!this.context) return;
    const source = this.context.createBufferSource();
    const buffer = this.context.createBuffer(1, 1, 22050);
    source.buffer = buffer;
    source.connect(this.context.destination);
    source.start(0);
    await new Promise(resolve => source.onended = resolve);
  }

  public async play() {
    if (!this.unlocked || !this.context || !this.buffer) return;
    try {
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }
      const source = this.context.createBufferSource();
      source.buffer = this.buffer;
      source.connect(this.context.destination);
      source.start(0);
    } catch (e) {
      console.error('Playback failed', e);
    }
  }
}

export default AudioManager;
