import { useEffect, useRef } from 'react';
import type React from 'react';

/**
 * Per-character proximity type.
 *
 * React Bits' TextPressure is the effect this is modelled on, but it sizes
 * itself from the metrics of a remote variable font (Roboto Flex) and lays the
 * glyphs out edge-to-edge. When that font is slow, blocked, or simply swapped
 * for a wider fallback, the headline overflows its box — an unacceptable
 * failure mode for the first thing on the page.
 *
 * This keeps the interaction and drops the fragility: normal text layout, the
 * already-loaded Inter, and per-character response driven by cursor distance.
 * Everything but the weight is transform, so it costs no layout and cannot
 * reflow anything.
 *
 * TWO RESPONSES, ONE MECHANISM.
 *
 * `pressure` — the default, and what Nova I's title shot uses — leans on the
 * glyph: heavier, taller, more present as the cursor nears it.
 *
 * `bounce` lifts it instead, on a spring. It exists because pressure has a
 * problem on a phone: weight and squash are small, continuous changes, and a
 * finger covers the character making them. A letter that jumps clear of your
 * thumb and springs back is legible under the thing that caused it, which is
 * the only kind of touch feedback worth having. It is also the only response
 * left once the name is set bold — there is no weight above 700 for pressure
 * to reach for.
 */
