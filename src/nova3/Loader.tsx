import { useCallback, useEffect, useRef, useState } from 'react';
import SplitText from '@/reactbits/SplitText';
import { profile } from '@/data/content';

/**
 * THE OPENING.
 *
 * "Sourav." sets itself letter by letter in the middle of the page, holds,
 * then travels up and sits down as the brand in the navigation bar while the
 * room assembles underneath it. The point of the whole thing is that the
 * loader is not thrown away: the object you watched arrive is the object still
 * on screen afterwards, which is what separates a title sequence from a
 * spinner someone remembered to style.
 *
 * WHY THIS IS SPLITTEXT AND NOT A STROKE-DRAWN SVG
 * The first version stroked SVG letterforms and animated a dashoffset, so the
 * word appeared to be written. It read as a diagram of writing rather than as
 * motion design: a hairline outline around a 96px glyph is nearly invisible,
 * and thickening it to compensate turns the wordmark furry. React Bits'
 * SplitText, over GSAP's own splitter, gives the move this actually wants —
 * each character masked, rising from behind a hard edge with a little rotation
 * on X, staggered. Letters that ARRIVE, rather than letters that fade up.
 *
 * It also removes a whole class of problem. Stroked SVG text needs its own
 * font-size, weight and letter-spacing maintained against the real brand's;
 * a DOM span inherits the site's type and cannot drift from it.
 *
 * THE FLIGHT IS MEASURED, NOT GUESSED
 * The destination is the real brand element's box, read at the moment the
 * flight begins. Hard-coded numbers would land the word beside the brand
 * rather than on it at any viewport those numbers were not written for, and
 * the illusion depends entirely on the two being the same object.
 *
 * THE FLIGHT IS ALSO NOT ON A TIMER
 * It starts when the letters report that they have finished, so the sequence
 * stays correct if the name changes length or the type loads slowly. The
 * timer that remains is a failsafe, not the schedule — see BAIL.
 */

type Phase = 'write' | 'fly' | 'done';

/** Hold after the word lands and before it moves. The beat is what makes the
    flight read as a decision rather than as the animation running on. */
const HOLD = 240;
/** The travel. Must match the transition on `.n3-load-mark`. */
const FLY = 700;
/** Into the flight, the room starts assembling underneath. */
const HANDOVER = 340;
/** Into the flight, the loader takes itself off screen. */
const CLEAR = FLY + 220;
/**
 * Failsafe. Everything above is driven by SplitText's completion callback, and
 * a callback that never fires would leave the visitor on an empty page — so if
 * the letters have not reported in by now, the flight starts anyway. A loading
 * sequence is the one place in a site where "it silently did nothing" is the
 * same outcome as "it crashed".
 */
const BAIL = 2600;

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
  const [phase, setPhase] = useState<Phase>(STILL ? 'done' : 'write');
  const markRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const launched = useRef(false);
  const [flight, setFlight] = useState<React.CSSProperties>({});

  const text = profile.brand; // "Sourav."

  const launch = useCallback(() => {
    /* Both the completion callback and the failsafe call this; whichever
       arrives first wins and the other becomes a no-op. */
    if (launched.current) return;
    launched.current = true;

    const t0 = window.setTimeout(() => {
      const mark = markRef.current;
      const brand = document.querySelector('.n3-brand-mark');
      if (!mark || !brand) { setPhase('done'); onDone(); return; }

      /*
       * FLIP. Measure both boxes, then express the difference as one transform
       * on the element that is already on screen. Animating font-size or
       * position instead would lay out on every frame of the flight — and the
       * flight is the one moment the page has nothing else to do but look
       * smooth.
       *
       * Both boxes are inline text, so both widths are the word's own advance
       * width and the scale is honest. (Heights are not: an inline box's
       * height is its line-height, which would oversize the word. The previous
       * SVG version got this wrong in a more interesting way — its box was the
       * viewBox, whose aspect ratio has nothing to do with the letterforms
       * inside it, and the word landed 40% too wide.)
       */
      const a = mark.getBoundingClientRect();
      const b = brand.getBoundingClientRect();
      const scale = b.width / a.width;
      const dx = b.left + b.width / 2 - (a.left + a.width / 2);
      const dy = b.top + b.height / 2 - (a.top + a.height / 2);

      setFlight({ transform: `translate(${dx}px, ${dy}px) scale(${scale})` });
      setPhase('fly');

      /* Hand over BEFORE the flight ends, so the room assembles while the
         wordmark is still travelling. A sequence that waits for each step to
         finish reads as slow however fast each step is. */
      const t1 = window.setTimeout(onDone, HANDOVER);
      const t2 = window.setTimeout(() => setPhase('done'), CLEAR);
      timers.current.push(t1, t2);
    }, HOLD);

    timers.current.push(t0);
  }, [onDone]);

  useEffect(() => {
    /* Somebody who asked for less motion gets the page, not a performance —
       the sequence is skipped outright rather than sped up. */
    if (STILL) { onDone(); return; }

    const bail = window.setTimeout(launch, BAIL);
    timers.current.push(bail);

    const held = timers.current;
    return () => held.forEach(clearTimeout);
  }, [launch, onDone]);

  if (phase === 'done') return null;

  return (
    <div className={`n3-load ${phase === 'fly' ? 'is-flying' : ''}`} aria-hidden>
      <div ref={markRef} className="n3-load-mark" style={flight}>
        <SplitText
          text={text}
          tag="span"
          className="n3-load-word"
          trigger="mount"
          splitType="chars"
          /* Each letter gets its own overflow-hidden box, so it climbs out
             from behind a hard edge instead of fading in over the page. */
          mask="chars"
          delay={52}
          duration={0.82}
          ease="power4.out"
          from={{ yPercent: 118, rotateX: -78, opacity: 0 }}
          to={{ yPercent: 0, rotateX: 0, opacity: 1 }}
          onLetterAnimationComplete={launch}
        />
        {/* A rule that draws under the word as the last letters land and
            leaves with it — the one piece of pure ornament here, and it earns
            its place by giving the word a baseline to sit on rather than
            floating in the middle of an empty page. */}
        <span className="n3-load-rule" />
      </div>
    </div>
  );
}
