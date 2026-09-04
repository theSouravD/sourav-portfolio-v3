/**
 * NOVA 5×7 — a bitmap font, drawn by hand.
 *
 * This file is the foundation of the whole illusion. A pixel game with a
 * web font in it is a pixel game with a web font in it; every panel, every
 * menu, every label has to be built from the same grid as the character is,
 * or the screen stops being a screen and becomes a div with a picture in it.
 *
 * THE GRID
 * Each glyph is 5 wide and 7 tall, plus one descender row below the baseline
 * for g j p q y — eight rows in total, of which most glyphs use seven. One
 * pixel of tracking gives a 6px advance, so a 240px screen holds exactly 40
 * characters, which is what the panel widths below are designed around.
 *
 * WHY THE GLYPHS ARE WRITTEN AS PICTURES
 * They compile to bitmasks at load, but they are authored as '#' and '.' so
 * that a letter can be read and corrected by eye. A font stored as hex is a
 * font nobody ever fixes.
 *
 * Caps occupy rows 0–6. Lowercase x-height is rows 2–6, ascenders reach row 0,
 * descenders drop to row 7.
 */

const GLYPHS: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#', '.....'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.', '.....'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####', '.....'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.', '.....'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####', '.....'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....', '.....'],
  G: ['.####', '#....', '#....', '#..##', '#...#', '#...#', '.####', '.....'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#', '.....'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####', '.....'],
  J: ['####.', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..', '.....'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#', '.....'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####', '.....'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#', '#...#', '#...#', '.....'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#', '.....'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.', '.....'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....', '.....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#', '.....'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#', '.....'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.', '.....'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..', '.....'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.', '.....'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..', '.....'],
  W: ['#...#', '#...#', '#...#', '#...#', '#.#.#', '##.##', '#...#', '.....'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#', '.....'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..', '.....'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####', '.....'],

  a: ['.....', '.....', '.###.', '....#', '.####', '#...#', '.####', '.....'],
  b: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '####.', '.....'],
  c: ['.....', '.....', '.####', '#....', '#....', '#....', '.####', '.....'],
  d: ['....#', '....#', '.####', '#...#', '#...#', '#...#', '.####', '.....'],
  e: ['.....', '.....', '.###.', '#...#', '#####', '#....', '.###.', '.....'],
  f: ['..##.', '.#...', '.#...', '####.', '.#...', '.#...', '.#...', '.....'],
  g: ['.....', '.....', '.####', '#...#', '#...#', '.####', '....#', '.###.'],
  h: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '#...#', '.....'],
  i: ['..#..', '.....', '.##..', '..#..', '..#..', '..#..', '.###.', '.....'],
  j: ['...#.', '.....', '..##.', '...#.', '...#.', '...#.', '...#.', '.##..'],
  k: ['#....', '#....', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '.....'],
  l: ['.##..', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.', '.....'],
  m: ['.....', '.....', '##.#.', '#.#.#', '#.#.#', '#.#.#', '#.#.#', '.....'],
  n: ['.....', '.....', '####.', '#...#', '#...#', '#...#', '#...#', '.....'],
  o: ['.....', '.....', '.###.', '#...#', '#...#', '#...#', '.###.', '.....'],
  p: ['.....', '.....', '####.', '#...#', '#...#', '####.', '#....', '#....'],
  q: ['.....', '.....', '.####', '#...#', '#...#', '.####', '....#', '....#'],
  r: ['.....', '.....', '#.##.', '##...', '#....', '#....', '#....', '.....'],
  s: ['.....', '.....', '.####', '#....', '.###.', '....#', '####.', '.....'],
  t: ['.#...', '.#...', '####.', '.#...', '.#...', '.#..#', '..##.', '.....'],
  u: ['.....', '.....', '#...#', '#...#', '#...#', '#...#', '.####', '.....'],
  v: ['.....', '.....', '#...#', '#...#', '#...#', '.#.#.', '..#..', '.....'],
  w: ['.....', '.....', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.', '.....'],
  x: ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '.....'],
  y: ['.....', '.....', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
  z: ['.....', '.....', '#####', '...#.', '..#..', '.#...', '#####', '.....'],

  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.', '.....'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.', '.....'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####', '.....'],
  '3': ['####.', '....#', '....#', '.###.', '....#', '....#', '####.', '.....'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.', '.....'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.', '.....'],
  '6': ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.', '.....'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...', '.....'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.', '.....'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..', '.....'],

  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..', '.....'],
  ',': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..', '.#...'],
  ':': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.....', '.....'],
  ';': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.#...', '.....'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..', '.....'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..', '.....'],
  "'": ['..#..', '..#..', '.....', '.....', '.....', '.....', '.....', '.....'],
  '"': ['.#.#.', '.#.#.', '.....', '.....', '.....', '.....', '.....', '.....'],
  '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....', '.....'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....', '.....'],
  '/': ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....', '.....'],
  '(': ['..##.', '.#...', '#....', '#....', '#....', '.#...', '..##.', '.....'],
  ')': ['.##..', '...#.', '....#', '....#', '....#', '...#.', '.##..', '.....'],
  '·': ['.....', '.....', '.....', '.##..', '.##..', '.....', '.....', '.....'],
  '×': ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '.....'],
  '@': ['.###.', '#...#', '#.###', '#.#.#', '#.###', '#....', '.###.', '.....'],
  '#': ['.#.#.', '#####', '.#.#.', '.#.#.', '#####', '.#.#.', '.....', '.....'],
  '&': ['.##..', '#..#.', '#.#..', '.#...', '#.#.#', '#..#.', '.##.#', '.....'],
  '→': ['.....', '..#..', '...#.', '#####', '...#.', '..#..', '.....', '.....'],
  '↗': ['.....', '.####', '...##', '..#.#', '.#..#', '#....', '.....', '.....'],
  '▶': ['#....', '##...', '###..', '####.', '###..', '##...', '#....', '.....'],
  '▼': ['.....', '.....', '#####', '.###.', '.###.', '..#..', '.....', '.....'],
  '◆': ['..#..', '.###.', '#####', '#####', '.###.', '..#..', '.....', '.....'],
  '★': ['..#..', '..#..', '#####', '.###.', '.#.#.', '#...#', '.....', '.....'],
};

