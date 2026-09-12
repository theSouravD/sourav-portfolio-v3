import type { Setup } from './scenes';
import { PAPER } from './scenes';

/**
 * THE THEME CENTRE'S MODEL.
 *
 * Everything the site lets you change lives here as data — grounds, texture,
 * intensity, paper whiteness, sound packs, cursors — with one storage helper
 * doing the reading and writing for all of them. Adding a new option is a line
 * in a list, not a new branch in the picker, which is what stops a settings
 * panel rotting as it grows.
 *
 * This is a control for DECIDING. Try them on the real page with the real type
 * over them, keep one, and the rest can be deleted along with the panel.
 */

/* ================================================================
 * GROUNDS
 * ================================================================ */

export type BackdropId = 'wash' | 'aurora' | 'contour' | 'mesh' | 'paper';

export interface BackdropDef {
  id: BackdropId;
  label: string;
  note: string;
  /** No WebGL context at all — nothing to compile, nothing running on a battery. */
  cheap?: boolean;
}

export const BACKDROPS: BackdropDef[] = [
  { id: 'wash',     label: 'Wash',     note: 'Soft aurora across the paper' },
  { id: 'aurora',   label: 'Ribbon',   note: 'One band of colour, drifting' },
  { id: 'contour',  label: 'Contour',  note: 'Topographic lines, morphing' },
  { id: 'mesh',     label: 'Mesh',     note: 'Soft colour blooms, no shader', cheap: true },
  { id: 'paper',    label: 'Paper',    note: 'Nothing at all. Plain stock', cheap: true },
];

/* ---- texture ---- */

export type TextureId = 'none' | 'fine' | 'full';

export const TEXTURES: { id: TextureId; label: string; note: string }[] = [
  { id: 'none', label: 'Clean', note: 'No grain' },
  { id: 'fine', label: 'Grain', note: 'Fine film grain' },
  { id: 'full', label: 'Stock', note: 'Grain plus a coarse mottle' },
];

/* ================================================================
 * SOUND — one switch, two cues
 *
 * The packs and the click list are gone. Five ambient characters times five
 * clicks is twenty-five combinations to audition, which is a lot of apparatus
 * around a decision that turned out to be simple: the site makes sound twice.
 * The title sequence on arrival, and a click when you press something.
 *
 * Everything else went because it was the wrong kind of noise. Hover fired
 * ten times as often as anything else and had nothing to say — it responded
 * to the pointer passing over a thing, which is not an event. The room-change
 * cue doubled up with the click that caused it.
 *
 * So the control is a switch. A settings panel offering five flavours of
 * something a visitor will hear twice is a panel making its own options feel
 * more important than they are.
 * ================================================================ */

export const SOUND = { def: true };

/**
 * THE CLICK, AS A CHOICE.
 *
 * The one cue that fires on demand is the one worth having options for — it
 * is the site's response to a press, it happens constantly, and it is the
 * only sound most visitors will consciously register. (The hover and
 * room-change cues stayed deleted: those fired whether or not anything
 * happened, which is what made them tiring, and no amount of choosing
 * between flavours fixes a cue that should not be firing.)
 *
 * All six are the same mechanism at different settings — a very short
 * excitation through a resonant filter — because that is what a physical
 * click is. They differ in where the resonance sits, how sharp it is, and
 * how fast it dies.
 */
export type ClickId = 'hollow' | 'thock' | 'tick' | 'snap' | 'glass' | 'pop' | 'none';

export const CLICKS: { id: ClickId; label: string; note: string }[] = [
  { id: 'hollow', label: 'Hollow', note: 'A soft woody knock' },
  { id: 'thock',  label: 'Thock',  note: 'Deep and muted, like a dampened key' },
  { id: 'tick',   label: 'Tick',   note: 'Dry and high, almost no body' },
  { id: 'snap',   label: 'Snap',   note: 'Sharp, with a bright tail' },
  { id: 'glass',  label: 'Glass',  note: 'A high ping, long ring' },
  { id: 'pop',    label: 'Pop',    note: 'Low and round, no attack' },
  { id: 'none',   label: 'Silent', note: 'No sound on press' },
];

/* ================================================================
 * CURSOR
 * ================================================================ */

/**
 * FOUR, DOWN FROM ELEVEN.
 *
 * The five hand-written ones went first — Dot, Ring, Trail, Blade and Halo
 * were all a single idea, a small shape chasing the pointer, and that idea
 * has a ceiling: the real pointer is drawn by the compositor and is never
 * late, so anything drawn in JavaScript is permanently a frame behind it.
 *
 * Blob and Lines have now gone too, for a different reason. Both worked.
 * Neither had anything to do with this site: a gooey ball trailing the hand
 * and a field of rules swivelling to face it are effects that announce
 * themselves, and on a portfolio whose whole argument is restraint they read
 * as a tour of a component library rather than as a decision.
 *
 * What is left responds to the page instead of performing over it. Crosshair
 * and Target register what you are pointing AT. Splash stays because it is
 * genuinely beautiful and honestly labelled — a live fluid simulation, and by
 * some distance the heaviest thing on the site.
 */
export type CursorId = 'system' | 'crosshair' | 'target' | 'splash';

export const CURSORS: { id: CursorId; label: string; note: string }[] = [
  { id: 'system',    label: 'System',    note: "The visitor's own pointer" },
  { id: 'crosshair', label: 'Crosshair', note: 'Rules across the frame, with drift' },
  { id: 'target',    label: 'Target',    note: 'Four corners that frame a target' },
  { id: 'splash',    label: 'Splash',    note: 'Fluid that parts as you move. Heavy' },
];

