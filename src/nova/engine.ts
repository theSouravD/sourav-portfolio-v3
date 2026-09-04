/**
 * The platformer engine.
 *
 * Deliberately separate from React. The game runs on requestAnimationFrame at
 * whatever rate the display gives it; React re-renders when a section opens.
 * Mixing those two clocks is how you end up re-rendering a component tree
 * sixty times a second to move a ten-pixel sprite.
 *
 * EVERYTHING IS IN DELTA TIME. The first prototype tied movement to frames,
 * which meant it ran at double speed on a 120Hz screen — the character crossed
 * the level in half the intended distance and the jumps were unreachable. Every
 * velocity below is per-frame-at-60, multiplied by `dt` where 1.0 is one
 * sixtieth of a second.
 */

import { LEVEL, W, H, type Block, type Coin } from './level';

/** Per-frame-at-60 constants. Tuned against the level, not chosen from taste. */
const GRAVITY = 0.34;
const SPEED = 1.15;
const JUMP = -5.3;
const TERMINAL = 6;

/**
 * The two forgiveness windows.
 *
 * COYOTE: you can still jump for this long after walking off an edge. Without
 * it, a player who presses jump one frame late simply falls, and it reads as
 * the game being broken rather than as their mistake.
 *
 * BUFFER: a jump pressed this long before landing fires on landing instead of
 * being swallowed. Without it, holding a rhythm through two jumps is
 * impossible — the second press lands mid-air and vanishes.
 *
 * Both are in milliseconds, and both are invisible when present.
 */
const COYOTE_MS = 90;
const BUFFER_MS = 130;

export interface Target {
  /** Where the character is heading, in level pixels. */
  cx: number;
  cy: number;
  /** Jump when underneath it — true for blocks and coins, false for ground. */
  up?: boolean;
  block?: Block;
  coin?: Coin;
  /** Section to open on arrival, for the pipe and the flag. */
  arrive?: string;
}

export interface Puff { x: number; y: number; life: number }

export interface GameState {
  x: number; y: number;
  vx: number; vy: number;
  grounded: boolean;
  face: 1 | -1;
  /** Walk cycle phase, 0..4. */
  walk: number;
  /** 1 immediately after landing, decaying — drives the squash. */
  squash: number;
  lastGrounded: number;
  jumpPressedAt: number;
  target: Target | null;
  puffs: Puff[];
  blocks: Block[];
  coins: Coin[];
  collected: number;
  /** Set by the engine, drained by the host: a section wants to open. */
  pending: string | null;
  /** Set by the engine, drained by the host: a coin label to toast. */
  toast: string | null;
}

const PW = 10, PH = 14;

export function createState(): GameState {
  return {
    x: LEVEL.spawn.x, y: LEVEL.spawn.y,
    vx: 0, vy: 0,
    grounded: true,
    face: 1,
    walk: 0,
    squash: 0,
    lastGrounded: 0,
    jumpPressedAt: -1e9,
    target: null,
    puffs: [],
    blocks: LEVEL.blocks.map((b) => ({ ...b })),
    coins: LEVEL.coins.map((c) => ({ ...c })),
    collected: 0,
    pending: null,
    toast: null,
  };
}

interface Box { x: number; y: number; w: number; h: number; thin?: boolean; block?: Block }

function overlaps(a: Box, b: Box) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function collidables(s: GameState): Box[] {
  return [
    ...LEVEL.solids,
    ...s.blocks.map((b) => ({ x: b.x, y: b.y, w: 16, h: 14, block: b })),
  ];
}

export interface Input { left: boolean; right: boolean }