/** A dot the font can't render is better than a hole with no width. */
const FALLBACK = ['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####', '.....'];

export const GW = 5;          // glyph width
export const GH = 8;          // glyph box, including the descender row
export const ADV = 6;         // advance: glyph plus one pixel of tracking
export const LINE = 9;        // line height, one pixel of leading

/*
 * Compiled once at module load into row bitmasks. Reading a string per pixel
 * per frame would be forty thousand string lookups a second for a screen of
 * text; five numbers per glyph is a lookup and a shift.
 */
type Compiled = number[];
const TABLE: Record<string, Compiled> = {};
for (const [ch, rows] of Object.entries(GLYPHS)) {
  TABLE[ch] = rows.map((r) => {
    let bits = 0;
    for (let i = 0; i < GW; i += 1) if (r[i] === '#') bits |= 1 << (GW - 1 - i);
    return bits;
  });
}
const FALLBACK_C = FALLBACK.map((r) => {
  let bits = 0;
  for (let i = 0; i < GW; i += 1) if (r[i] === '#') bits |= 1 << (GW - 1 - i);
  return bits;
});

/** Width of a string in pixels, without the trailing tracking pixel. */
export function textWidth(s: string) {
  return s.length ? s.length * ADV - 1 : 0;
}

/**
 * Draw text at (x, y), where y is the top of the glyph box.
 *
 * `max` truncates with an ellipsis rather than overflowing the panel — a row
 * that runs off the edge of a 240px screen looks like a rendering fault, and
 * on this screen almost everything is a candidate to run off the edge.
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  colour: string,
  max?: number
) {
  let text = normalise(s);
  if (max !== undefined && textWidth(text) > max) {
    const fits = Math.max(0, Math.floor((max + 1) / ADV) - 1);
    text = `${text.slice(0, fits)}.`;
  }
  ctx.fillStyle = colour;
  for (let i = 0; i < text.length; i += 1) {
    const g = TABLE[text[i]] ?? TABLE[text[i].toUpperCase()] ?? FALLBACK_C;
    const gx = x + i * ADV;
    for (let r = 0; r < GH; r += 1) {
      const bits = g[r];
      if (!bits) continue;
      for (let c = 0; c < GW; c += 1) {
        if (bits & (1 << (GW - 1 - c))) ctx.fillRect(gx + c, y + r, 1, 1);
      }
    }
  }
}

/**
 * Greedy word wrap, in characters rather than pixels.
 *
 * The font is fixed width, so a character count is exact and there is no
 * measuring pass — which is the one real advantage a bitmap font has over
 * everything else on this page.
 */
export function wrap(s: string, cols: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of normalise(s).split(/\s+/)) {
    if (!word) continue;
    if (!line.length) { line = word; continue; }
    if (line.length + 1 + word.length <= cols) line += ` ${word}`;
    else { out.push(line); line = word; }
  }
  if (line.length) out.push(line);
  return out;
}

