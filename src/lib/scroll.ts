import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

/**
 * Scenes register the scroll position that should be treated as "the top of
 * this section". For a pinned scene that is its ScrollTrigger start, which is
 * NOT the element's DOM offset — this is why plain #anchor links land in the
 * wrong place on a pinned page.
 */
const sceneStarts = new Map<string, () => number>();

export function registerScene(id: string, getStart: () => number) {
  sceneStarts.set(id, getStart);
  return () => {
    if (sceneStarts.get(id) === getStart) sceneStarts.delete(id);
  };
}

/** Resolve where a scene actually begins in scroll space. */
export function sceneScrollTop(id: string): number | null {
  const fn = sceneStarts.get(id);
  if (fn) return fn();

  // Unpinned sections fall back to their measured position.
  const el = document.getElementById(id);
  if (!el) return null;
  const top = el.getBoundingClientRect().top + window.scrollY;
  return Math.max(0, top - 24);
}

export function scrollToScene(id: string, immediate = false) {
  const y = sceneScrollTop(id);
  if (y == null) return;
  if (lenis) lenis.scrollTo(y, { duration: immediate ? 0 : 1.25, immediate });
  else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
}

export function initSmoothScroll() {
  if (lenis) return lenis;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  lenis = new Lenis({
    duration: 1.05,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
  });

  // Lenis owns the scroll position, so ScrollTrigger must be ticked by it.
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function destroySmoothScroll() {
  lenis?.destroy();
  lenis = null;
}

export function getLenis() {
  return lenis;
}

export { gsap, ScrollTrigger };
