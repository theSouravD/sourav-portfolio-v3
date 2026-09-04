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

export type BackdropId =
  | 'wash' | 'aurora' | 'contour' | 'gradient'
  | 'threads' | 'motes' | 'mesh' | 'dots' | 'paper';

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
  { id: 'gradient', label: 'Gradient', note: 'Warped colour field, near-still' },
  { id: 'threads',  label: 'Threads',  note: 'A field of drawn lines' },
  { id: 'motes',    label: 'Motes',    note: 'Drifting particles, very quiet' },
  { id: 'mesh',     label: 'Mesh',     note: 'Soft colour blooms — no shader', cheap: true },
  { id: 'dots',     label: 'Dots',     note: 'A printed dot field — no shader', cheap: true },
  { id: 'paper',    label: 'Paper',    note: 'Nothing at all — plain stock', cheap: true },
];

/* ---- texture ---- */

export type TextureId = 'none' | 'fine' | 'full';

export const TEXTURES: { id: TextureId; label: string; note: string }[] = [
  { id: 'none', label: 'Clean', note: 'No grain' },
  { id: 'fine', label: 'Grain', note: 'Fine film grain' },
  { id: 'full', label: 'Stock', note: 'Grain plus a coarse mottle' },
];

/* ================================================================
 * SOUND
 * ================================================================ */

export type SoundId = 'off' | 'soft' | 'mech' | 'airy' | 'sparse';

export const SOUNDS: { id: SoundId; label: string; note: string }[] = [
  { id: 'off',    label: 'Silent', note: 'No sound at all' },
  { id: 'soft',   label: 'Soft',   note: 'Light ticks, barely there' },
  { id: 'mech',   label: 'Mech',   note: 'Crisper, more mechanical' },
  { id: 'airy',   label: 'Airy',   note: 'Breathy, pitched a little' },
  { id: 'sparse', label: 'Sparse', note: 'Clicks and moves only — no hover' },
];

/* ================================================================
 * CURSOR
 * ================================================================ */

export type CursorId = 'system' | 'dot' | 'ring' | 'target';

export const CURSORS: { id: CursorId; label: string; note: string }[] = [
  { id: 'system', label: 'System', note: "The visitor's own cursor" },
  { id: 'dot',    label: 'Dot',    note: 'A small accent dot that trails' },
  { id: 'ring',   label: 'Ring',   note: 'An outline that swells on targets' },
  { id: 'target', label: 'Target', note: 'Four corners that frame what you hover' },
];

/* ================================================================
 * THE TWO SLIDERS
 *
 * INTENSITY scales the ground and NOTHING else. It is a separate control from
 * paper for a reason: turning the colour down is not the same request as
 * making the page whiter, and one slider doing both would make each
 * unreachable. 0 leaves the ground bare, 100 is the tuned value, and it goes
 * to 140 because on a bright monitor the tuned value can read as too timid.
 *
 * PAPER moves the ground between warm stock and near-white. It is the closest
 * thing to a "whiteness" control and it deliberately does not touch the ink,
 * so contrast only ever improves as it goes up.
 * ================================================================ */

export const INTENSITY = { min: 0, max: 140, step: 5, def: 100 };
export const PAPERNESS = { min: 0, max: 100, step: 5, def: 0 };

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

export function gradientProps(s: Setup, k: number) {
  return {
    color1: PAPER,
    color2: s.wash,
    color3: s.fill,
    timeSpeed: 0.1,
    // Weighted hard toward the paper — at 0.72 the gels won and the whole
    // page went green. Intensity moves this balance rather than an opacity,
    // so turning it up brings the gels forward instead of just darkening.
    colorBalance: 1 - 0.1 * k,
    warpStrength: 0.45,
    warpFrequency: 1,
    warpSpeed: 0.12,
    warpAmplitude: 0.45,
    blendSoftness: 0.95,
    noiseScale: 1.1,
    // Its own grain is better than the page's here: applied before the colour
    // is flattened rather than multiplied over the top.
    grainAmount: 0.05,
    grainScale: 1.4,
    grainAnimated: false,
    contrast: 0.7,
    gamma: 1.12,
    saturation: 0.34 * k,
    zoom: 1.3,
  };
}

/** Threads takes a colour as 0..1 RGB rather than a hex string. */
export function threadsProps(s: Setup, k: number) {
  const h = s.accent.replace('#', '');
  const n = parseInt(h, 16);
  const rgb: [number, number, number] = [
    ((n >> 16) & 255) / 255,
    ((n >> 8) & 255) / 255,
    (n & 255) / 255,
  ];
  return {
    color: rgb,
    amplitude: 0.9 * k,
    distance: 0.35,
    enableMouseInteraction: true,
  };
}

export function motesProps(s: Setup, k: number) {
  return {
    particleColors: [s.wash, s.fill, s.accent],
    particleCount: Math.round(140 * Math.min(k, 1.2)),
    particleSpread: 12,
    speed: 0.05,
    particleBaseSize: 60,
    sizeRandomness: 0.8,
    alphaParticles: true,
    moveParticlesOnHover: true,
    particleHoverFactor: 0.4,
    cameraDistance: 22,
    disableRotation: false,
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
export const readSoundPack = () =>
  read('soundpack', SOUNDS.map((s) => s.id), 'soft');
export const readCursor = () =>
  read('cursor', CURSORS.map((c) => c.id), 'system');
export const readIntensity = () =>
  readNum('intensity', INTENSITY.def, INTENSITY.min, INTENSITY.max);
export const readPaperness = () =>
  readNum('paperness', PAPERNESS.def, PAPERNESS.min, PAPERNESS.max);
