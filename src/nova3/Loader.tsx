import { useEffect, useRef, useState } from 'react';
import { profile } from '@/data/content';

/**
 * THE OPENING.
 *
 * "Sourav." draws itself in the middle of the page, then travels up and sits
 * down as the brand in the navigation bar — and the room assembles underneath
 * it. The whole point is that the loader does not get thrown away: the thing
 * you watched arrive is the thing that is still on screen afterwards, which is
 * what makes it read as a title sequence rather than as a spinner someone
 * remembered to style.
 *
 * WHY THE LETTERS ARE SVG TEXT AND NOT PATHS
 * A stroke-drawn wordmark normally means converting a font to path data, which
 * means shipping a second copy of the letterforms that then drifts from the
 * real ones the moment the typeface changes. SVG text can be stroked and
 * dashed exactly like a path can, so the outlines draw on using the SAME Inter
 * the rest of the site uses. One source of truth, no extra asset.
 *
 * Each glyph is its own <text> so it can carry its own delay: the word writes
 * left to right instead of appearing all at once, which is the difference
 * between a signature and a fade.
 *
 * THE FLIGHT IS MEASURED, NOT GUESSED
 * The end position comes from the real brand element's bounding box, read at
 * the moment the flight starts. Hard-coding it would mean the wordmark lands
 * next to the brand rather than on it at any viewport the numbers were not
 * written for, and the whole illusion depends on those two being the same
 * object.
 */

type Phase = 'draw' | 'fly' | 'done';

/*
 * THE TIMELINE, IN ONE PLACE.
 *
 * These numbers are shared with the stylesheet — WRITE is the glyph keyframe
 * duration, FLY is the transition on the mark — so they live as named
 * constants rather than being spelled out twice in arithmetic. The first
 * version had the draw phase end while the last two letters were still being
 * written, and the flight class then snapped them to filled: a pop, in the
 * middle of the one moment the whole sequence exists to make smooth. HOLD is
 * the beat after the word finishes and before it moves, which is what makes
 * the flight read as a decision rather than as the animation running on.
 */
const LEAD = 160;   // before the first letter
const STEP = 60;    // between letters
const WRITE = 560;  // one letter, start to filled  (== n3Write duration)
const HOLD = 160;   // the finished word, still
const FLY = 700;    // the travel                   (== .n3-load-mark transition)
const HANDOVER = 340; // into the flight, the room starts assembling
const CLEAR = FLY + 220; // into the flight, the loader removes itself

/** The drawing surface, in user units. Shared with the measurement above. */
const VB_W = 460;
const VB_H = 120;

/** Read once, at module scope: it cannot change between renders. */
const STILL = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Loader({ onDone }: { onDone: () => void }) {
  /*
   * The reduced-motion decision is made in the INITIAL state, not in an
   * effect. Setting it from an effect would render the full-screen mark for
   * one frame before removing it — a flash of exactly the animation the
   * visitor asked not to see.
   */
  const [phase, setPhase] = useState<Phase>(STILL ? 'done' : 'draw');
  const markRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<SVGGElement>(null);
  const timers = useRef<number[]>([]);
  const [flight, setFlight] = useState<React.CSSProperties>({});

  const text = profile.brand; // "Sourav."
  const chars = [...text];

  useEffect(() => {
    /* Somebody who asked for less motion gets the page, not a performance —
       the sequence is skipped outright rather than sped up. */
    if (STILL) { onDone(); return; }

    const drawFor = LEAD + (chars.length - 1) * STEP + WRITE + HOLD;

    const t1 = window.setTimeout(() => {
      const mark = markRef.current;
      const brand = document.querySelector('.n3-brand-mark');
      if (!mark || !brand) {
        setPhase('done');
        onDone();
        return;
      }

      /*
       * FLIP. Measure both, then express the difference as one transform on
       * the element that is already on screen. Animating width/left instead
       * would lay out on every frame of the flight — and the flight is the one
       * moment the page has nothing else to do but look smooth.
       *
       * WHAT GETS MEASURED IS THE INK, NOT THE BOX.
       * The obvious version of this — match the mark's bounding box to the
       * brand's — lands the word 40% too wide, and the reason is worth stating
       * because it is invisible in the code: the mark's box is the SVG's
       * 460×120 viewBox, and the letterforms do not fill it. Its aspect ratio
       * is the viewBox's, not the word's. So the group's own getBBox gives the
       * letterforms in user units, and that is what gets mapped to the screen
       * and matched.
       *
       * The brand is a plain inline span, so its box IS its ink horizontally —
       * an inline box is exactly the text's advance width. Vertically it is
       * the line box, which is taller than the ink; matching heights would
       * therefore oversize the word. Width is the honest dimension, so the
       * scale comes from width and the two are then centred on each other.
       */
      const glyphs = inkRef.current;
      if (!glyphs) { setPhase('done'); onDone(); return; }

      const a = mark.getBoundingClientRect();
      const b = brand.getBoundingClientRect();
      const box = glyphs.getBBox();

      // One viewBox unit, in screen pixels.
      const ux = a.width / VB_W;
      const uy = a.height / VB_H;

      const inkW = box.width * ux;
      const inkCx = a.left + (box.x + box.width / 2) * ux;
      const inkCy = a.top + (box.y + box.height / 2) * uy;

      const scale = b.width / inkW;

      /*
       * transform-origin is the CONTAINER's centre, not the ink's, so the
       * translation has to account for where the scale leaves the ink:
       * a point P about origin C lands at C + s(P − C) + d. Solving that for
       * "ink centre ends up on brand centre" is the line below. Skipping it —
       * translating by the plain centre difference — is why an off-centre mark
       * drifts as it shrinks.
       */
      const cx = a.left + a.width / 2;
      const cy = a.top + a.height / 2;
      const dx = b.left + b.width / 2 - cx - scale * (inkCx - cx);
      const dy = b.top + b.height / 2 - cy - scale * (inkCy - cy);

      setFlight({ transform: `translate(${dx}px, ${dy}px) scale(${scale})` });
      setPhase('fly');

      // Hand over BEFORE the flight finishes. The room starts assembling while
      // the wordmark is still travelling, so the two moves overlap instead of
      // queueing — a sequence that waits for each step to end reads as slow
      // however fast each step is.
      const t2 = window.setTimeout(onDone, HANDOVER);
      const t3 = window.setTimeout(() => setPhase('done'), CLEAR);
      timers.current.push(t2, t3);
    }, drawFor);

    timers.current.push(t1);
    const held = timers.current;
    return () => held.forEach(clearTimeout);
  }, [chars.length, onDone]);

  if (phase === 'done') return null;

  return (
    <div className={`n3-load ${phase === 'fly' ? 'is-flying' : ''}`} aria-hidden>
      <div ref={markRef} className="n3-load-mark" style={flight}>
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="n3-load-svg">
          <g ref={inkRef}>
            {chars.map((ch, i) => (
              <text
                key={i}
                x={i * 58 + 8}
                y={86}
                className="n3-load-glyph"
                style={{ animationDelay: `${LEAD + i * STEP}ms` }}
              >
                {ch}
              </text>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
