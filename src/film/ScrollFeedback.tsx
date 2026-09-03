import { useEffect, useRef, useState } from 'react';
import { useFilm } from './FilmContext';

/**
 * Proof that the film heard you.
 *
 * One part now: a progress rail that lengthens and brightens on every scroll.
 *
 * Two things used to live here and no longer do. The wrong-gesture correction
 * moved into the reel's own header — a notification landing on top of the scene
 * announced itself as a separate system, which is exactly what this page should
 * not feel like. The opening "scroll to run the film" cue was cut once the rail
 * was carrying the load: a hero with a permanent instruction under it is a hero
 * that doesn't trust its own first gesture, and the rail already answers the
 * question the instruction was written for.
 *
 * The rail matters more than it looks. Everything else on this page responds to
 * scroll by degrees, and none of it answers the question a first-time visitor is
 * actually asking: "did that do anything?". A bar that visibly lengthens on the
 * first notch answers it in one gesture, in a convention people already know.
 */
export default function ScrollFeedback() {
  const { progress, rolling, past } = useFilm();
  const [pulse, setPulse] = useState(false);
  const pulseTimer = useRef(0);

  // Brighten the rail on movement, then let it settle back.
  useEffect(() => {
    if (!rolling) return;
    setPulse(true);
    clearTimeout(pulseTimer.current);
    pulseTimer.current = window.setTimeout(() => setPulse(false), 420);
    return () => clearTimeout(pulseTimer.current);
  }, [progress, rolling]);

  if (!rolling) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] transition-opacity duration-500"
      style={{ opacity: past ? 0 : 1 }}
    >
      <div className="h-full w-full bg-white/8" />
      <div
        className="absolute left-0 top-0 h-full bg-white transition-[box-shadow,opacity] duration-300"
        style={{
          width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
          opacity: pulse ? 1 : 0.55,
          boxShadow: pulse ? '0 0 14px rgba(255,255,255,0.8)' : 'none',
        }}
      />
    </div>
  );
}
