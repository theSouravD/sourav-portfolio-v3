import { useCallback, useEffect, useRef, useState } from 'react';
import { profile } from '@/data/content';

const FIELDS: { k: string; v: string }[] = [
  { k: 'Production', v: profile.name },
  { k: 'Roll', v: 'A001' },
  { k: 'Scene', v: '01' },
  { k: 'Take', v: '01' },
  { k: 'Director', v: 'Creative Direction · Gen AI' },
  { k: 'Format', v: 'Portfolio · 2026' },
];

/**
 * A clapperboard, not a chat panel.
 *
 * The fields stamp in one at a time, the stick snaps, the frame flashes and we
 * cut straight into the film. It's the right opening gesture for a site whose
 * whole structure is an edit, and it reads in under two seconds. Any click or
 * key snaps it early. It plays on every load — it's the opening title, not a
 * loading screen, so skipping it on a refresh would be skipping the film's
 * first frame.
 */
export default function Slate({ onCut }: { onCut: () => void }) {
  const [filled, setFilled] = useState(-1);
  const [armed, setArmed] = useState(false);
  const [snapped, setSnapped] = useState(false);
  const [cutting, setCutting] = useState(false);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  /**
   * The clap, in the order it actually happens.
   *
   * The sticks fall on the visitor's input — not before it — and the flash
   * comes a beat later, when the two halves meet. Firing them together loses
   * the whole gesture: a flash with no impact behind it just reads as the
   * screen blinking.
   */
  const cut = useCallback(() => {
    if (!armed || cutting) return;
    clear();
    setFilled(FIELDS.length);
    setSnapped(true); // sticks fall now
    timers.current.push(window.setTimeout(() => setCutting(true), 230)); // …and land
    timers.current.push(window.setTimeout(onCut, 230 + 620));
  }, [armed, cutting, onCut]);

  /*
   * Fill the board — then stop, with the stick still up.
   *
   * The clapper is the visitor's to close. Nothing snaps or cuts on a timer:
   * the board fills in, the prompt comes up, and it waits. On a real set the
   * sticks are held open until someone calls it, and that pause is the whole
   * reason the gesture feels like anything.
   */
  useEffect(() => {
    FIELDS.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setFilled(i), 180 + i * 150));
    });
    timers.current.push(window.setTimeout(() => setArmed(true), 180 + FIELDS.length * 150 + 260));
    return clear;
  }, []);

  /*
   * The slate opens itself.
   *
   * It is a title card, not a door: making a recruiter click before they can
   * see anything costs more than the gesture is worth. So it plays, holds a
   * beat, and rolls — about 1.7s end to end. Clicking or pressing a key still
   * cuts immediately, so nobody impatient is made to wait for it.
   *
   * The hold is what got cut, not the fill. The board stamping in is the part
   * worth watching; the pause after it was only ever there to give a click
   * somewhere to land, and there is no click any more.
   *
   * This has to hang off `armed` rather than off mount. `cut` refuses to fire
   * until the board is full, and a timer scheduled at mount closes over the
   * version of `cut` that was created while `armed` was still false — so it
   * fires on time, hits the guard, and does nothing. Scheduling it the moment
   * the board arms captures a `cut` that will actually run.
   */
  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(cut, 400);
    timers.current.push(t);
    return () => clearTimeout(t);
  }, [armed, cut]);

  // Call it. Only listens once the board is filled and the prompt is up.
  useEffect(() => {
    if (!armed) return;
    const click = () => cut();
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') cut();
    };
    window.addEventListener('pointerdown', click);
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('pointerdown', click);
      window.removeEventListener('keydown', key);
    };
  }, [armed, cut]);

  return (
    <div
      className={`fixed inset-0 z-[120] grid place-items-center bg-[#050505] transition-opacity duration-500 ${
        cutting ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* Cut flash */}
      <span
        className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-200 ${
          cutting ? 'opacity-90' : 'opacity-0'
        }`}
        style={{ animation: cutting ? 'slateFlash 500ms ease-out forwards' : undefined }}
      />

      <div className="w-[min(560px,calc(100%-2.5rem))]">
        {/* Clapper stick */}
        <div
          className="origin-bottom-left transition-transform duration-[280ms] ease-[cubic-bezier(0.5,0,0.2,1)]"
          style={{ transform: snapped ? 'rotate(0deg)' : 'rotate(-13deg)' }}
        >
          <div className="flex h-9 overflow-hidden rounded-t-[3px] border border-white/25">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="h-full flex-1 skew-x-[-22deg]"
                style={{ background: i % 2 ? '#0a0a0a' : '#f5f5f5' }}
              />
            ))}
          </div>
        </div>

        {/* Board */}
        <div className="rounded-b-[3px] border border-t-0 border-white/25 bg-[#0d0d0d] p-5 sm:p-7">
          <div className="grid grid-cols-2 gap-x-6 gap-y-0 sm:grid-cols-3">
            {FIELDS.map((f, i) => {
              const on = i <= filled;
              return (
                <div
                  key={f.k}
                  className="border-b border-white/12 py-3"
                  style={{
                    opacity: on ? 1 : 0.18,
                    transition: 'opacity 220ms ease',
                  }}
                >
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
                    {f.k}
                  </div>
                  <div
                    className="mt-1 truncate font-mono text-[13px] uppercase tracking-[0.06em] text-white"
                    style={{
                      transform: on ? 'translateY(0)' : 'translateY(4px)',
                      transition: 'transform 220ms ease',
                    }}
                  >
                    {on ? f.v : '—'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/70">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              Rec
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
              Roll A001 · Take 01
            </span>
          </div>
        </div>

        {/*
          No enter control.

          There was a bracketed "click to enter" button here, from when the
          slate held until it was called. Now that it opens itself in about
          three seconds, an instruction to click is an instruction to do
          something that is already happening — it invites a visitor to act at
          the exact moment the board is about to act for them, and whichever
          they choose the other one looks broken. Any click or keypress still
          cuts early; it just isn't advertised.
        */}
      </div>

      <style>{`
        @keyframes slateFlash {
          0%   { opacity: 0.95; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