export default function PressureName({
  text,
  className = '',
  radius = 220,
  baseOpacity = 0.72,
  baseWeight = 400,
  intro = 0,
  introDelay = 0,
  bounce = false,
}: {
  text: string;
  className?: string;
  radius?: number;
  /**
   * How present a character is before the cursor reaches it.
   *
   * The default of 0.72 was tuned against black, where holding white back is
   * what stops a headline shouting. Held back against paper it just reads as
   * grey — a name set in grey looks like a placeholder, not a signature — so
   * the light theme runs this at 1 and buys its contrast from weight instead.
   */
  baseOpacity?: number;
  baseWeight?: number;
  /**
   * Per-character stagger, in milliseconds, for the entrance. Zero (the
   * default) means no entrance and the pressure effect owns the glyphs from
   * the first frame — which is how Nova I uses this.
   */
  intro?: number;
  /** How long to wait before the first glyph moves. */
  introDelay?: number;
  /**
   * Spring the character upward instead of thickening it. Opt-in, so the
   * Nova I title shot keeps the behaviour it was built around.
   */
  bounce?: boolean;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const mouse = useRef({ x: -9999, y: -9999 });
  const frame = useRef(0);
  /* One spring per character: offset in px, velocity in px per frame. A ref
     because none of it belongs in React state — it changes sixty times a
     second and renders nothing. */
  const spring = useRef<{ y: number; v: number }[]>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const away = () => {
      mouse.current = { x: -9999, y: -9999 };
    };
    const onMove = (e: PointerEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    /*
     * TOUCH.
     *
     * `pointermove` on its own is a mouse-only effect in practice: on a
     * touchscreen it fires only while a finger is already down, so the name
     * did nothing at all until you dragged across it, and a tap did nothing
     * ever. Down places the pointer; up takes it away again — and taking it
     * away is not a reset but the second half of the bounce, because the
     * spring overshoots on the way back.
     */
    /*
     * A tap is too short to be a gesture.
     *
     * Down and up on a phone are often 60ms apart, which at 60fps is three
     * frames -- the spring has barely left zero before the target returns to
     * it, and the letter twitches instead of jumping. Holding the pointer
     * where the finger left it for a fifth of a second lets the lift finish;
     * releasing it then is what produces the fall and the overshoot. The
     * timer is cleared by the next contact so a fast drum-roll of taps does
     * not queue up releases behind itself.
     */
    let release = 0;
    const onDown = (e: PointerEvent) => {
      clearTimeout(release);
      onMove(e);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      clearTimeout(release);
      release = window.setTimeout(away, 200);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });
    window.addEventListener('pointerleave', away);

    /*
     * The entrance and this effect both want to own opacity and transform,
     * and the loop wins every frame it runs — so while the intro is playing
     * the loop simply does not touch the glyphs. Handing over once rather
     * than blending the two is what keeps the entrance readable: a cursor
     * near the name mid-sequence would otherwise stamp its own weight over a
     * letter that has not arrived yet.
     */
    const handover = intro ? performance.now() + introDelay + intro * text.length + 900 : 0;

    /* Stiffness, and damping applied per frame. Together they give one clear
       overshoot and a settle inside about a fifth of a second — a bounce you
       read as a bounce rather than as a wobble. */
    const K = 0.24;
    const DAMP = 0.76;

    const tick = () => {
      if (performance.now() < handover) {
        frame.current = requestAnimationFrame(tick);
        return;
      }
      charRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const s = (spring.current[i] ??= { y: 0, v: 0 });

        /*
         * Measure the character where it WOULD be, not where this effect has
         * just put it. The rect is the transformed box, so feeding it back in
         * makes a lifted glyph read as further from the pointer, which drops
         * it, which brings it closer again — a letter that flutters instead
         * of springing. Subtracting the current offset undoes exactly that.
         */
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2 - s.y;
        const d = Math.hypot(mouse.current.x - cx, mouse.current.y - cy);
        const t = Math.max(0, 1 - d / radius);
        const eased = t * t;

        if (!bounce) {
          el.style.fontWeight = String(Math.round(baseWeight + eased * (700 - baseWeight)));
          el.style.transform = `scaleY(${1 + eased * 0.16}) scaleX(${1 + eased * 0.05})`;
          el.style.opacity = String(baseOpacity + eased * (1 - baseOpacity));
          return;
        }

        /* The lift is a fraction of the glyph's own height, so it is the same
           gesture whether the name is 42px on a phone or 86px on a monitor. */
        const target = -eased * r.height * 0.2;
        s.v = (s.v + (target - s.y) * K) * DAMP;
        s.y += s.v;

        /* Squash and stretch, read straight off the velocity rather than
           keyframed. It is what stops the lift reading as a slide. */
        const stretch = Math.max(-0.1, Math.min(0.1, -s.v * 0.012));
        el.style.transform =
          `translate3d(0, ${s.y.toFixed(2)}px, 0)` +
          ` scaleY(${(1 + stretch).toFixed(3)}) scaleX(${(1 - stretch * 0.5).toFixed(3)})`;
      });
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('pointerleave', away);
      clearTimeout(release);
      cancelAnimationFrame(frame.current);
    };
  }, [radius, baseOpacity, baseWeight, intro, introDelay, text.length, bounce]);

  /*
   * Every character is its own inline-block, and to a line-breaking algorithm
   * that makes every character its own word: at a narrow measure the headline
   * broke as "Sourav De / y". So the characters are grouped back into words
   * that carry `nowrap` — normal breaking is restored between words and made
   * impossible inside one, while each glyph keeps its own ref and weight.
   */
  /* Each word carries the index its first glyph has in the flat ref array, so
     the mapping is computed up front rather than by mutating a counter as the
     tree renders. */
  const words: { chars: string[]; from: number }[] = [];
  let from = 0;
  for (const word of text.split(' ')) {
    words.push({ chars: word.split(''), from });
    from += word.length;
  }

  return (
    <span ref={rootRef} className={`inline-block select-none ${className}`} aria-label={text}>
      {words.map((word, w) => (
        <span key={w}>
          {/* The space lives OUTSIDE the nowrap span, so it stays the one
              place the line is still allowed to break. */}
          {w > 0 ? ' ' : null}
          <span className="inline-block whitespace-nowrap">
            {word.chars.map((ch, c) => {
              const i = word.from + c;
              return (
                <span
                  key={i}
                  ref={(el) => {
                    charRefs.current[i] = el;
                  }}
                  aria-hidden
                  className={`inline-block origin-bottom will-change-transform${intro ? ' n3-glyph' : ''}`}
                  style={{
                    /* A transition on transform would fight the spring, which
                       already integrates every frame. Weight is the only
                       thing the browser should be interpolating here. */
                    transition: bounce ? undefined : 'font-weight 120ms linear',
                    ...(intro
                      ? ({ ['--d' as string]: `${introDelay + i * intro}ms` } as React.CSSProperties)
                      : null),
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        </span>
      ))}
    </span>
  );
}
