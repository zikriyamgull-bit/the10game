import { useCallback, useEffect, useRef, useState } from "react";

const MUTE_KEY = "the10game_muted";

// Web Audio API sound synthesizer - no external files needed
class SoundManager {
  private ctx: AudioContext | null = null;
  private _muted: boolean;

  constructor() {
    this._muted = localStorage.getItem(MUTE_KEY) === "true";
  }

  get muted() { return this._muted; }
  set muted(v: boolean) {
    this._muted = v;
    localStorage.setItem(MUTE_KEY, String(v));
  }

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
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

  const toggleMute = useCallback(() => {
    soundManager.muted = !soundManager.muted;
    setMuted(soundManager.muted);
  }, []);

  return { sound: soundManager, muted, toggleMute };
}

export { soundManager };
