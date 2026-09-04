import { useEffect, useRef } from 'react';
import TargetCursor from '@/reactbits/TargetCursor';
import type { CursorId } from './theme';

/**
 * Custom cursors.
 *
 * THE RULE THAT DECIDES THE DESIGN
 * A custom cursor is a latency test you cannot win. The real pointer is drawn
 * by the compositor and is never late; anything drawn in JavaScript is at
 * least a frame behind, and on a page also running a WebGL background it can
 * be several. So the dot and the ring are drawn on a `transform` updated in a
 * rAF loop — never by writing `left`/`top`, which lays out — and the ring
 * deliberately EASES toward the pointer rather than chasing it. A follower
 * that is meant to lag looks intentional; one that is meant to keep up and
 * cannot looks broken.
 *
 * They also never replace the pointer on touch, where there is nothing to
 * follow, and never hide it from someone using a keyboard.
 */
export default function Cursor({ mode, accent }: { mode: CursorId; accent: string }) {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    if (mode === 'system' || mode === 'target') return;
    // A coarse pointer has no cursor to decorate, and hiding the real one on
    // a touch device would leave nothing at all.
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const p = { x: innerWidth / 2, y: innerHeight / 2 };
    const r = { x: p.x, y: p.y };
    let over = false;

    const onMove = (e: PointerEvent) => {
      p.x = e.clientX;
      p.y = e.clientY;
      over = !!(e.target as HTMLElement)?.closest?.('button, a, input, .n3-link');
    };
    const onLeave = () => {
      if (dot.current) dot.current.style.opacity = '0';
      if (ring.current) ring.current.style.opacity = '0';
    };
    const onEnter = () => {
      if (dot.current) dot.current.style.opacity = '1';
      if (ring.current) ring.current.style.opacity = '1';
    };

    const tick = () => {
      // The ring eases; the dot does not. Two different follow rates is what
      // gives the pair any sense of weight at all.
      r.x += (p.x - r.x) * 0.18;
      r.y += (p.y - r.y) * 0.18;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
      }
      if (ring.current) {
        const k = over ? 1.9 : 1;
        ring.current.style.transform =
          `translate3d(${r.x}px, ${r.y}px, 0) translate(-50%, -50%) scale(${k})`;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);
    document.body.classList.add('n3-nocursor');

    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
      document.body.classList.remove('n3-nocursor');
    };
  }, [mode]);

  if (mode === 'system') return null;

  if (mode === 'target') {
    return (
      <TargetCursor
        targetSelector="button, a, .n3-link"
        spinDuration={6}
        hideDefaultCursor
        cursorColor={accent}
      />
    );
  }

  return (
    <>
      {mode === 'dot' && <div ref={dot} className="n3-cur-dot" aria-hidden />}
      {mode === 'ring' && (
        <>
          <div ref={dot} className="n3-cur-dot is-small" aria-hidden />
          <div ref={ring} className="n3-cur-ring" aria-hidden />
        </>
      )}
    </>
  );
}
