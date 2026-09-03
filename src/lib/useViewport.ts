import { useEffect, useState } from 'react';

/**
 * One source of truth for "is this a phone".
 *
 * Components need this in JS, not just CSS, because two of the fixes are
 * behavioural rather than cosmetic: the reel travels on a different axis, and
 * the timeline swaps a row of chips for a single label. A media query can hide
 * things; it cannot change which direction a strip moves.
 *
 * 768px matches Tailwind's `md`, so the JS and the CSS agree about where the
 * breakpoint is and nothing can end up half-switched.
 */
export function useIsMobile(query = '(max-width: 767px)') {
  const [is, setIs] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setIs(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);

  return is;
}
