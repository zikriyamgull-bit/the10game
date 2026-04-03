import { useCallback, useEffect, useRef, useState } from "react";

const MUTE_KEY = "the10game_muted";

// Web Audio API sound synthesizer - no external files needed
const MUSIC_VOL_KEY = "the10game_music_vol";

class SoundManager {
  private ctx: AudioContext | null = null;
  private _muted: boolean;
  private _musicVolume: number;
  private musicGain: GainNode | null = null;
  private musicOscs: OscillatorNode[] = [];
  private musicPlaying = false;

  constructor() {
    this._muted = localStorage.getItem(MUTE_KEY) === "true";
    this._musicVolume = parseFloat(localStorage.getItem(MUSIC_VOL_KEY) || "0.3");
  }

  get muted() { return this._muted; }
  set muted(v: boolean) {
    this._muted = v;
    localStorage.setItem(MUTE_KEY, String(v));
    if (this.musicGain) {
      this.musicGain.gain.setValueAtTime(v ? 0 : this._musicVolume * 0.06, this.getCtx().currentTime);
    }
  }

  get musicVolume() { return this._musicVolume; }
  set musicVolume(v: number) {
    this._musicVolume = v;
    localStorage.setItem(MUSIC_VOL_KEY, String(v));
    if (this.musicGain && !this._muted) {
      this.musicGain.gain.setValueAtTime(v * 0.06, this.getCtx().currentTime);
    }
  }

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  startMusic() {
    if (this.musicPlaying) return;
    this.musicPlaying = true;
    const ctx = this.getCtx();
    this.musicGain = ctx.createGain();
    this.musicGain.gain.setValueAtTime(
      this._muted ? 0 : this._musicVolume * 0.06,
      ctx.currentTime
    );
    this.musicGain.connect(ctx.destination);
    this.playAmbientLoop();
  }

  stopMusic() {
    this.musicPlaying = false;
    this.musicOscs.forEach(o => { try { o.stop(); } catch {} });
    this.musicOscs = [];
    if (this.musicGain) {
      this.musicGain.disconnect();
      this.musicGain = null;
    }
  }

  private playAmbientLoop() {
    if (!this.musicPlaying || !this.musicGain) return;
    const ctx = this.getCtx();

    // Bright, playful major chords in higher register
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C maj
      [293.66, 369.99, 440.00, 587.33], // D maj
      [349.23, 440.00, 523.25, 698.46], // F maj
      [392.00, 493.88, 587.33, 783.99], // G maj
      [261.63, 329.63, 392.00, 523.25], // C maj
      [329.63, 415.30, 493.88, 659.25], // E maj
      [349.23, 440.00, 523.25, 698.46], // F maj
      [392.00, 493.88, 587.33, 783.99], // G maj
    ];
    const now = ctx.currentTime;
    const chordDur = 2;

    chords.forEach((freqs, ci) => {
      freqs.forEach((f, fi) => {
        const osc = ctx.createOscillator();
        osc.type = fi === 3 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(f, now + ci * chordDur);
        const env = ctx.createGain();
        const vol = fi === 3 ? 0.4 : 0.7;
        env.gain.setValueAtTime(0.001, now + ci * chordDur);
        env.gain.linearRampToValueAtTime(vol, now + ci * chordDur + 0.3);
        env.gain.setValueAtTime(vol, now + ci * chordDur + chordDur * 0.6);
        env.gain.linearRampToValueAtTime(0.001, now + (ci + 1) * chordDur);
        osc.connect(env);
        env.connect(this.musicGain!);
        osc.start(now + ci * chordDur);
        osc.stop(now + (ci + 1) * chordDur + 0.05);
        this.musicOscs.push(osc);
      });

      // Bouncy pluck on each chord change
      const pluck = ctx.createOscillator();
      pluck.type = "triangle";
      pluck.frequency.setValueAtTime(freqs[2] * 2, now + ci * chordDur);
      const pluckEnv = ctx.createGain();
      pluckEnv.gain.setValueAtTime(0.8, now + ci * chordDur);
      pluckEnv.gain.exponentialRampToValueAtTime(0.001, now + ci * chordDur + 0.25);
      pluck.connect(pluckEnv);
      pluckEnv.connect(this.musicGain!);
      pluck.start(now + ci * chordDur);
      pluck.stop(now + ci * chordDur + 0.3);
      this.musicOscs.push(pluck);
    });

    const totalDur = chords.length * chordDur * 1000;
    setTimeout(() => {
      this.musicOscs = [];
      this.playAmbientLoop();
    }, totalDur);
  }

  private playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
    if (this._muted) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  tap() {
    this.playTone(880, 0.08, "sine", 0.1);
  }

  advance() {
    this.playTone(523, 0.1, "sine", 0.12);
    setTimeout(() => this.playTone(659, 0.1, "sine", 0.12), 60);
  }

  correct() {
    if (this._muted) return;
    const ctx = this.getCtx();
    [523, 659, 784].forEach((f, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      }, i * 100);
    });
  }

  wrong() {
    this.playTone(200, 0.3, "sawtooth", 0.1);
    setTimeout(() => this.playTone(150, 0.4, "sawtooth", 0.08), 150);
  }

  fail() {
    if (this._muted) return;
    const ctx = this.getCtx();
    [400, 350, 300, 200].forEach((f, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      }, i * 120);
    });
  }

  roundComplete() {
    if (this._muted) return;
    const ctx = this.getCtx();
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      }, i * 80);
    });
  }

  click() {
    this.playTone(600, 0.05, "sine", 0.08);
  }
}

const soundManager = new SoundManager();

export function useSoundManager() {
  const [muted, setMuted] = useState(soundManager.muted);
  const [musicVolume, setMusicVolume] = useState(soundManager.musicVolume);

  const toggleMute = useCallback(() => {
    soundManager.muted = !soundManager.muted;
    setMuted(soundManager.muted);
  }, []);

  const setMusicVol = useCallback((v: number) => {
    soundManager.musicVolume = v;
    setMusicVolume(v);
  }, []);

  return { sound: soundManager, muted, toggleMute, musicVolume, setMusicVol };
}

export { soundManager };
