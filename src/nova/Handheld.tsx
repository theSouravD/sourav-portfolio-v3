import { useCallback, useEffect, useRef } from 'react';
import { profile } from '@/data/content';
import { W, H, SECTIONS, SECTION_ORDER, type SectionId } from './level';
import { createState, step, pick, drainFired, type GameState } from './engine';
import { draw } from './render';
import { sound, soundRemembered } from './audio';
import { installPaletteVars } from './palette';
import {
  drawPanel, drawMenu, drawHud, drawPrompt, totalChars, ROWS_VISIBLE, type PanelView,
} from './ui';

/**
 * THE NOVA II HANDHELD
 *
 * The console is the site: the shell carries the name, the buttons are real
 * inputs, and the game runs on the screen.
 *
 * WHY THERE IS NO REACT STATE IN HERE AT ALL
 * The first version kept the open panel in `useState` and rendered it as HTML
 * over the canvas. That is what broke the illusion — an HTML card floating on
 * a pixel game announces that the game is a decoration, and once a visitor
 * knows that they stop playing with it. Everything inside the LCD is now drawn
 * on the canvas, in the same sixteen colours and on the same 5×7 grid as the
 * character, so the whole screen is one artefact.
 *
 * The consequence is that this component renders exactly once. Every piece of
 * mutable state — which panel is open, where the selector sits, how much of
 * the text has typed in — lives in a ref and is painted by the loop. React's
 * job here is to mount a canvas and wire up some buttons.
 */

type Mode =
  | { kind: 'play' }
  | { kind: 'panel'; id: SectionId; view: PanelView }
  | { kind: 'menu'; sel: number };

