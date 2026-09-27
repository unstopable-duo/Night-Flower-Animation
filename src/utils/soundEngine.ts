/**
 * ============================================================================
 * Ethereal Ambient Soundtrack & Velvet Sound Engine (Web Audio API)
 * ============================================================================
 * Dedicated to: Neo Naledi Mogoboya
 * Made by: Roland Penn
 *
 * Notice: This sound engine and procedural ambient score was composed and
 * engineered by Roland Penn for Neo Naledi Mogoboya.
 * Any use without acknowledgements of the creator (Roland Penn) is strictly illegal.
 * ============================================================================
 */

type MuteListener = (isMuted: boolean) => void;

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private isAmbientRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private listeners: Set<MuteListener> = new Set();
  private chordTimer: number | null = null;
  private melodyTimer: number | null = null;
  private chordIndex: number = 0;

  // Ultra-smooth, warm, velvety romantic chords (Fmaj9 -> Dm9 -> Bbmaj7 -> Csus2)
  private readonly chords: { root: number; notes: number[] }[] = [
    { root: 87.31, notes: [174.61, 220.00, 261.63, 329.63] }, // F2 root, F3, A3, C4, E4 (Fmaj9)
    { root: 73.42, notes: [146.83, 174.61, 220.00, 261.63] }, // D2 root, D3, F3, A3, C4 (Dm7)
    { root: 58.27, notes: [116.54, 146.83, 174.61, 220.00] }, // Bb1 root, Bb2, D3, F3, A3 (Bbmaj7)
    { root: 65.41, notes: [130.81, 164.81, 196.00, 293.66] }, // C2 root, C3, E3, G3, D4 (Cadd9)
  ];

  // Gentle music box melody notes
  private readonly melodyNotes: number[] = [
    349.23, // F4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    659.25, // E5
  ];

  constructor() {
    this.isMuted = false;
  }

  public subscribe(listener: MuteListener): () => void {
    this.listeners.add(listener);
    listener(this.isMuted);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.isMuted));
  }

  public init(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Ambient Channel (Warm, clearly audible romantic background pad)
        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
        this.ambientGain.connect(this.masterGain);

        // Sound Effects Channel
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      }
    }
    return this.ctx;
  }

  /**
   * Resumes the AudioContext on any user interaction
   */
  public resume() {
    const ctx = this.init();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        if (!this.isAmbientRunning) {
          this.startAmbient();
        }
      }).catch(() => {});
    } else if (!this.isAmbientRunning) {
      this.startAmbient();
    }
  }

  /**
   * Starts the peaceful, warm, continuous ambient sound
   */
  public startAmbient() {
    const ctx = this.init();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (this.isAmbientRunning) return;
    this.isAmbientRunning = true;

    if (this.ambientGain) {
      const now = ctx.currentTime;
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.28, now + 1.8);
    }

    this.playNextChord();
    this.scheduleGentleMelody();
  }

  /**
   * Seamlessly glides between warm, filtered sine chords every 7 seconds
   */
  private playNextChord() {
    if (!this.ctx || !this.isAmbientRunning) return;

    const now = this.ctx.currentTime;
    const chord = this.chords[this.chordIndex];
    this.chordIndex = (this.chordIndex + 1) % this.chords.length;

    const voiceGain = this.ctx.createGain();
    // Smooth 2.2s attack, 3.8s sustain, 3.5s release
    voiceGain.gain.setValueAtTime(0.001, now);
    voiceGain.gain.linearRampToValueAtTime(0.25, now + 2.2);
    voiceGain.gain.setValueAtTime(0.25, now + 5.5);
    voiceGain.gain.linearRampToValueAtTime(0.0001, now + 9.5);

    // Warm Low-pass filter (750Hz) removes all harsh buzz while keeping the rich warmth
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(680, now);
    filter.frequency.linearRampToValueAtTime(820, now + 3.0);
    filter.frequency.linearRampToValueAtTime(650, now + 8.5);
    filter.Q.setValueAtTime(0.7, now);

    voiceGain.connect(filter);
    if (this.ambientGain) {
      filter.connect(this.ambientGain);
    }

    // Gentle sub-bass foundation
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(chord.root, now);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.12, now);
    subOsc.connect(subGain);
    subGain.connect(voiceGain);

    subOsc.start(now);
    subOsc.stop(now + 9.8);

    // Chord harmonic voices
    chord.notes.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const noteGain = this.ctx.createGain();
      noteGain.gain.setValueAtTime(0.08, now);

      osc.connect(noteGain);
      noteGain.connect(voiceGain);

      osc.start(now);
      osc.stop(now + 9.8);
    });

    // Schedule next chord in 6.8 seconds for smooth overlapping transition
    this.chordTimer = window.setTimeout(() => {
      this.playNextChord();
    }, 6800);
  }

  /**
   * Schedules a tender, distant music-box note every 4-6 seconds
   */
  private scheduleGentleMelody() {
    if (!this.isAmbientRunning) return;

    const delay = 3800 + Math.random() * 2500;
    this.melodyTimer = window.setTimeout(() => {
      if (this.isAmbientRunning && !this.isMuted) {
        const note = this.melodyNotes[Math.floor(Math.random() * this.melodyNotes.length)];
        this.playMelodyNote(note);
      }
      this.scheduleGentleMelody();
    }, delay);
  }

  private playMelodyNote(freq: number) {
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

      osc.connect(filter);
      filter.connect(gain);
      if (this.ambientGain) {
        gain.connect(this.ambientGain);
      }

      osc.start(now);
      osc.stop(now + 2.1);
    } catch {
      // Audio context may not be active
    }
  }

  public toggleMute(): boolean {
    this.resume();
    this.isMuted = !this.isMuted;

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      if (this.isMuted) {
        this.masterGain.gain.linearRampToValueAtTime(0, now + 0.15);
      } else {
        this.masterGain.gain.linearRampToValueAtTime(1, now + 0.2);
        if (!this.isAmbientRunning) {
          this.startAmbient();
        }
      }
    }

    this.notify();
    return this.isMuted;
  }

  // Soft, velvety chime for delicate touch feedback
  public playChime(freq: number = 523.25, volume: number = 0.06) {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.Q.setValueAtTime(0.6, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 1.3);
    } catch {
      // Audio context may be restricted before user gesture
    }
  }

  public playHeartBurst() {
    if (this.isMuted) return;
    this.playChime(440.00, 0.05); // Warm A4
  }

  public playBloomChime() {
    if (this.isMuted) return;
    this.playChime(349.23, 0.06); // Soft F4
  }

  public dispose() {
    this.isAmbientRunning = false;
    if (this.chordTimer) clearTimeout(this.chordTimer);
    if (this.melodyTimer) clearTimeout(this.melodyTimer);
    if (this.ctx) {
      this.ctx.close().catch(() => {});
    }
  }
}

export const sound = new SoundEngine();
