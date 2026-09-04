import { LEVEL, W, H, SECTIONS } from './level';
import type { GameState } from './engine';
import { PLAYER } from './engine';
import { INK, C } from './palette';
import { drawMicro, microWidth } from './font';
import { ditherBand } from './ui';

/**
 * The renderer.
 *
 * Two rules, and everything else follows from them. Every mark is an
 * integer-aligned rectangle in one of sixteen palette colours; and every
 * gradient is an ordered dither between two of those colours rather than a
 * smooth ramp. A canvas gradient inside a pixel game is the same mistake as an
 * HTML panel over one — it introduces hundreds of colours the palette never
 * agreed to, and the eye reads the result as a filter rather than as art.
 *
 * THE BACKGROUND IS DRAWN ONCE
 * Dithering the sky costs 240 × 100 individual fills. Doing that sixty times a
 * second would spend the whole frame budget on pixels that never change, so
 * the sky, the hills and the ground are baked into an offscreen canvas at
 * startup and blitted in one call. Only the things that move are drawn live.
 */

let backdrop: HTMLCanvasElement | null = null;

function bakeBackdrop() {
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d');
  if (!g) return cv;

  /* ---- sky: three dithered bands through the palette's dusk ramp ---- */
  const horizon = LEVEL.solids[0].y;
  ditherBand(g, 0, 0, W, 42, INK.sky[0], INK.sky[1]);
  ditherBand(g, 0, 42, W, 86, INK.sky[1], INK.sky[2]);
  ditherBand(g, 0, 86, W, horizon, INK.sky[2], INK.sky[3]);

  /* ---- the sun: a stepped disc, not a circle ----
     Drawn as five rows of rectangles of decreasing width, which is how a
     circle is drawn at this size. An arc() here would be antialiased and
     would introduce colours off the palette along its whole edge. */
  const sx = 198, sy = 34, r = 11;
  for (let dy = -r; dy <= r; dy += 1) {
    const dx = Math.floor(Math.sqrt(r * r - dy * dy));
    g.fillStyle = dy < -3 ? C(9) : dy < 4 ? C(9) : C(8);
    g.fillRect(sx - dx, sy + dy, dx * 2, 1);
  }
  // two horizontal bands cut out of the sun — the cheapest way to say "dusk"
  g.fillStyle = INK.sky[2];
  g.fillRect(sx - r, sy + 2, r * 2, 2);
  g.fillRect(sx - r, sy + 7, r * 2, 1);

  /* ---- hills: two layers, the far one lighter ---- */
  const hill = (x: number, w: number, h: number, col: string) => {
    g.fillStyle = col;
    for (let i = 0; i < w / 2; i += 1) {
      const hh = Math.round((h * (i * 2)) / w);
      g.fillRect(x + i, horizon - hh, 1, hh);
      g.fillRect(x + w - 1 - i, horizon - hh, 1, hh);
    }
  };
  /*
   * Two layers, both short. The first pass at these was 32px tall and read as
   * a mountain range across the middle of the play area — scenery has to stay
   * behind the thing you are doing, and at this size that means half the
   * height and a colour a step darker than instinct suggests.
   */
  hill(20, 62, 15, C(3));
  hill(104, 78, 17, C(3));
  hill(178, 54, 13, C(3));
  hill(0, 46, 9, C(2));
  hill(66, 52, 10, C(2));
  hill(150, 60, 11, C(2));

  /* ---- ground: body, lip, and a dithered shadow under the lip ---- */
  for (const sol of LEVEL.solids) {
    if (sol.thin) continue;
    if (sol.y !== horizon) continue;      // the pipe is drawn live, over the top
    g.fillStyle = INK.ground;
    g.fillRect(sol.x, sol.y, sol.w, sol.h);
    g.fillStyle = INK.groundLip;
    g.fillRect(sol.x, sol.y, sol.w, 2);
    ditherBand(g, sol.x, sol.y + 2, sol.x + sol.w, sol.y + 6, INK.groundLip, INK.ground);
    // brick joints
    g.fillStyle = C(1);
    for (let i = 0; i < sol.w; i += 8) g.fillRect(sol.x + i, sol.y + 6, 1, sol.h - 6);
    for (let yy = sol.y + 11; yy < sol.y + sol.h; yy += 6) g.fillRect(sol.x, yy, sol.w, 1);
  }

  return cv;
}

/**
 * A stepped halo.
 *
 * Three concentric rings of decreasing coverage, drawn with the dither matrix
 * so the falloff is made of palette colours rather than alpha. This is the
 * "lighting" — coins and the flag are the only things that emit, and they emit
 * in the same sixteen colours as everything else.
 */
