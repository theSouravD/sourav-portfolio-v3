import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * A shot that is taller than the stage pans instead of being clipped.
 *
 * THE PROBLEM THIS SOLVES
 * Every chapter is `absolute inset-0` on one sticky stage, which is what makes
 * the film's layout impossible to shift — but it also means a chapter can only
 * ever be exactly one viewport tall. Content that doesn't fit is simply cut
 * off, silently and at both ends, because the shot centres itself. On a phone
 * the toolkit lost its heading off the top and its entire tools strip off the
 * bottom, with nothing on screen to suggest either existed.
 *
 * THE FIX
 * Measure the content against the stage. If it fits, nothing happens at all
 * and this is a plain wrapper. If it doesn't, the overflow is spread across
 * the chapter's own scroll: the content sits at the top of the frame at the
 * start and has travelled exactly its overflow by the end, so scrolling
 * through the chapter reveals it the way scrolling a page would.
 *
 * This is the vertical twin of what the reel already does sideways, and it is
 * deliberately not conditioned on a breakpoint — a laptop with a short browser
 * window has the same problem as a phone, and `over <= 0` makes it a no-op
 * everywhere else.
 */
export default function Panned({
  local,
  className = '',
  children,
}: {
  /** The chapter's own 0..1 progress. */
  local: number;
  className?: string;
  children: React.ReactNode;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [over, setOver] = useState(0);

  /*
   * Re-measure on anything that can change either height: the viewport, and
   * the content itself (web fonts landing, a chip row rewrapping). Layout
   * effect rather than effect, so the first paint is already correct.
   */
  useLayoutEffect(() => {
    const f = frame.current;
    const c = content.current;
    if (!f || !c) return;

    const measure = () => setOver(Math.max(0, c.offsetHeight - f.clientHeight));
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(f);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  // Fonts land after first paint and can change the content height materially.
  useEffect(() => {
    const c = content.current;
    const f = frame.current;
    if (!c || !f || !document.fonts) return;
    document.fonts.ready.then(() =>
      setOver(Math.max(0, c.offsetHeight - f.clientHeight))
    );
  }, []);

  /*
   * The travel starts a little after the chapter opens and finishes a little
   * before it closes. The shot's own entrance animations run over the first
   * fifth, and its exit over the last — panning through those would have the
   * content moving while it is still fading in, which reads as a slip rather
   * than as travel.
   */
  const run = Math.max(0, Math.min(1, (local - 0.12) / 0.76));

  return (
    <div ref={frame} className="h-full overflow-hidden">
      <div
        ref={content}
        className={`flex min-h-full flex-col justify-center ${className}`}
        style={{
          transform: `translate3d(0, ${-over * run}px, 0)`,
          willChange: over ? 'transform' : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
