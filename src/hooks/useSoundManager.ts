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
    const chords = [
      [130.81, 164.81, 196.00], // C3 E3 G3
      [110.00, 138.59, 164.81], // A2 C#3 E3
      [146.83, 185.00, 220.00], // D3 F#3 A3
      [123.47, 155.56, 185.00], // B2 Eb3 F#3
    ];
    const now = ctx.currentTime;
    const chordDur = 4;

    chords.forEach((freqs, ci) => {
      freqs.forEach(f => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + ci * chordDur);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.001, now + ci * chordDur);
        env.gain.linearRampToValueAtTime(1, now + ci * chordDur + 1.5);
        env.gain.linearRampToValueAtTime(0.001, now + (ci + 1) * chordDur);
        osc.connect(env);
        env.connect(this.musicGain!);
        osc.start(now + ci * chordDur);
        osc.stop(now + (ci + 1) * chordDur);
        this.musicOscs.push(osc);
      });
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