export default function Handheld() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const game = useRef<GameState>(createState());
  const input = useRef({ left: false, right: false });
  const mode = useRef<Mode>({ kind: 'play' });
  const opened = useRef<Set<SectionId>>(new Set());
  const toast = useRef({ text: '', t: 0 });
  const prompt = useRef(1);         // opacity of the opening line, 1 → 0

  /* ---- opening a section ---- */
  const openSection = useCallback((id: SectionId) => {
    const s = SECTIONS[id];
    opened.current.add(id);
    sound.open();
    mode.current = {
      kind: 'panel',
      id,
      view: { title: s.title, meta: s.meta, body: s.body, rows: s.rows, typed: 0, sel: 0, top: 0 },
    };
  }, []);

  const close = useCallback(() => { mode.current = { kind: 'play' }; }, []);

  /* ---- the loop ---- */
  useEffect(() => {
    installPaletteVars();
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    ctx.imageSmoothingEnabled = false;

    let raf = 0;
    let prev = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);

      /*
       * Delta time, capped at two frames. The cap is not cosmetic: a
       * backgrounded tab stops calling rAF, and on return the elapsed time can
       * be seconds — uncapped, that one step teleports the character through
       * the floor and out of the level.
       */
      const dt = Math.min((now - prev) / 16.667, 2);
      prev = now;

      const m = mode.current;

      if (m.kind === 'play') {
        step(game.current, input.current, dt, now);

        const f = drainFired();
        if (f.jump) sound.jump();
        if (f.land) sound.land();
        if (f.bump) sound.bump();
        if (f.coin) sound.coin();

        const s = game.current;
        if (s.toast) { toast.current = { text: `+ ${s.toast}`, t: 100 }; s.toast = null; }
        if (s.pending) {
          const id = s.pending as SectionId;
          s.pending = null;
          // A beat after the bump, so the block's wobble is seen before the
          // panel covers it.
          window.setTimeout(() => openSection(id), 190);
        }
        if (s.target || input.current.left || input.current.right) {
          prompt.current = Math.max(0, prompt.current - 0.03 * dt);
        }
      } else if (m.kind === 'panel') {
        // 2.2 characters a frame reads at about the speed of a fast reader,
        // which is the point: it paces you rather than making you wait.
        m.view.typed = Math.min(totalChars(m.view.body), m.view.typed + 2.2 * dt);
      }

      /* ---- paint ---- */
      if (m.kind === 'play') {
        draw(ctx, game.current, now);
        drawHud(ctx, game.current.collected, opened.current.size);
        if (toast.current.t > 0) {
          toast.current.t -= 1;
          drawPrompt(ctx, toast.current.text, Math.min(1, toast.current.t / 30));
        } else {
          drawPrompt(ctx, 'TAP A BLOCK - HE WILL OPEN IT', prompt.current);
        }
      } else if (m.kind === 'panel') {
        const done = m.view.typed >= totalChars(m.view.body);
        drawPanel(ctx, m.view, done ? 'D-PAD MOVE   A OPEN   B BACK' : 'A TO SKIP');
      } else {
        drawMenu(
          ctx,
          SECTION_ORDER.map((id) => ({
            title: SECTIONS[id].title,
            meta: SECTIONS[id].meta,
            done: opened.current.has(id),
          })),
          m.sel,
          game.current.collected
        );
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [openSection]);

  /* ---- sound: restore the last choice, never assume one ---- */
  useEffect(() => { if (soundRemembered()) sound.start(); }, []);

  /* ------------------------------------------------------------------
   * INPUT
   *
   * One handler for every source — d-pad, A/B, START, SELECT, keyboard —
   * and the meaning of a button depends only on the mode. That is what makes
   * the pause menu feel like part of the game rather than a fallback: the
   * same d-pad moves the character and the selector, and A both jumps and
   * confirms.
   * ------------------------------------------------------------------ */
  const press = useCallback((k: string) => {
    const m = mode.current;

    if (k === 'select') { sound.toggle(); syncSelect(); return; }

    if (k === 'start') {
      mode.current = m.kind === 'menu' ? { kind: 'play' } : { kind: 'menu', sel: 0 };
      sound.bump();
      return;
    }

    if (m.kind === 'menu') {
      if (k === 'u') { m.sel = (m.sel + SECTION_ORDER.length - 1) % SECTION_ORDER.length; sound.land(); }
      if (k === 'd') { m.sel = (m.sel + 1) % SECTION_ORDER.length; sound.land(); }
      if (k === 'a') openSection(SECTION_ORDER[m.sel]);
      if (k === 'b') close();
      return;
    }

    if (m.kind === 'panel') {
      const v = m.view;
      const finished = v.typed >= totalChars(v.body);
      if (k === 'a' && !finished) { v.typed = totalChars(v.body); return; }
      if (k === 'u') { v.sel = Math.max(0, v.sel - 1); if (v.sel < v.top) v.top = v.sel; sound.land(); }
      if (k === 'd') {
        v.sel = Math.min(v.rows.length - 1, v.sel + 1);
        if (v.sel >= v.top + ROWS_VISIBLE) v.top = v.sel - ROWS_VISIBLE + 1;
        sound.land();
      }
      if (k === 'a' && finished) {
        // A row with a link is the only thing on this screen that leaves it.
        const href = v.rows[v.sel]?.href;
        if (href) window.open(href, href.startsWith('http') ? '_blank' : '_self');
        else sound.bump();
      }
      if (k === 'b') close();
      return;
    }

    // playing
    if (k === 'a' || k === 'u') { game.current.jumpPressedAt = performance.now(); game.current.target = null; }
    if (k === 'l') { input.current.left = true; game.current.target = null; }
    if (k === 'r') { input.current.right = true; game.current.target = null; }
  }, [close, openSection]);

  const release = useCallback((k: string) => {
    if (k === 'l') input.current.left = false;
    if (k === 'r') input.current.right = false;
  }, []);

  /* The SELECT lamp is the one thing outside the screen that changes, so it
     is toggled directly rather than by re-rendering the component. */
  const selectBtn = useRef<HTMLButtonElement>(null);
  const syncSelect = () => selectBtn.current?.classList.toggle('is-lit', sound.on);
  useEffect(() => { syncSelect(); }, []);

  /* ---- tap the screen: he fetches ---- */
  const onScreen = (e: React.PointerEvent) => {
    const m = mode.current;
    const cv = canvas.current;
    if (!cv) return;
    if (m.kind !== 'play') { close(); return; }   // tapping a panel closes it
    const r = cv.getBoundingClientRect();
    game.current.target = pick(
      game.current,
      ((e.clientX - r.left) / r.width) * W,
      ((e.clientY - r.top) / r.height) * H
    );
  };

  const KEYMAP: Record<string, string> = {
    ArrowLeft: 'l', a: 'l', ArrowRight: 'r', d: 'r',
    ArrowUp: 'u', w: 'u', ArrowDown: 'd', s: 'd',
    ' ': 'a', z: 'a', Enter: 'a',
    x: 'b', Escape: 'b', Tab: 'start',
  };

  return (
    <div
      ref={shell}
      className="nova2-dev"
      tabIndex={0}
      onKeyDown={(e) => { const k = KEYMAP[e.key]; if (k) { e.preventDefault(); press(k); } }}
      onKeyUp={(e) => { const k = KEYMAP[e.key]; if (k) release(k); }}
    >
      <div className="nova2-bezel">
        {/*
          The bezel carries only what a real one would: a power lamp and a
          moulded model name. The score used to live up here as HTML; it is
          now inside the picture, where a game's score belongs.
        */}
        <div className="nova2-bezhead">
          <span className="nova2-pwr" />
          <span className="nova2-model">Nova II · Handheld</span>
        </div>
        <div className="nova2-lcd" onPointerDown={onScreen}>
          <canvas ref={canvas} width={W} height={H} />
        </div>
      </div>

      <div className="nova2-plate">
        <span className="nova2-name">{profile.name}</span>
        <span className="nova2-role">Gen AI Production Lead<br />Creative Director</span>
      </div>

      <div className="nova2-pads">
        <div className="nova2-dpad">
          <span className="nova2-hub" />
          {(['u', 'd', 'l', 'r'] as const).map((k) => (
            <Btn key={k} k={k} cls={`nova2-d nova2-d-${k}`} press={press} release={release}>
              {{ u: '▲', d: '▼', l: '◀', r: '▶' }[k]}
            </Btn>
          ))}
        </div>
        <div className="nova2-ab">
          <Btn k="b" cls="nova2-rnd nova2-b" press={press} release={release}>B</Btn>
          <Btn k="a" cls="nova2-rnd nova2-a" press={press} release={release}>A</Btn>
        </div>
      </div>

      <div className="nova2-softs">
        <Btn k="select" cls="nova2-soft" press={press} release={release} btnRef={selectBtn}>
          select · sound
        </Btn>
        <Btn k="start" cls="nova2-soft" press={press} release={release}>start · menu</Btn>
      </div>

      <div className="nova2-speaker">{[0, 1, 2, 3, 4, 5].map((i) => <i key={i} />)}</div>
    </div>
  );
}

