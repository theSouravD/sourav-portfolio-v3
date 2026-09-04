/**
 * The palette — sixteen colours, and no others anywhere.
 *
 * A real console had a fixed palette and every artist worked inside it, which
 * is most of why 8-bit art from one machine looks like a family. That is the
 * consistency being asked for here, so it is enforced the same way: this file
 * is the only place a colour is written down. The renderer imports from it,
 * the UI imports from it, and the shell's CSS variables are generated from it,
 * so the plastic of the console and the sky inside the screen are literally
 * the same swatches.
 *
 * The ramp is built in three families plus two accents:
 *   0–4   the dark structure — voids, stone, shadow
 *   5–8   the sky, dusk through to the last light
 *   9–11  the metals — gold, and the two coral tones
 *   12–14 the cools — pipe green through to teal
 *   15    bone, the only near-white, used for type and highlights
 */
export const PAL = [
  '#0d0b14', //  0 void        — the deepest shadow, and the LCD when it is off
  '#1b1426', //  1 night       — panel fill
  '#2e1f3d', //  2 stone dark  — ground body
  '#463059', //  3 stone       — ground lip, dpad
  '#6b4a7d', //  4 stone light — ledges, hills
  '#8f5f86', //  5 dusk high   — top of the sky
  '#b4535c', //  6 dusk mid
  '#d9705a', //  7 dusk low
  '#f0a05a', //  8 horizon     — the last band before the ground
  '#ffd479', //  9 gold        — blocks, coins, the readout
  '#e07a54', // 10 coral       — the character, the flag, pressed buttons
  '#a84a3c', // 11 coral dark  — coral's shadow side
  '#2b6b63', // 12 pipe dark
  '#43a08f', // 13 pipe        — the resume pipe, the B button
  '#7fdcc8', // 14 teal        — highlights, the cap, live values
  '#fdf3e3', // 15 bone        — type, and the only near-white on the machine
] as const;

export type PalIndex = 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15;
export const C = (i: PalIndex) => PAL[i];

/** Named roles, so the drawing code reads as intent rather than as indices. */
export const INK = {
  void: C(0),
  panel: C(1),
  panelEdge: C(4),
  ground: C(2),
  groundLip: C(3),
  ledge: C(4),
  hill: C(3),
  sky: [C(5), C(6), C(7), C(8)] as const,
  block: C(9),
  blockLip: C(15),
  blockUsed: C(3),
  blockUsedLip: C(4),
  coin: C(9),
  coinLip: C(15),
  body: C(10),
  bodyDark: C(11),
  skin: C(15),
  cap: C(14),
  pipe: C(13),
  pipeDark: C(12),
  flag: C(10),
  text: C(15),
  textDim: C(4),
  accent: C(9),
  select: C(10),
};

/**
 * The shell's CSS variables, generated from the same array.
 *
 * Injected at runtime rather than duplicated into the stylesheet, because two
 * copies of a palette is one copy too many — the whole point is that there is
 * a single place a colour can be changed.
 */
export function installPaletteVars() {
  const root = document.documentElement;
  PAL.forEach((hex, i) => root.style.setProperty(`--pal-${i}`, hex));
}
