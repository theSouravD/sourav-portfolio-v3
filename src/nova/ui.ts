import { INK, C } from './palette';
import { drawText, wrap, ADV, LINE, drawMicro, microWidth, MH } from './font';
import { W, H } from './level';

/**
 * The in-game UI.
 *
 * Every panel, menu and label on this screen is drawn here, on the same canvas
 * and the same pixel grid as the character. There is no DOM inside the LCD —
 * an HTML card floating over a pixel game is the single fastest way to tell a
 * visitor that the game is a decoration, and once they know that they stop
 * playing with it.
 *
 * Everything below is built from three primitives: a nine-slice frame, an
 * ordered dither, and a typewriter. Between them they make a console UI.
 */

/* ------------------------------------------------------------------ *
 * ORDERED DITHER
 *
 * The one technique that separates pixel art from a gradient with big pixels.
 * A 4×4 Bayer matrix decides, per pixel, which of two palette colours to lay
 * down — so a sky ramps between four fixed colours instead of through 200
 * unnamed ones, and the result belongs to the palette rather than escaping it.
 * ------------------------------------------------------------------ */
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export function ditherBand(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, x1: number, y1: number,
  from: string, to: string
) {
  const h = y1 - y0;
  for (let y = y0; y < y1; y += 1) {
    // 0 at the top of the band, 16 at the bottom
    const t = ((y - y0) / h) * 16;
    for (let x = x0; x < x1; x += 1) {
      ctx.fillStyle = t > BAYER[y & 3][x & 3] ? to : from;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

/* ------------------------------------------------------------------ *
 * NINE-SLICE FRAME
 *
 * A textbox with a drawn border, the way a console draws one: a two-pixel
 * edge, mitred corners, and a one-pixel inner highlight along the top so the
 * box reads as raised rather than as a rectangle with a stroke.
 * ------------------------------------------------------------------ */
export function frame(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  fill = INK.panel, edge = INK.panelEdge
) {
  ctx.fillStyle = fill;
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

  ctx.fillStyle = edge;
  ctx.fillRect(x + 2, y, w - 4, 1);            // top
  ctx.fillRect(x + 2, y + h - 1, w - 4, 1);    // bottom
  ctx.fillRect(x, y + 2, 1, h - 4);            // left
  ctx.fillRect(x + w - 1, y + 2, 1, h - 4);    // right
  // mitres — two pixels stepped in, not a rounded corner
  ctx.fillRect(x + 1, y + 1, 1, 1);
  ctx.fillRect(x + w - 2, y + 1, 1, 1);
  ctx.fillRect(x + 1, y + h - 2, 1, 1);
  ctx.fillRect(x + w - 2, y + h - 2, 1, 1);

  // the raised highlight: one pixel of bone inside the top edge
  ctx.fillStyle = C(3);
  ctx.fillRect(x + 2, y + 1, w - 4, 1);
}

/** A hairline rule inside a panel — dotted, so it reads as drawn not stroked. */
export function rule(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  ctx.fillStyle = INK.textDim;
  for (let i = 0; i < w; i += 2) ctx.fillRect(x + i, y, 1, 1);
}

/* ------------------------------------------------------------------ *
 * THE SECTION PANEL
 *
 * Title, meta, a body that types itself in, and a list you move a selector
 * through with the d-pad. The typewriter is not nostalgia: it paces the
 * reading, and it gives the A button something to do on every screen — press
 * it once to finish the text, again to act on the selection.
 * ------------------------------------------------------------------ */
export interface PanelView {
  title: string;
  meta: string;
  body: string;
  rows: { left: string; right: string; href?: string }[];
  /** Characters of body revealed so far. */
  typed: number;
  /** Index of the highlighted row. */
  sel: number;
  /** First visible row, so long lists scroll rather than overflow. */
  top: number;
}

const PAD = 7;
const COLS = Math.floor((W - PAD * 2 - 2) / ADV);   // 38 characters
export const ROWS_VISIBLE = 4;

export function panelBodyLines(body: string) {
  return wrap(body, COLS);
}

export function drawPanel(ctx: CanvasRenderingContext2D, v: PanelView, hint: string) {
  frame(ctx, 0, 0, W, H, INK.panel, INK.panelEdge);

  let y = PAD;
  drawText(ctx, v.title, PAD, y, INK.text, W - PAD * 2);
  y += LINE + 1;
  drawMicro(ctx, v.meta, PAD, y + 1, INK.accent);
  y += MH + 4;
  rule(ctx, PAD, y + 1, W - PAD * 2);
  y += 4;

  // body, typed in
  const lines = panelBodyLines(v.body);
  let budget = v.typed;
  for (const line of lines) {
    if (budget <= 0) break;
    drawText(ctx, line.slice(0, budget), PAD, y, C(14), W - PAD * 2);
    budget -= line.length;
    y += LINE - 1;
  }
  // Leave the list where it would be at full text, so nothing shifts as the
  // body fills in. A layout that reflows while you read it is worse than no
  // animation at all.
  y = PAD + (LINE + 1) + (MH + 4) + 4 + lines.length * (LINE - 1) + 4;

  const done = budget <= 0 && v.typed >= totalChars(v.body);
  const rows = v.rows.slice(v.top, v.top + ROWS_VISIBLE);
  rows.forEach((r, i) => {
    const ry = y + i * (LINE + 2);
    const on = v.top + i === v.sel && done;
    if (on) {
      ctx.fillStyle = INK.select;
      ctx.fillRect(PAD - 3, ry - 1, W - (PAD - 3) * 2, LINE + 1);
      drawText(ctx, '▶', PAD - 2, ry, INK.panel);
    }
    const ink = on ? INK.panel : INK.text;
    const dim = on ? INK.panel : INK.textDim;
    const rightW = microWidth(r.right);
    drawText(ctx, r.left, PAD + (on ? 6 : 0), ry, ink, W - PAD * 2 - rightW - 10 - (on ? 6 : 0));
    drawMicro(ctx, r.right, W - PAD - rightW, ry + 2, dim);
  });

  // more-below marker, blinking, in the bottom right of the list
  if (v.top + ROWS_VISIBLE < v.rows.length && (Math.floor(Date.now() / 380) & 1)) {
    drawMicro(ctx, '▼', W - PAD - 3, y + ROWS_VISIBLE * (LINE + 2) - 1, INK.accent);
  }

  drawMicro(ctx, hint, PAD, H - PAD - MH, INK.textDim);
}

export function totalChars(body: string) {
  return panelBodyLines(body).reduce((n, l) => n + l.length, 0);
}

/* ------------------------------------------------------------------ *
 * THE PAUSE MENU
 *
 * The plain list of everything, drawn as a console menu rather than as an
 * HTML fallback. Same selector, same buttons — so the escape hatch is not a
 * different interface, it is the same one pointed at a table of contents.
 * ------------------------------------------------------------------ */
export function drawMenu(
  ctx: CanvasRenderingContext2D,
  items: { title: string; meta: string; done: boolean }[],
  sel: number,
  collected: number
) {
  frame(ctx, 0, 0, W, H, INK.panel, INK.panelEdge);

  drawText(ctx, 'PAUSE', PAD, PAD, INK.text);
  const right = `◆ ${collected}/3`;
  drawMicro(ctx, right, W - PAD - microWidth(right), PAD + 2, INK.accent);
  rule(ctx, PAD, PAD + LINE + 1, W - PAD * 2);

  const y0 = PAD + LINE + 6;
  items.forEach((it, i) => {
    const ry = y0 + i * (LINE + 3);
    const on = i === sel;
    if (on) {
      ctx.fillStyle = INK.select;
      ctx.fillRect(PAD - 3, ry - 1, W - (PAD - 3) * 2, LINE + 1);
      drawText(ctx, '▶', PAD - 2, ry, INK.panel);
    }
    const ink = on ? INK.panel : INK.text;
    const dim = on ? INK.panel : INK.textDim;
    // A section already opened is marked, so the menu doubles as progress.
    const mark = it.done ? '★ ' : '';
    const mw = microWidth(it.meta);
    drawText(ctx, mark + it.title, PAD + (on ? 6 : 0), ry, ink, W - PAD * 2 - mw - 12 - (on ? 6 : 0));
    drawMicro(ctx, it.meta, W - PAD - mw, ry + 2, dim);
  });

  drawMicro(ctx, 'D-PAD MOVE   A OPEN   B RESUME', PAD, H - PAD - MH, INK.textDim);
}

/* ------------------------------------------------------------------ *
 * THE HUD
 *
 * Drawn inside the picture, not in HTML above it. The score used to live in
 * the bezel as a span; putting it on the screen is the difference between a
 * game with a status bar and a game in a box with a label on it.
 * ------------------------------------------------------------------ */
export function drawHud(ctx: CanvasRenderingContext2D, collected: number, opened: number) {
  drawMicro(ctx, `◆ ${collected}/3`, 4, 4, INK.accent);
  const right = `★ ${opened}/6`;
  drawMicro(ctx, right, W - 4 - microWidth(right), 4, INK.text);
}

/** The one-line prompt along the bottom of the level. Fades once obeyed. */
export function drawPrompt(ctx: CanvasRenderingContext2D, text: string, alpha: number) {
  if (alpha <= 0) return;
  const w = microWidth(text);
  const x = Math.round((W - w) / 2);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = INK.void;
  ctx.fillRect(x - 4, H - 13, w + 8, MH + 4);
  drawMicro(ctx, text, x, H - 11, INK.text);
  ctx.globalAlpha = 1;
}
