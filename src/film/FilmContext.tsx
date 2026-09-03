import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getLenis } from '@/lib/scroll';
import { CHAPTERS, CHAPTER_OFFSETS, TOTAL_LENGTH, locate } from './chapters';

interface FilmValue {
  /** 0..1 across the whole film track. */
  progress: number;
  index: number;
  local: number;
  /** Scroll to a fraction of the film. */
  seek: (fraction: number, immediate?: boolean) => void;
  /** Scroll to the start of a chapter. */
  goToChapter: (i: number) => void;
  /** True once the film track has been scrolled past. */
  past: boolean;
  /**
   * True once the slate has been cut and the film is actually visible.
   * Entrance animations that must be *seen* key off this: the hero is mounted
   * and in the viewport the whole time the slate is up, just at opacity 0, so
   * anything driven by an in-view check alone has already finished playing by
   * the time the visitor gets here.
   */
  rolling: boolean;
  registerTrack: (el: HTMLElement | null) => void;
}

const FilmCtx = createContext<FilmValue | null>(null);

export function useFilm() {
  const ctx = useContext(FilmCtx);
  if (!ctx) throw new Error('useFilm must be used inside <FilmProvider>');
  return ctx;
}

/**
 * Owns the film's scroll position.
 *
 * The whole film is ONE tall track with ONE sticky stage inside it. Chapters
 * cross-fade within that stage rather than each pinning themselves, which is
 * what keeps the page geometry completely still: the stage never changes size,
 * so no interaction — opening a player, swapping a chapter, resizing a rail —
 * can push anything else around.
 */
export function FilmProvider({
  children,
  rolling = true,
}: {
  children: React.ReactNode;
  rolling?: boolean;
}) {
  const trackRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [past, setPast] = useState(false);
  const frame = useRef(0);

  const registerTrack = useCallback((el: HTMLElement | null) => {
    trackRef.current = el;
  }, []);

  useEffect(() => {
    const read = () => {
      frame.current = 0;
      const el = trackRef.current;
      if (!el) return;
      const top = el.offsetTop;
      const span = el.offsetHeight - window.innerHeight;
      if (span <= 0) return;
      const p = (window.scrollY - top) / span;
      setProgress(Math.max(0, Math.min(1, p)));
      setPast(p > 1.001);
    };

    const onScroll = () => {
      if (!frame.current) frame.current = requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const seek = useCallback((fraction: number, immediate = false) => {
    const el = trackRef.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    const y = el.offsetTop + Math.max(0, Math.min(1, fraction)) * span;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: immediate ? 0 : 1.1, immediate });
    else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
  }, []);

  const goToChapter = useCallback(
    (i: number) => {
      /**
       * Land a third of the way into the chapter. Chapter entrances are driven
       * by scroll position, so arriving at the exact boundary would freeze the
       * shot mid-entrance until the visitor scrolled again.
       */
      const ch = CHAPTERS[i];
      if (!ch) return;
      const into = (ch.length * 0.34) / TOTAL_LENGTH;
      seek((CHAPTER_OFFSETS[i] ?? 0) + into);
    },
    [seek]
  );

  const { index, local } = useMemo(() => locate(progress), [progress]);

  const value = useMemo<FilmValue>(
    () => ({ progress, index, local, seek, goToChapter, past, rolling, registerTrack }),
    [progress, index, local, seek, goToChapter, past, rolling, registerTrack]
  );

  return <FilmCtx.Provider value={value}>{children}</FilmCtx.Provider>;
}