/* ==================================================================
 * NOVA 3×5 — the micro font.
 *
 * The 5×7 above is a reading face: panels, menus, anything with
 * sentences in it. It is far too big for the level, where a label sits
 * under a 16-pixel block and a HUD sits in the corner — at 5×7 the word
 * "SYSTEMS" is wider than the block it names.
 *
 * So there are two faces, and the split is the same one an arcade board
 * made: a display face for text you read, and a micro face for text you
 * glance at. Caps and digits only, because at three pixels wide a
 * lowercase 'e' is a smudge.
 * ================================================================== */
const MICRO: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..#', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#.#', '###', '###', '#.#', '#.#'],
  N: ['#.#', '##.', '###', '.##', '#.#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  Q: ['.#.', '#.#', '#.#', '##.', '.##'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#.#', '#.#', '###', '###', '#.#'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  Z: ['###', '..#', '.#.', '#..', '###'],
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['##.', '..#', '.#.', '#..', '###'],
  '3': ['##.', '..#', '.#.', '..#', '##.'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '5': ['###', '#..', '##.', '..#', '##.'],
  '6': ['.##', '#..', '###', '#.#', '###'],
  '7': ['###', '..#', '.#.', '.#.', '.#.'],
  '8': ['###', '#.#', '###', '#.#', '###'],
  '9': ['###', '#.#', '###', '..#', '##.'],
  ' ': ['...', '...', '...', '...', '...'],
  '.': ['...', '...', '...', '...', '.#.'],
  ',': ['...', '...', '...', '.#.', '#..'],
  '-': ['...', '...', '###', '...', '...'],
  '+': ['...', '.#.', '###', '.#.', '...'],
  ':': ['...', '.#.', '...', '.#.', '...'],
  '/': ['..#', '..#', '.#.', '#..', '#..'],
  '!': ['.#.', '.#.', '.#.', '...', '.#.'],
  '?': ['##.', '..#', '.#.', '...', '.#.'],
  '(': ['..#', '.#.', '.#.', '.#.', '..#'],
  ')': ['#..', '.#.', '.#.', '.#.', '#..'],
  '&': ['.#.', '#.#', '.#.', '#.#', '.##'],
  '@': ['###', '#.#', '###', '#..', '.##'],
  '·': ['...', '...', '.#.', '...', '...'],
  '×': ['...', '#.#', '.#.', '#.#', '...'],
  '→': ['...', '..#', '###', '..#', '...'],
  '◆': ['.#.', '###', '###', '###', '.#.'],
  '★': ['#.#', '###', '.#.', '###', '#.#'],
  '▼': ['###', '###', '.#.', '...', '...'],
  '▶': ['#..', '##.', '###', '##.', '#..'],
};

export const MW = 3;
export const MH = 5;
export const MADV = 4;     // three pixels plus one of tracking

const MTABLE: Record<string, number[]> = {};
for (const [ch, rows] of Object.entries(MICRO)) {
  MTABLE[ch] = rows.map((r) => {
    let bits = 0;
    for (let i = 0; i < MW; i += 1) if (r[i] === '#') bits |= 1 << (MW - 1 - i);
    return bits;
  });
}

export function microWidth(s: string) {
  return s.length ? s.length * MADV - 1 : 0;
}

/**
 * Draw micro text.
 *
 * Uppercases everything, because the face has no lowercase — and silently,
 * so that calling code can pass a section label straight through without
 * every call site remembering to shout.
 */
export function drawMicro(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  colour: string
) {
  const text = normalise(s).toUpperCase();
  ctx.fillStyle = colour;
  for (let i = 0; i < text.length; i += 1) {
    const g = MTABLE[text[i]];
    if (!g) continue;
    const gx = x + i * MADV;
    for (let r = 0; r < MH; r += 1) {
      const bits = g[r];
      if (!bits) continue;
      for (let c = 0; c < MW; c += 1) {
        if (bits & (1 << (MW - 1 - c))) ctx.fillRect(gx + c, y + r, 1, 1);
      }
    }
  }
}

/**
 * Fold the typographic characters that arrive from the content files into
 * ones the fonts actually have.
 *
 * `content.ts` is written with real en-dashes and curly quotes, as prose
 * should be. Without this, "2019–2026" renders with a fallback box in the
 * middle of it, which is exactly the kind of small wrongness that tells a
 * visitor the screen is fake.
 */
export function normalise(s: string) {
  return s
    .replace(/[‒–—―]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/ /g, ' ');
}