/* ================================================================
 * THE TWO SLIDERS
 *
 * INTENSITY scales the ground and NOTHING else. It is a separate control from
 * paper for a reason: turning the colour down is not the same request as
 * making the page whiter, and one slider doing both would make each
 * unreachable. 0 leaves the ground bare and it goes to 140 because on a bright
 * monitor a timid ground disappears entirely.
 *
 * PAPER moves the ground between warm stock and near-white. It is the closest
 * thing to a "whiteness" control and it deliberately does not touch the ink,
 * so contrast only ever improves as it goes up.
 *
 * THE DEFAULTS ARE THE SETTLED ONES, NOT THE TUNED ONES.
 * These were 100 and 0 — the values the shaders were tuned at, in isolation,
 * against no type. Sourav auditioned the panel on the real pages and landed on
 * 25 and 50: a much quieter ground on much whiter stock. That is the answer to
 * the question the panel was built to ask, so it is now what a first-time
 * visitor sees. A settings panel whose defaults ignore its own findings is
 * just a toy.
 * ================================================================ */

export const INTENSITY = { min: 0, max: 140, step: 5, def: 25 };
export const PAPERNESS = { min: 0, max: 100, step: 5, def: 50 };

/** Blend the warm stock toward white by `t` (0..1). */
export function paperAt(t: number) {
  const from = [0xf7, 0xf3, 0xec];
  const to = [0xff, 0xff, 0xff];
  const mix = from.map((c, i) => Math.round(c + (to[i] - c) * t));
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
}

/* ================================================================
 * GROUND PROPS
 *
 * Every one of these shipped too strong the first time. A shader's defaults
 * are tuned to look good in isolation, on a demo page with nothing on it; put
 * body copy over the same settings and the ground stops being a ground. The
 * rule for all of them is that the background has to LOSE to the type — if you
 * notice it before you notice the words, the number is too high.
 *
 * `k` is the intensity multiplier. It is applied to whichever parameter
 * actually governs strength for that shader rather than to a blanket opacity:
 * fading a fully saturated field just makes it look washed out, where turning
 * its amplitude down makes it quieter.
 * ================================================================ */

export function washProps(s: Setup, k: number) {
  return {
    lightMode: true,
    color1: s.wash,
    color2: s.fill,
    brightness: s.brightness * k,
    speed: s.speed,
    scale: 1.6,
    bandHeight: s.band,
    bandSpread: s.spread,
    noiseFrequency: 2.2,
    noiseAmplitude: 0.9,
    colorSpeed: 0.2,
    enableMouseInteraction: true,
    mouseInfluence: 0.1,
  };
}

export function auroraProps(s: Setup, k: number) {
  return {
    lightMode: true,
    // Paper between the two gels is what keeps this a tint rather than a
    // flood — the middle stop used to be another colour.
    colorStops: [s.wash, PAPER, s.fill],
    amplitude: 0.55 * k,
    blend: 0.92,
    speed: 0.35,
  };
}

export function contourProps(s: Setup, k: number) {
  return {
    lightMode: true,
    lowColor: PAPER,
    midColor: s.wash,
    highColor: s.fill,
    speed: 0.14,
    morphAmount: 0.45,
    morphSpeed: 0.14,
    // Few, thin lines far apart. Nine thick bands across a page of body copy
    // is a pattern the eye keeps trying to read.
    bands: 5,
    thickness: 0.22,
    scale: 2.4,
    glow: 0,
    contrast: 0.55,
    brightness: 1,
    fillBands: false,
    opacity: 0.2 * k,
    grain: false,
    mouseInteraction: true,
    mouseRadius: 0.25,
    mouseStrength: 0.35,
  };
}

/* ================================================================
 * STORAGE
 *
 * Reading has to survive storage being unavailable: a private window, cleared
 * site data, or a browser set to block it will THROW on access rather than
 * return null, and an uncaught throw here would take the page down before
 * anything rendered.
 * ================================================================ */

const KEY = 'nova3.';

function read<T extends string>(name: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = localStorage.getItem(KEY + name) as T | null;
    return v && allowed.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function readNum(name: string, def: number, min: number, max: number): number {
  try {
    const raw = localStorage.getItem(KEY + name);
    /*
     * The null check has to come BEFORE the Number(): `Number(null)` is 0, and
     * 0 is inside every range here, so a never-set value passed validation and
     * came back as zero. Intensity therefore started at 0% on a fresh browser
     * and the background looked broken until you touched the slider.
     */
    if (raw === null || raw === '') return def;
    const v = Number(raw);
    return Number.isFinite(v) && v >= min && v <= max ? v : def;
  } catch {
    return def;
  }
}

export function save(name: string, value: string | number) {
  try { localStorage.setItem(KEY + name, String(value)); } catch { /* never load-bearing */ }
}

export const readBackdrop = () =>
  read('backdrop', BACKDROPS.map((b) => b.id), 'wash');
export const readTexture = () =>
  read('texture', TEXTURES.map((t) => t.id), 'fine');
export const readClick = () =>
  read('click', CLICKS.map((c) => c.id), 'hollow');

export const readSound = (): boolean => {
  try {
    const v = localStorage.getItem(KEY + 'sound');
    return v === null ? SOUND.def : v !== 'off';
  } catch {
    return SOUND.def;
  }
};
export const readCursor = () =>
  read('cursor', CURSORS.map((c) => c.id), 'system');
export const readIntensity = () =>
  readNum('intensity', INTENSITY.def, INTENSITY.min, INTENSITY.max);
export const readPaperness = () =>
  readNum('paperness', PAPERNESS.def, PAPERNESS.min, PAPERNESS.max);
