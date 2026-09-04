import { useCallback, useEffect, useRef, useState } from 'react';
import SoftAurora from '@/reactbits/SoftAurora';
import GradualBlur from '@/reactbits/GradualBlur';
import Nav from './Nav';
import { Room } from './Sections';
import CaseRoom from './CaseRoom';
import { SETUPS, setupOf, washProps, sectionFromHash, type SectionId } from './scenes';
import { useSwipeRooms } from './useSwipeRooms';
import './nova3.css';

/**
 * NOVA III — THE STAGE.
 *
 * One room on screen at a time. Changing room re-gels the wash rather than
 * swapping it: a single SoftAurora instance lives for the life of the page and
 * its colour, band height and spread are animated between setups. One
 * instrument, re-gelled — which keeps six rooms looking like one site, and
 * avoids rebuilding a WebGL context on every click.
 *
 * The accent travels with the light as a CSS variable, so the nav underline,
 * the statistics, the section kickers, the hover borders and the focus rings
 * all change temperature together. A grade that only touches the background is
 * a wallpaper change; a grade that touches everything is a grade.
 */
export default function Stage() {
  const [id, setId] = useState<SectionId>('home');
  const [caseSlug, setCaseSlug] = useState<string | null>(null);
  const [cutting, setCutting] = useState(false);
  const cutTimer = useRef(0);

  const setup = setupOf(id);

  const go = useCallback((next: SectionId, slug: string | null = null) => {
    setId((current) => {
      if (current === next && slug === null && caseSlug === null) return current;
      /*
       * The cut. Content leaves fast and arrives fast — 160ms out, then in —
       * while the light takes six hundred to change. Fast content is what
       * keeps the site quick to use; slow light is what makes the speed feel
       * directed rather than abrupt.
       */
      setCutting(true);
      window.clearTimeout(cutTimer.current);
      cutTimer.current = window.setTimeout(() => setCutting(false), 170);
      return next;
    });
    setCaseSlug(slug);
    const hash = slug ? `#case/${slug}` : `#${next}`;
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    // A room change starts you at the top of it, the way opening a page does.
    document.querySelector('.n3-stage')?.scrollTo({ top: 0 });
  }, [caseSlug]);

  /* The back button and shared links both have to work. A site where the
     browser's own controls do nothing is not dummy-proof, whatever the nav
     looks like. */
  useEffect(() => {
    const sync = () => {
      const s = sectionFromHash();
      setId(s.id);
      setCaseSlug(s.caseSlug);
    };
    sync();
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
      window.clearTimeout(cutTimer.current);
    };
  }, []);

  /* Sideways swipe walks the rooms, on a trackpad and on a phone. Like the
     arrow keys it is a shortcut, never the only way — the nav bar is still
     six words that do the same thing. Disabled inside a case study, where
     sideways would mean two different things at once. */
  const stepRoom = useCallback((dir: 1 | -1) => {
    const i = SETUPS.findIndex((s) => s.id === id);
    go(SETUPS[(i + dir + SETUPS.length) % SETUPS.length].id);
  }, [id, go]);

  useSwipeRooms(() => stepRoom(-1), () => stepRoom(1), !caseSlug);

  /* Arrow keys walk the rooms — a shortcut for people who want one, never the
     only way to do anything. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea')) return;
      if (e.key === 'Escape' && caseSlug) { go('systems'); return; }
      if (caseSlug) return;
      const i = SETUPS.findIndex((s) => s.id === id);
      if (e.key === 'ArrowRight') go(SETUPS[(i + 1) % SETUPS.length].id);
      if (e.key === 'ArrowLeft') go(SETUPS[(i - 1 + SETUPS.length) % SETUPS.length].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, caseSlug, go]);

  return (
    <div className="n3" style={{ ['--accent' as string]: setup.accent, ['--wash' as string]: setup.wash }}>
      {/* ---- the wash: one instance, re-gelled ---- */}
      <div className="n3-lights" aria-hidden>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <SoftAurora {...(washProps(setup) as any)} />
        {/*
          The shader's light mode paints down from pure #ffffff, and pure white
          is what a template looks like. One multiply of the paper stock over
          it warms the ground and the gel together — the same as printing the
          image on cream rather than recolouring every pixel of it.
        */}
        <div className="n3-paper" />
        {/*
          Grain is doing more work in daylight than it was in the dark: there
          is nothing else hiding the flatness of a large pale field, and it is
          the difference between a page and a printed page. The falloff at the
          edges keeps the wash from meeting the frame in a hard line.
        */}
        <div className="n3-grain" />
        <div className="n3-tooth" />
        <div className="n3-vig" />
      </div>

      <GradualBlur position="bottom" height="5rem" strength={1.1} divCount={5} exponential opacity={0.7} zIndex={4} />

      <Nav active={id} onGo={(next) => go(next)} />

      <main className={`n3-stage ${cutting ? 'is-cutting' : ''}`}>
        <div key={caseSlug ?? id} className="n3-cut">
          {caseSlug
            ? <CaseRoom slug={caseSlug} onBack={() => go('systems')} />
            : <Room id={id} onGo={go} />}
        </div>
      </main>

      <p className="n3-slug">
        <span />
        {caseSlug ? 'Systems — case study' : `${setup.label} — ${setup.note}`}
      </p>
    </div>
  );
}
