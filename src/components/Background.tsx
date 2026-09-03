import { useEffect, useState } from 'react';
import { PRESETS, PresetLayer } from '@/film/backgrounds';

/**
 * Fixed ground for the whole film.
 *
 * The animated layer is swappable (see `film/backgrounds.tsx`); the scrim and
 * vignette on top are constant, so whichever look is chosen, the type keeps the
 * same contrast against it.
 */
export default function Background({ preset }: { preset: string }) {
  const base = PRESETS.find((p) => p.id === preset)?.scrim ?? 0.16;
  const [depth, setDepth] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      setDepth(Math.min(p * 2.1, 1));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-[#0a0a0a]" aria-hidden="true">
      <PresetLayer id={preset} />

      {/* Readability scrim — deepens with scroll depth. */}
      <div
        className="absolute inset-0 bg-[#0a0a0a] transition-opacity duration-200"
        style={{ opacity: Math.min(0.82, base + depth * 0.34) }}
      />

      {/* Vignette keeps the eye centred. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_42%,rgba(10,10,10,0.55)_100%)]" />
    </div>
  );
}