export function step(s: GameState, input: Input, dt: number, now: number) {
  /* ---- horizontal intent: keys first, then the fetch target ---- */
  let want = input.left ? -1 : input.right ? 1 : 0;
  if (!want && s.target) {
    const d = s.target.cx - (s.x + PW / 2);
    if (Math.abs(d) > 3) want = d > 0 ? 1 : -1;
  }
  s.vx = want * SPEED;
  if (want) s.face = want as 1 | -1;
  s.walk = want ? (s.walk + 0.22 * dt) % 4 : 0;

  /* ---- the fetch AI ----
     Two rules, and between them they clear the whole level: jump when you are
     underneath the thing you're going for, and jump when something solid is
     in the way. Anything cleverer is pathfinding, and this level is one
     screen. */
  if (s.target && s.grounded) {
    const dx = Math.abs(s.target.cx - (s.x + PW / 2));
    if (s.target.up && dx < 9 && s.y > s.target.cy) s.jumpPressedAt = now;
    else if (dx > 4 && blocked(s, want)) s.jumpPressedAt = now;
    // A thin platform is invisible to `blocked` — it is solid from above only
    // — so without this rule the character walks underneath the ledge forever
    // and the Toolkit block, which needs the ledge, can never be fetched.
    else if (needsLift(s, s.target)) s.jumpPressedAt = now;
  }

  /* ---- the jump, with both forgiveness windows ---- */
  const coyoteOk = s.grounded || now - s.lastGrounded < COYOTE_MS;
  if (now - s.jumpPressedAt < BUFFER_MS && coyoteOk) {
    s.vy = JUMP;
    s.grounded = false;
    s.jumpPressedAt = -1e9;
    s.puffs.push({ x: s.x + PW / 2, y: s.y + PH, life: 1 });
    fired.jump = true;
  }

  s.vy = Math.min(s.vy + GRAVITY * dt, TERMINAL);

  /* ---- resolve X, then Y. Separately, always: resolving both at once turns
     a corner into a wall you stick to. ---- */
  s.x += s.vx * dt;
  for (const b of collidables(s)) {
    if (b.thin) continue;
    if (overlaps({ x: s.x, y: s.y, w: PW, h: PH }, b)) {
      s.x = s.vx > 0 ? b.x - PW : b.x + b.w;
    }
  }
  s.x = Math.max(0, Math.min(W - PW, s.x));

  const wasAirborne = !s.grounded;
  s.y += s.vy * dt;
  s.grounded = false;
  for (const b of collidables(s)) {
    if (!overlaps({ x: s.x, y: s.y, w: PW, h: PH }, b)) continue;
    if (s.vy > 0) {
      // Thin platforms are solid from above only, so you can jump up through
      // them — otherwise the upper tier is unreachable from the ground.
      if (b.thin && s.y + PH - s.vy * dt > b.y + 2) continue;
      s.y = b.y - PH;
      s.vy = 0;
      s.grounded = true;
    } else if (s.vy < 0 && !b.thin) {
      s.y = b.y + b.h;
      s.vy = 0;
      if (b.block && !b.block.used) knock(s, b.block);
    }
  }

  if (s.grounded) {
    s.lastGrounded = now;
    if (wasAirborne) {
      s.squash = 1;
      s.puffs.push({ x: s.x + PW / 2, y: s.y + PH, life: 1 });
      fired.land = true;
    }
  }
  s.squash = Math.max(0, s.squash - 0.09 * dt);

  // Fell off the world. Shouldn't be possible on this level, but a respawn is
  // cheaper than a bug report.
  if (s.y > H + 40) {
    s.x = LEVEL.spawn.x; s.y = LEVEL.spawn.y; s.vy = 0;
  }

  for (const p of s.puffs) { p.life -= 0.045 * dt; p.y -= 0.12 * dt; }
  s.puffs = s.puffs.filter((p) => p.life > 0);

  /* ---- pickups ---- */
  for (const c of s.coins) {
    if (c.got) continue;
    if (s.x < c.x + 6 && s.x + PW > c.x - 6 && s.y < c.y + 8 && s.y + PH > c.y - 8) {
      c.got = true;
      s.collected += 1;
      s.toast = c.label;
      fired.coin = true;
      if (s.target?.coin === c) s.target = null;
    }
  }

  /* ---- the pipe and the flag: arrival, not collision from below ---- */
  const me = { x: s.x, y: s.y, w: PW, h: PH };
  const p = LEVEL.pipe;
  const onPipe =
    s.x + PW > p.x - 4 && s.x < p.x + p.w + 4 && s.y + PH > p.y - 6 && s.y < p.y + p.h;
  if (s.target?.arrive === 'cv' && onPipe) {
    s.target = null; s.pending = 'cv';
  }
  if (s.target?.arrive === 'say' &&
      overlaps(me, { x: LEVEL.flag.x - 5, y: LEVEL.flag.y, w: 11, h: LEVEL.flag.h })) {
    s.target = null; s.pending = 'say';
  }
}

/**
 * Is there a step up between us and what we're heading for?
 *
 * True when a thin platform sits above the character, below the target, and
 * within reach horizontally. That is the whole of this level's route-finding:
 * one screen needs a rule, not a pathfinder.
 */
function needsLift(s: GameState, t: Target) {
  if (t.cy > s.y - 18) return false;
  const cx = s.x + PW / 2;
  return LEVEL.solids.some(
    (b) => b.thin && b.y < s.y && b.y > t.cy && cx > b.x - 6 && cx < b.x + b.w + 6
  );
}

function blocked(s: GameState, dir: number) {
  if (!dir) return false;
  const probe = { x: s.x + dir * 6, y: s.y + 4, w: PW, h: PH - 4 };
  return collidables(s).some((b) => !b.thin && overlaps(probe, b));
}

function knock(s: GameState, b: Block) {
  b.used = true;
  b.bump = 8;
  fired.bump = true;
  if (s.target?.block === b) s.target = null;
  s.pending = b.id;
}

/**
 * Sound events for the frame just stepped.
 *
 * A module-level flag set rather than a callback: the audio layer polls this
 * once per frame and clears it, which keeps the engine free of any dependency
 * on how — or whether — sound is played.
 */
export const fired = { jump: false, land: false, bump: false, coin: false };
export function drainFired() {
  const out = { ...fired };
  fired.jump = fired.land = fired.bump = fired.coin = false;
  return out;
}

/**
 * What a tap means.
 *
 * Anything within reach becomes a fetch target; a tap on empty ground is a
 * walk instruction. The distance cap matters — without it, a tap on the far
 * side of the level snaps attention to something the visitor wasn't pointing
 * at, which feels like the game overriding them.
 */
export function pick(s: GameState, px: number, py: number): Target {
  let best: Target | null = null;
  let bestD = Infinity;
  const consider = (cx: number, cy: number, extra: Partial<Target>) => {
    const d = Math.hypot(cx - px, cy - py);
    if (d < bestD) { bestD = d; best = { cx, cy, ...extra }; }
  };

  for (const b of s.blocks) {
    if (!b.used) consider(b.x + 8, b.y + 7, { up: true, block: b });
  }
  for (const c of s.coins) {
    if (!c.got) consider(c.x, c.y, { up: true, coin: c });
  }
  consider(LEVEL.pipe.x + LEVEL.pipe.w / 2, LEVEL.pipe.y, { arrive: 'cv' });
  consider(LEVEL.flag.x, LEVEL.flag.y + LEVEL.flag.h - 8, { arrive: 'say' });

  if (bestD > 80 || !best) return { cx: px, cy: py };
  return best;
}

export const PLAYER = { w: PW, h: PH };
