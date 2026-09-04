import { useEffect, useRef } from 'react';

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
 * already-loaded Inter, and per-character weight/scale driven by cursor
 * distance. Weight steps between the four Inter weights the page loads; the
 * rest is transform, so it costs no layout and cannot reflow anything.
 */
export default function PressureName({
  text,
  className = '',
  radius = 220,
  baseOpacity = 0.72,
  baseWeight = 400,
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
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const mouse = useRef({ x: -9999, y: -9999 });
  const frame = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    const tick = () => {
      charRefs.current.forEach((el) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(mouse.current.x - cx, mouse.current.y - cy);
        const t = Math.max(0, 1 - d / radius);
        const eased = t * t;

        el.style.fontWeight = String(Math.round(baseWeight + eased * (700 - baseWeight)));
        el.style.transform = `scaleY(${1 + eased * 0.16}) scaleX(${1 + eased * 0.05})`;
        el.style.opacity = String(baseOpacity + eased * (1 - baseOpacity));
      });
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame.current);
    };
  }, [radius, baseOpacity, baseWeight]);

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
                  className="inline-block origin-bottom will-change-transform"
                  style={{ transition: 'font-weight 120ms linear' }}
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
