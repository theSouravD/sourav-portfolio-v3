import type { Setup } from './scenes';
import { PAPER } from './scenes';

/**
 * THE BACKGROUND OPTIONS.
 *
 * Five grounds, all of them on the bright side, all of them taking the room's
 * gel so switching background never breaks the per-room grade. The choice is
 * remembered, so this is a control for DECIDING — try them, keep one.
 *
 * Every shader here is run in its light mode. That is not the same as feeding
 * it pale colours: an additive shader given pale colours still adds light to a
 * white page and the result is grey haze. Light mode makes them subtractive,
 * pulling white down toward the gel the way ink sits on paper.
 *
 * "Paper" earns its place as more than a fallback. It is the only option with
 * no WebGL context at all — no shader compile on load, nothing running on a
 * battery — and on a text-heavy room like Career it is the most legible of
 * the five by a wide margin.
 */
export type BackdropId = 'wash' | 'aurora' | 'contour' | 'gradient' | 'paper';

export interface BackdropDef {
  id: BackdropId;
  label: string;
  /** One line, shown under the name in the picker. */
  note: string;
}

export const BACKDROPS: BackdropDef[] = [
  { id: 'wash',     label: 'Wash',     note: 'Soft aurora across the paper' },
  { id: 'aurora',   label: 'Ribbon',   note: 'A single band of colour, drifting' },
  { id: 'contour',  label: 'Contour',  note: 'Topographic lines, slowly morphing' },
  { id: 'gradient', label: 'Gradient', note: 'Warped colour field, still' },
  { id: 'paper',    label: 'Paper',    note: 'No shader at all — plain stock' },
];

/** How much texture sits over the ground. */
export type TextureId = 'none' | 'fine' | 'full';

export const TEXTURES: { id: TextureId; label: string; note: string }[] = [
  { id: 'none', label: 'Clean', note: 'No grain' },
  { id: 'fine', label: 'Grain', note: 'Fine film grain only' },
  { id: 'full', label: 'Stock', note: 'Grain plus a coarse mottle' },
];

/* ------------------------------------------------------------------ */

export function washProps(s: Setup) {
  return {
    lightMode: true,
    color1: s.wash,
    color2: s.fill,
    brightness: s.brightness,
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

/*
 * ALL THREE OF THESE SHIPPED TOO STRONG THE FIRST TIME.
 *
 * A shader's defaults are tuned to look good in isolation, on a demo page
 * with nothing on it. Put body copy over the same settings and the ground
 * stops being a ground: at full strength Ribbon flooded half the frame with
 * saturated colour and Contour drew hard bands straight through the
 * headline. The rule for every option here is that it has to lose to the
 * type — if you notice the background before you notice the words, the
 * number is too high.
 *
 * So each one is pulled back on three axes rather than one: how much colour
 * (amplitude / opacity), how saturated that colour is, and how much of the
 * frame it covers. Dropping only opacity leaves a wash that is still fully
 * saturated and merely faint, which reads as washed out rather than quiet.
 */
export function auroraProps(s: Setup) {
  return {
    lightMode: true,
    // The paper between the two gels is what keeps this a tint rather than a
    // flood — the middle stop used to be another colour.
    colorStops: [s.wash, PAPER, s.fill],
    amplitude: 0.55,
    blend: 0.92,
    speed: 0.35,
  };
}

export function contourProps(s: Setup) {
  return {
    lightMode: true,
    lowColor: PAPER,
    midColor: s.wash,
    highColor: s.fill,
    speed: 0.14,
    morphAmount: 0.45,
    morphSpeed: 0.14,
    // Fewer, thinner lines further apart. Nine thick bands across a page of
    // body copy is a pattern the eye keeps trying to read.
    bands: 5,
    thickness: 0.22,
    scale: 2.4,
    glow: 0,
    contrast: 0.55,
    brightness: 1,
    fillBands: false,
    opacity: 0.2,
    grain: false,
    mouseInteraction: true,
    mouseRadius: 0.25,
    mouseStrength: 0.35,
  };
}

export function gradientProps(s: Setup) {
  return {
    color1: PAPER,
    color2: s.wash,
    color3: s.fill,
    timeSpeed: 0.1,
    // Weighted hard toward the paper. At 0.72 the gels won and the whole page
    // went green.
    colorBalance: 0.9,
    warpStrength: 0.45,
    warpFrequency: 1,
    warpSpeed: 0.12,
    warpAmplitude: 0.45,
    blendSoftness: 0.95,
    noiseScale: 1.1,
    // The gradient carries its own grain, so the page's texture layers would
    // double up on it. Its own is the better one here — it is applied before
    // the colour is flattened rather than multiplied over the top.
    grainAmount: 0.05,
    grainScale: 1.4,
    grainAnimated: false,
    contrast: 0.7,
    gamma: 1.12,
    saturation: 0.34,
    zoom: 1.3,
  };
}

/* ------------------------------------------------------------------ */

const KEY = 'nova3.backdrop';
const TKEY = 'nova3.texture';

/**
 * Reading a stored preference has to survive the storage being unavailable —
 * a private window, cleared site data, or a browser set to block it will
 * THROW on access rather than return null, and an uncaught throw here would
 * take the whole page down before anything rendered.
 */
export function readBackdrop(): BackdropId {
  try {
    const v = localStorage.getItem(KEY) as BackdropId | null;
    return BACKDROPS.some((b) => b.id === v) ? (v as BackdropId) : 'wash';
  } catch {
    return 'wash';
  }
}

export function readTexture(): TextureId {
  try {
    const v = localStorage.getItem(TKEY) as TextureId | null;
    return TEXTURES.some((t) => t.id === v) ? (v as TextureId) : 'fine';
  } catch {
    return 'fine';
  }
}

export function saveBackdrop(id: BackdropId) {
  try { localStorage.setItem(KEY, id); } catch { /* not worth a broken page */ }
}

export function saveTexture(id: TextureId) {
  try { localStorage.setItem(TKEY, id); } catch { /* not worth a broken page */ }
}
