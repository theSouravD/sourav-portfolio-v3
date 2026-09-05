/**
 * The site's sound.
 *
 * SYNTHESISED, NOT FILES
 * Hosted audio would be a request, a cache entry and a licence to worry about,
 * for cues under a fifth of a second each. This is a handful of oscillators
 * and noise bursts — no assets, and a cue is re-tuned by changing a number
 * rather than re-rendering a wav.
 *
 * THE AUTOPLAY RULE, WHICH IS NOT NEGOTIABLE
 * Sound is ON by default now, but "on" cannot mean "plays on load": every
 * browser refuses audio until the user has interacted with the page, and an
 * AudioContext built before that starts suspended. Fighting it is futile, so
 * the context is created lazily on the first cue that follows a real gesture
 * — the first click, key or tap. In practice the title plays the moment
 * someone touches the page, and everything after that is immediate.
 *
 * WHY THE CUES ARE THIS QUIET
 * Interface sound is a garnish that becomes an irritant the second it is
 * noticeable. Every cue here is short, unpitched and low-gain, and hovers
 * are quieter than clicks because they happen ten times as often.
 */

import { readSound as readStored, save } from './theme';

let ctx: AudioContext | null = null;
let bus: GainNode | null = null;
let armed = false;
let enabled = true;

function ac(): AudioContext | null {
  if (typeof window === 'undefined' || !armed || !enabled) return null;
  if (!ctx) {
    const Ctor = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
      bus = ctx.createGain();
      // One master gain for everything, so muting is a single ramp rather than
      // a flag every cue has to remember to check.
      bus.gain.value = 0.9;
      bus.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/**
 * Arm the audio on the first real gesture anywhere on the page.
 *
 * `once` on each listener, and all three removed together — a page that keeps
 * a pointerdown listener alive for the whole session to do nothing is a page
 * leaking a listener.
 */
export function armAudio() {
  if (typeof window === 'undefined' || armed) return;
  const go = () => {
    armed = true;
    ac();
    window.removeEventListener('pointerdown', go);
    window.removeEventListener('keydown', go);
    window.removeEventListener('touchstart', go);
  };
  window.addEventListener('pointerdown', go, { once: true });
  window.addEventListener('keydown', go, { once: true });
  window.addEventListener('touchstart', go, { once: true });
}

/* ---------------------------------------------------------------- */

/** A short band-passed noise burst — the mechanical part of every cue. */
function noise(c: AudioContext, at: number, gain: number, freq: number, len = 0.05, q = 1.1) {
  const n = Math.floor(c.sampleRate * len);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i += 1) {
    // Decayed as it is written, so the burst has a shape rather than being a
    // flat block of hiss with an envelope stuck on the front.
    data[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3;
  }
  const src = c.createBufferSource();
  src.buffer = buf;

  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = freq;
  bp.Q.value = q;

  const g = c.createGain();
  g.gain.setValueAtTime(gain, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len + 0.01);

  src.connect(bp).connect(g).connect(bus!);
  src.start(at);
  src.stop(at + len + 0.02);
}

/**
 * A struck resonant body — the hollow knock.
 *
 * What makes a sound "hollow" is a short excitation ringing in a narrow
 * resonance: knuckle on a door, a wood block. So this is a noise burst (the
 * strike) fed through a very high-Q bandpass (the cavity) that is swept down
 * slightly as it decays, which is what a real body does as its energy leaves.
 * A plain sine would be a beep; the resonance is the whole character.
 */
function knock(c: AudioContext, at: number, freq: number, gain: number, len = 0.16) {
  const n = Math.floor(c.sampleRate * 0.02);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i += 1) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2;

  const src = c.createBufferSource();
  src.buffer = buf;

  const body = c.createBiquadFilter();
  body.type = 'bandpass';
  body.Q.value = 14;
  body.frequency.setValueAtTime(freq, at);
  body.frequency.exponentialRampToValueAtTime(freq * 0.82, at + len);

  const g = c.createGain();
  g.gain.setValueAtTime(gain, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);

  src.connect(body).connect(g).connect(bus!);
  src.start(at);
  src.stop(at + len + 0.02);
}

/* ---- the two cues ---- */

/*
 * The site makes sound twice: the title on arrival, and a click when you
 * press something.
 *
 * Hover and the room-change cue were both removed rather than turned down.
 * Hover fired ten times as often as anything else and had nothing to say —
 * the pointer passing over a thing is not an event — and the transition cue
 * doubled up with the click that had just caused it. A cue that fires when
 * nothing happened is the thing that makes interface sound tiring.
 */
export type Cue = 'tap';

export function cue(_kind: Cue) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  // Two resonances a fifth apart: one alone still reads as a pitched beep,
  // the pair reads as a struck body.
  knock(c, t, 520, 0.12, 0.16);
  knock(c, t + 0.004, 780, 0.045, 0.095);
}

/**
 * The title sequence. `glyphs` and `stagger` come from the animation, so the
 * audio and the motion are driven by the same two numbers and cannot drift
 * apart when either is re-tuned.
 */
export function playTitle(glyphs: number, stagger: number, delay = 0) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + delay / 1000;
  const span = (glyphs * stagger) / 1000;

  // The swell: the weight under the sequence. Not a musical note — a pitched
  // tone under a name reads as a jingle.
  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(52, t0);
  osc.frequency.exponentialRampToValueAtTime(38, t0 + span + 0.9);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.08, t0 + span * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + span + 0.9);
  osc.connect(g).connect(bus!);
  osc.start(t0);
  osc.stop(t0 + span + 0.95);

  for (let i = 0; i < glyphs; i += 1) {
    // Quieter as it goes: the first letters land hardest, which stops equal
    // ticks reading as a typewriter.
    noise(c, t0 + (i * stagger) / 1000, 0.07 * (1 - i / (glyphs * 1.7)), 1900 + Math.random() * 900);
  }
}

/* ---- the switch ---- */

export function setSound(on: boolean) {
  enabled = on;
  save('sound', on ? 'on' : 'off');
  if (bus && ctx) {
    // Ramped, not switched. Setting a gain instantly mid-tone clicks.
    bus.gain.cancelScheduledValues(ctx.currentTime);
    bus.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 0.02);
  }
}

export function readSound() { return readStored(); }
export const saveSound = setSound;

/** Sync the module with stored state at startup. */
export function initSound() {
  enabled = readStored();
  armAudio();
}
