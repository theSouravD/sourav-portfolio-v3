import { useEffect, useRef } from 'react';

/**
 * Sideways navigation: two-finger trackpad swipe, and touch swipe on a phone.
 *
 * WHY THIS IS NOT JUST `onWheel`
 * A trackpad sends a two-finger swipe as a long burst of `wheel` events with
 * deltaX — dozens of them for one physical gesture. Acting on each would fly
 * through all six rooms from one flick. So the burst is treated as a single
 * gesture: deltaX accumulates, the first crossing of the threshold fires, and
 * nothing else fires until the events stop for 240ms and the finger has
 * genuinely left the pad. Momentum scrolling keeps sending events long after
 * that, which is exactly what the quiet period is there to swallow.
 *
 * THE HARDER PROBLEM IS THE VERTICAL AXIS
 * Every room scrolls vertically, and a trackpad gesture is never purely
 * horizontal — a downward scroll carries a few pixels of drift. Firing on that
 * would mean the page changing room while somebody is reading, which is worse
 * than having no gesture at all. So a gesture only counts as horizontal if
 * deltaX dominates deltaY by 2:1 over the whole burst, not per event.
 *
 * Vertical is left completely alone. On a phone a horizontal swipe changes
 * room and a vertical one scrolls, which is what a phone has trained everyone
 * to expect.
 */
export function useSwipeRooms(onPrev: () => void, onNext: () => void, enabled = true) {
  /* The listeners are attached once and must always call the CURRENT
     handlers, so the callbacks live behind a ref — written in an effect
     rather than during render, so a re-render that is thrown away cannot
     leave a stale pair behind. */
  const prev = useRef(onPrev);
  const next = useRef(onNext);
  useEffect(() => {
    prev.current = onPrev;
    next.current = onNext;
  }, [onPrev, onNext]);

  useEffect(() => {
    if (!enabled) return;

    /* ---- trackpad ---- */
    let ax = 0;
    let ay = 0;
    let fired = false;
    let idle = 0;

    const onWheel = (e: WheelEvent) => {
      // A gesture inside something that scrolls sideways of its own accord
      // belongs to that thing, not to the site's navigation.
      if ((e.target as HTMLElement)?.closest('[data-noswipe]')) return;

      ax += e.deltaX;
      ay += e.deltaY;

      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        ax = 0;
        ay = 0;
        fired = false;
      }, 240);

      if (fired) return;
      if (Math.abs(ax) < 90) return;
      if (Math.abs(ax) < Math.abs(ay) * 2) return;

      fired = true;
      if (ax > 0) next.current();
      else prev.current();
    };

    /* ---- touch ---- */
    let sx = 0;
    let sy = 0;
    let tracking = false;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      if ((e.target as HTMLElement)?.closest('[data-noswipe]')) return;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      tracking = true;
    };
    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      // 64px is far enough that a tap with a wobble in it never counts, and
      // near enough that the gesture does not feel like a drag.
      if (Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
      if (dx < 0) next.current();
      else prev.current();
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
      window.clearTimeout(idle);
    };
  }, [enabled]);
}
