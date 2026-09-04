import { useCallback, useEffect, useRef, useState } from 'react';
import LightRays from '@/reactbits/LightRays';
import GradualBlur from '@/reactbits/GradualBlur';
import Nav from './Nav';
import { Room } from './Sections';
import CaseRoom from './CaseRoom';
import { SETUPS, setupOf, rayProps, sectionFromHash, type SectionId } from './scenes';
import './nova3.css';

/**
 * NOVA III — THE STAGE.
 *
 * One room on screen at a time. Changing room re-gels the light rather than
 * swapping it: a single LightRays instance lives for the life of the page and
 * its colour, angle and spread are animated between setups. Same instrument,
 * re-aimed — which keeps six rooms looking like one site, and avoids rebuilding
 * a WebGL context on every click.
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
    <div className="n3" style={{ ['--accent' as string]: setup.accent }}>
      {/* ---- the light: one instance, re-gelled ---- */}
      <div className="n3-lights" aria-hidden>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <LightRays {...(rayProps(setup) as any)} />
        <div className="n3-scrim" style={{ opacity: setup.scrim }} />
        {/*
          Grain and vignette are constant across every room. They are the two
          things binding the setups into one site — the same reason film looks
          like film across scenes that share nothing else.
        */}
        <div className="n3-grain" />
        <div className="n3-vig" />
      </div>

      <GradualBlur position="bottom" height="6rem" strength={1.3} divCount={5} exponential opacity={0.85} zIndex={4} />

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
