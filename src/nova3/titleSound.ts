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

import type { ClickId, SoundId } from './theme';
import { readClick, readSoundPack, save } from './theme';

let ctx: AudioContext | null = null;
let bus: GainNode | null = null;
let armed = false;
let pack: SoundId = 'soft';
let click: ClickId = 'hollow';

function ac(): AudioContext | null {
  if (typeof window === 'undefined' || !armed || pack === 'off') return null;
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

/** A short sine blip. Used sparingly — pitch is what makes UI sound cute. */
function blip(c: AudioContext, at: number, from: number, to: number, gain: number, len: number) {
  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(to, at + len);

  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + len * 0.18);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);

  osc.connect(g).connect(bus!);
  osc.start(at);
  osc.stop(at + len + 0.02);
}

/* ---- the cues ---- */

export type Cue = 'tap' | 'hover' | 'move' | 'open' | 'close';

/**
 * THE PACKS.
 *
 * What makes a click read as a click is that it is almost pure transient:
 * very short, very high, and with no audible pitch. The first attempt was a
 * 35ms burst at 2.1kHz, which has far too much body and landed as a drum. So
 * every pack here is built from the same two ideas — a short filtered burst
 * for the mechanism and, at most, a very quick pitch move for direction — and
 * they differ in how bright, how long and how many.
 *
 * `sparse` has no hover cue at all. Hover fires ten times as often as
 * anything else, and on a page with this many controls that is the one cue
 * most likely to become an irritant.
 */
export function cue(kind: Cue) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;

  if (kind === 'hover') {
    if (pack === 'sparse') return;
    if (pack === 'mech') noise(c, t, 0.010, 7200, 0.007, 4);
    else if (pack === 'airy') noise(c, t, 0.008, 4200, 0.02, 1.6);
    else noise(c, t, 0.009, 6400, 0.009, 3.4);
    return;
  }

  /*
   * The press. Chosen independently of the pack, because it is the cue you
   * hear most and the one worth auditioning on its own.
   */
  if (kind === 'tap') {
    switch (click) {
      case 'none':
        break;
      case 'hollow':
        // Two resonances a fifth apart, the upper one quieter and shorter.
        // One alone reads as a pitched beep; the pair reads as a body.
        knock(c, t, 520, 0.13, 0.17);
        knock(c, t + 0.004, 780, 0.05, 0.1);
        break;
      case 'tick':
        noise(c, t, 0.03, 5200, 0.012, 3.2);
        noise(c, t + 0.006, 0.018, 8200, 0.008, 4);
        break;
      case 'snap':
        // The gap between the two bursts is what reads as a mechanism
        // actuating rather than as one flat tick.
        noise(c, t, 0.04, 4200, 0.008, 4.5);
        noise(c, t + 0.007, 0.03, 9600, 0.006, 5);
        break;
      case 'pop':
        knock(c, t, 240, 0.14, 0.13);
        break;
    }
    return;
  }

  if (kind === 'move') {
    // Travel, not another button press: a tick plus a short fall.
    if (pack === 'mech') {
      noise(c, t, 0.035, 3600, 0.016, 3);
      blip(c, t, 300, 140, 0.035, 0.18);
    } else if (pack === 'airy') {
      noise(c, t, 0.02, 2600, 0.05, 1);
      blip(c, t, 420, 240, 0.045, 0.3);
    } else {
      noise(c, t, 0.03, 4200, 0.014, 2.6);
      blip(c, t, 260, 150, 0.04, 0.22);
    }
    return;
  }

  if (kind === 'open') blip(c, t, 320, 520, 0.045, 0.16);
  if (kind === 'close') blip(c, t, 520, 300, 0.04, 0.14);
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

export function setClick(next: ClickId) {
  click = next;
  save('click', next);
}

export function setPack(next: SoundId) {
  pack = next;
  save('soundpack', next);
  if (bus && ctx) {
    // Ramped, not switched. Setting a gain instantly mid-tone clicks.
    bus.gain.cancelScheduledValues(ctx.currentTime);
    bus.gain.setTargetAtTime(next === 'off' ? 0 : 0.9, ctx.currentTime, 0.02);
  }
}

/** The name toggle is a shorthand for the pack: silent, or back to soft. */
export function readSound(): boolean { return readSoundPack() !== 'off'; }
export function saveSound(on: boolean) { setPack(on ? 'soft' : 'off'); }

/** Sync the module with stored state at startup. */
export function initSound() {
  pack = readSoundPack();
  click = readClick();
  armAudio();
}
