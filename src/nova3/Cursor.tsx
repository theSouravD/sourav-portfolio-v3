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
  const trail = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    if (mode === 'system' || mode === 'target') return;
    // A coarse pointer has no cursor to decorate, and hiding the real one on
    // a touch device would leave nothing at all.
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const p = { x: innerWidth / 2, y: innerHeight / 2 };
    const r = { x: p.x, y: p.y };
    let over = false;
    // Where the trail's segments have been. Fixed length, written round —
    // pushing and shifting an array sixty times a second is garbage the
    // collector then has to chase during the animation.
    const tail = Array.from({ length: 6 }, () => ({ x: p.x, y: p.y }));

    const onMove = (e: PointerEvent) => {
      p.x = e.clientX;
      p.y = e.clientY;
      over = !!(e.target as HTMLElement)?.closest?.('button, a, input, .n3-link');
    };
    const fade = (o: string) => {
      if (dot.current) dot.current.style.opacity = o;
      if (ring.current) ring.current.style.opacity = o;
      if (trail.current) trail.current.style.opacity = o;
    };
    const onLeave = () => fade('0');
    const onEnter = () => fade('1');

    const tick = () => {
      // The follower eases; the dot does not. Two different follow rates is
      // what gives the pair any sense of weight at all.
      r.x += (p.x - r.x) * 0.18;
      r.y += (p.y - r.y) * 0.18;

      if (dot.current) {
        dot.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
      }

      if (ring.current) {
        if (mode === 'crosshair') {
          // Two rules the width and height of the frame. They track the exact
          // pointer, not the eased one — a crosshair that lags is a crosshair
          // that is pointing at the wrong thing.
          ring.current.style.setProperty('--cx', `${p.x}px`);
          ring.current.style.setProperty('--cy', `${p.y}px`);
        } else if (mode === 'blade') {
          // An edit playhead: it leans into the direction of travel and snaps
          // upright when the pointer stops, which is the whole gesture.
          const lean = Math.max(-14, Math.min(14, (p.x - r.x) * 0.9));
          ring.current.style.transform =
            `translate3d(${r.x}px, ${r.y}px, 0) translate(-50%, -50%) rotate(${lean}deg) scaleY(${over ? 1.35 : 1})`;
        } else {
          const k = over ? 1.9 : 1;
          ring.current.style.transform =
            `translate3d(${r.x}px, ${r.y}px, 0) translate(-50%, -50%) scale(${k})`;
        }
      }

      if (mode === 'trail') {
        // Each segment chases the one in front of it, so the tail bends
        // through the path rather than being a straight line of copies.
        tail[0].x += (p.x - tail[0].x) * 0.5;
        tail[0].y += (p.y - tail[0].y) * 0.5;
        for (let i = 1; i < tail.length; i += 1) {
          tail[i].x += (tail[i - 1].x - tail[i].x) * 0.42;
          tail[i].y += (tail[i - 1].y - tail[i].y) * 0.42;
        }
        const nodes = trail.current?.children;
        if (nodes) {
          for (let i = 0; i < nodes.length; i += 1) {
            (nodes[i] as HTMLElement).style.transform =
              `translate3d(${tail[i].x}px, ${tail[i].y}px, 0) translate(-50%, -50%)`;
          }
        }
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
      {(mode === 'dot' || mode === 'ring' || mode === 'halo' || mode === 'crosshair') && (
        <div ref={dot} className={`n3-cur-dot ${mode === 'dot' ? '' : 'is-small'}`} aria-hidden />
      )}
      {mode === 'ring' && <div ref={ring} className="n3-cur-ring" aria-hidden />}
      {mode === 'halo' && <div ref={ring} className="n3-cur-halo" aria-hidden />}
      {mode === 'blade' && <div ref={ring} className="n3-cur-blade" aria-hidden />}
      {mode === 'crosshair' && <div ref={ring} className="n3-cur-cross" aria-hidden />}
      {mode === 'trail' && (
        <div ref={trail} className="n3-cur-trail" aria-hidden>
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} style={{ opacity: 1 - i * 0.15, scale: `${1 - i * 0.13}` }} />
          ))}
        </div>
      )}
    </>
  );
}