function halo(ctx: CanvasRenderingContext2D, cx: number, cy: number, phase: number) {
  const r = 7 + Math.sin(phase) * 1.5;
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = C(9);
  for (let dy = -r; dy <= r; dy += 1) {
    const dx = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy)));
    for (let x = -dx; x <= dx; x += 1) {
      if ((((cx + x) & 1) + ((cy + dy) & 1)) & 1) continue;   // 50% checker
      ctx.fillRect(cx + x, cy + dy, 1, 1);
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * A centred label that cannot leave the screen.
 *
 * RESUME and HELLO sit at x=217 and x=233, so centring them naively pushed
 * both off the right edge — a label clipped by the bezel reads as a bug, not
 * as a crop. Everything gets clamped to a two-pixel margin.
 */
function label8(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, colour: string) {
  const w = microWidth(text);
  const x = Math.max(2, Math.min(W - 2 - w, Math.round(cx - w / 2)));
  drawMicro(ctx, text, x, y, colour);
}

export function draw(ctx: CanvasRenderingContext2D, s: GameState, t: number) {
  if (!backdrop) backdrop = bakeBackdrop();
  ctx.drawImage(backdrop, 0, 0);

  const px = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h));
  };

  /* ---- ledge ---- */
  for (const sol of LEVEL.solids) {
    if (!sol.thin) continue;
    px(sol.x, sol.y, sol.w, sol.h, INK.ledge);
    px(sol.x, sol.y, sol.w, 1, C(5));
    px(sol.x, sol.y + sol.h - 1, sol.w, 1, C(2));
  }

  /* ---- pipe: body, rim, and a lit edge on the left ---- */
  const p = LEVEL.pipe;
  px(p.x, p.y, p.w, p.h, INK.pipe);
  px(p.x + p.w - 5, p.y, 5, p.h, INK.pipeDark);
  px(p.x - 2, p.y, p.w + 4, 6, INK.pipe);
  px(p.x - 2, p.y, p.w + 4, 1, C(14));
  px(p.x + p.w + 1, p.y, 1, 6, INK.pipeDark);
  px(p.x + 2, p.y + 7, 2, p.h - 7, C(14));

  /* ---- flag: pole, and a pennant that ripples on two frames ---- */
  const f = LEVEL.flag;
  px(f.x, f.y, 2, f.h, C(15));
  const ripple = Math.floor(t / 260) & 1;
  px(f.x + 2, f.y + 3, 11, 7, INK.flag);
  px(f.x + 2 + (ripple ? 9 : 10), f.y + 3, 2, 7, C(11));
  px(f.x - 1, f.y - 3, 4, 4, C(9));

  /* ---- blocks ---- */
  for (const b of s.blocks) {
    const by = b.y - b.bump;
    if (b.bump > 0) b.bump -= 1;
    px(b.x, by, 16, 14, b.used ? INK.blockUsed : INK.block);
    px(b.x, by, 16, 2, b.used ? INK.blockUsedLip : INK.blockLip);
    px(b.x, by + 12, 16, 2, C(11));
    px(b.x, by, 1, 14, b.used ? INK.blockUsedLip : C(15));
    px(b.x + 15, by, 1, 14, C(11));
    if (!b.used) {
      px(b.x + 5, by + 4, 5, 2, INK.void);
      px(b.x + 9, by + 5, 2, 2, INK.void);
      px(b.x + 7, by + 7, 2, 2, INK.void);
      px(b.x + 7, by + 10, 2, 2, INK.void);
    } else {
      px(b.x + 6, by + 6, 4, 2, C(2));
    }
    // the word under the block — the whole dummy-proofing argument, in 5×7
    const label = SECTIONS[b.id].label;
    label8(ctx, label, b.x + 8, by + 17, b.used ? INK.textDim : INK.text);
  }

  label8(ctx, 'RESUME', p.x + p.w / 2, p.y - 8, INK.text);
  label8(ctx, 'HELLO', f.x + 1, f.y - 9, INK.text);

  /* ---- coins, each inside its own halo ---- */
  for (const c of s.coins) {
    if (c.got) continue;
    halo(ctx, c.x, c.y, t / 420);
    // the spin: four frames, the middle two narrower
    const phase = Math.floor(t / 130) & 3;
    const w = phase === 1 || phase === 3 ? 2 : 6;
    px(c.x - w / 2, c.y - 4, w, 8, INK.coin);
    if (w > 2) px(c.x - 1, c.y - 3, 2, 6, INK.coinLip);
  }

  /* ---- dust ---- */
  for (const d of s.puffs) {
    px(d.x - 3, d.y - 2, Math.max(1, 6 * d.life), 1, d.life > 0.5 ? C(15) : C(4));
  }

  /* ---- the character ---- */
  const sq = s.squash * 3;
  const x = Math.round(s.x);
  const y = Math.round(s.y) + sq;
  const hgt = PLAYER.h - sq;
  const stride = Math.floor(s.walk) & 1;
  const airborne = !s.grounded;

  // legs: apart when walking, together in the air
  if (airborne) {
    px(x + 1, y + hgt - 5, 3, 4, INK.bodyDark);
    px(x + 6, y + hgt - 5, 3, 4, INK.bodyDark);
  } else {
    px(x + (stride ? 0 : 2), y + hgt - 5, 3, 5, INK.bodyDark);
    px(x + (stride ? 6 : 5), y + hgt - 5, 3, 5, INK.bodyDark);
  }
  px(x, y + hgt - 10, 10, 6, INK.body);
  px(x, y + hgt - 10, 10, 1, C(15));                 // lit top edge
  px(x + (s.face > 0 ? 9 : 0), y + hgt - 9, 1, 5, INK.bodyDark);
  px(x + 2, y, 6, 5, INK.skin);
  px(x + (s.face > 0 ? 6 : 2), y + 2, 2, 2, INK.void);
  px(x + 1, y - 1, 8, 2, INK.cap);
  px(x + (s.face > 0 ? 8 : 0), y, 2, 1, INK.cap);    // the peak, facing forward
}