/**
 * A hardware button.
 *
 * Pointer events rather than click, because a d-pad repeats while held and
 * click only fires on release. `pointerleave` and `pointercancel` both release
 * — without them, dragging a thumb off the button leaves the character walking
 * into a wall forever.
 */
function Btn({
  k, cls, press, release, children, btnRef,
}: {
  k: string; cls: string;
  press: (k: string) => void; release: (k: string) => void;
  children: React.ReactNode;
  btnRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const self = useRef<HTMLButtonElement>(null);
  const el = btnRef ?? self;
  return (
    <button
      ref={el}
      type="button"
      className={cls}
      aria-label={LABELS[k] ?? k}
      onPointerDown={(e) => { e.preventDefault(); el.current?.classList.add('is-down'); press(k); }}
      onPointerUp={() => { el.current?.classList.remove('is-down'); release(k); }}
      onPointerLeave={() => { el.current?.classList.remove('is-down'); release(k); }}
      onPointerCancel={() => { el.current?.classList.remove('is-down'); release(k); }}
    >
      {children}
    </button>
  );
}

const LABELS: Record<string, string> = {
  u: 'Up / jump', d: 'Down', l: 'Left', r: 'Right',
  a: 'A — jump and confirm', b: 'B — back',
  start: 'Start — menu', select: 'Select — sound',
};
