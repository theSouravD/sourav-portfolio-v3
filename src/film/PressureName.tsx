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
}: {
  text: string;
  className?: string;
  radius?: number;
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

        el.style.fontWeight = String(Math.round(400 + eased * 300));
        el.style.transform = `scaleY(${1 + eased * 0.16}) scaleX(${1 + eased * 0.05})`;
        el.style.opacity = String(0.72 + eased * 0.28);
      });
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame.current);
    };
  }, [radius]);

  return (
    <span ref={rootRef} className={`inline-block select-none ${className}`} aria-label={text}>
      {text.split('').map((ch, i) => (
        <span
          key={i}
          ref={(el) => {
            charRefs.current[i] = el;
          }}
          aria-hidden
          className="inline-block origin-bottom will-change-transform"
          style={{ transition: 'font-weight 120ms linear' }}
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  );
}
