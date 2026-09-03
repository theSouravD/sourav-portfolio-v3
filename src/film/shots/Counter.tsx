import { useEffect, useRef, useState } from 'react';

/**
 * A number that arrives at its value.
 *
 * React Bits' CountUp drives itself from an in-view check latched with
 * `once: true`, which is wrong for this spot twice over: the hero is already
 * inside the viewport while the slate is still up — mounted, just at opacity 0
 * — so the latch closes before anyone can see it, and inside the film's sticky
 * stage the observer doesn't report reliably at all.
 *
 * Here the trigger is known exactly: the slate has been cut. So this counts on
 * a plain rAF against that signal and needs no observer.
 */
export default function Counter({
  to,
  start,
  duration = 1800,
  delay = 0,
}: {
  to: number;
  /** Begin as soon as this is true. */
  start: boolean;
  duration?: number;
  delay?: number;
}) {
  const [value, setValue] = useState(0);
  const raf = useRef(0);
  const timer = useRef(0);

  useEffect(() => {
    if (!start) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to);
      return;
    }

    timer.current = window.setTimeout(() => {
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        // Decelerating, so it races up and settles rather than crawling in.
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(eased * to));
        if (t < 1) raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer.current);
      cancelAnimationFrame(raf.current);
    };
  }, [start, to, duration, delay]);

  return <>{value}</>;
}
