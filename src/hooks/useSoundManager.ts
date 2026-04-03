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
  private musicTimer: ReturnType<typeof setTimeout> | null = null;
  private _tier: "easy" | "competitive" | "hard" | "veryhard" | "boss" = "easy";

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

  setTier(replacementCount: number) {
    let tier: typeof this._tier;
    if (replacementCount <= 1) tier = "easy";
    else if (replacementCount <= 4) tier = "competitive";
    else if (replacementCount <= 7) tier = "hard";
    else if (replacementCount <= 10) tier = "veryhard";
    else tier = "boss";

    if (tier !== this._tier) {
      this._tier = tier;
      if (this.musicPlaying) {
        // Restart loop with new tier
        this.musicOscs.forEach(o => { try { o.stop(); } catch {} });
        this.musicOscs = [];
        if (this.musicTimer) clearTimeout(this.musicTimer);
        this.playAmbientLoop();
      }
    }
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
    if (this.musicTimer) { clearTimeout(this.musicTimer); this.musicTimer = null; }
    if (this.musicGain) {
      this.musicGain.disconnect();
      this.musicGain = null;
    }
  }

  private playAmbientLoop() {
    if (!this.musicPlaying || !this.musicGain) return;
    const ctx = this.getCtx();
    const t = this._tier;

    // Tier-specific chord sets, tempos, and timbres
    const tierConfig = {
      easy: {
        chords: [
          [261.63, 329.63, 392.00], // C maj
          [293.66, 369.99, 440.00], // D maj
          [349.23, 440.00, 523.25], // F maj
          [392.00, 493.88, 587.33], // G maj
        ],
        dur: 2.5, wave: "sine" as OscillatorType, pluckWave: "triangle" as OscillatorType,
        vol: 0.6, pluckVol: 0.5, attack: 0.4,
      },
      competitive: {
        chords: [
          [261.63, 329.63, 392.00, 523.25], // C maj7
          [220.00, 277.18, 329.63, 440.00], // A maj
          [246.94, 311.13, 369.99, 493.88], // B maj
          [329.63, 415.30, 493.88, 659.25], // E maj
        ],
        dur: 1.8, wave: "sine" as OscillatorType, pluckWave: "triangle" as OscillatorType,
        vol: 0.65, pluckVol: 0.7, attack: 0.25,
      },
      hard: {
        chords: [
          [261.63, 311.13, 392.00, 466.16], // Cm7
          [233.08, 277.18, 349.23, 415.30], // Bbm
          [207.65, 261.63, 311.13, 392.00], // Ab
          [246.94, 293.66, 369.99, 440.00], // Bm
        ],
        dur: 1.4, wave: "triangle" as OscillatorType, pluckWave: "sawtooth" as OscillatorType,
        vol: 0.7, pluckVol: 0.8, attack: 0.15,
      },
      veryhard: {
        chords: [
          [220.00, 261.63, 329.63, 415.30], // Am
          [196.00, 246.94, 293.66, 369.99], // Gm
          [207.65, 261.63, 311.13, 392.00], // Ab
          [185.00, 233.08, 277.18, 349.23], // F#m
          [196.00, 246.94, 293.66, 369.99], // Gm
          [174.61, 220.00, 261.63, 329.63], // Fm
        ],
        dur: 1.0, wave: "triangle" as OscillatorType, pluckWave: "sawtooth" as OscillatorType,
        vol: 0.75, pluckVol: 0.9, attack: 0.1,
      },
      boss: {
        chords: [
          [146.83, 174.61, 220.00, 293.66], // Dm dark
          [138.59, 164.81, 207.65, 277.18], // C#m
          [130.81, 155.56, 196.00, 261.63], // Cm
          [123.47, 146.83, 185.00, 246.94], // Bm
          [116.54, 138.59, 174.61, 233.08], // Bbm
          [130.81, 155.56, 196.00, 261.63], // Cm
          [138.59, 164.81, 207.65, 277.18], // C#m
          [146.83, 174.61, 220.00, 293.66], // Dm
        ],
        dur: 0.8, wave: "sawtooth" as OscillatorType, pluckWave: "square" as OscillatorType,
        vol: 0.5, pluckVol: 1.0, attack: 0.05,
      },
    };

    const cfg = tierConfig[t];
    const now = ctx.currentTime;

    cfg.chords.forEach((freqs, ci) => {
      freqs.forEach((f, fi) => {
        const osc = ctx.createOscillator();
        osc.type = fi === freqs.length - 1 ? cfg.pluckWave : cfg.wave;
        osc.frequency.setValueAtTime(f, now + ci * cfg.dur);
        const env = ctx.createGain();
        const v = fi === freqs.length - 1 ? cfg.vol * 0.5 : cfg.vol;
        env.gain.setValueAtTime(0.001, now + ci * cfg.dur);
        env.gain.linearRampToValueAtTime(v, now + ci * cfg.dur + cfg.attack);
        env.gain.setValueAtTime(v, now + ci * cfg.dur + cfg.dur * 0.55);
        env.gain.linearRampToValueAtTime(0.001, now + (ci + 1) * cfg.dur);
        osc.connect(env);
        env.connect(this.musicGain!);
        osc.start(now + ci * cfg.dur);
        osc.stop(now + (ci + 1) * cfg.dur + 0.05);
        this.musicOscs.push(osc);
      });

      // Pluck accent
      const pluck = ctx.createOscillator();
      pluck.type = cfg.pluckWave;
      pluck.frequency.setValueAtTime(freqs[Math.min(2, freqs.length - 1)] * 2, now + ci * cfg.dur);
      const pluckEnv = ctx.createGain();
      pluckEnv.gain.setValueAtTime(cfg.pluckVol, now + ci * cfg.dur);
      pluckEnv.gain.exponentialRampToValueAtTime(0.001, now + ci * cfg.dur + Math.min(0.25, cfg.dur * 0.3));
      pluck.connect(pluckEnv);
      pluckEnv.connect(this.musicGain!);
      pluck.start(now + ci * cfg.dur);
      pluck.stop(now + ci * cfg.dur + 0.3);
      this.musicOscs.push(pluck);
    });

    const totalDur = cfg.chords.length * cfg.dur * 1000;
    this.musicTimer = setTimeout(() => {
      this.musicOscs = [];
      this.musicTimer = null;
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
