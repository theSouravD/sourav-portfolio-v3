import { useCallback, useEffect, useRef, useState } from 'react';
import GradualBlur from '@/reactbits/GradualBlur';
import Nav from './Nav';
import { Room } from './Sections';
import { SCENES, sceneOf, sectionFromHash, type SectionId } from './scenes';
import './nova3.css';

/**
 * NOVA III — THE STAGE.
 *
 * One room on screen at a time, and changing room is a lighting change: the
 * outgoing scene's WebGL background cross-fades out while the incoming one
 * fades up, and the content cuts between them.
 *
 * WHY BOTH BACKGROUNDS ARE MOUNTED DURING A CHANGE
 * Each of these scenes is a live shader. Swapping one component for another
 * tears down a WebGL context and builds a new one, which drops frames exactly
 * when the visitor is looking at the transition. So the outgoing scene stays
 * mounted for the length of the fade and is unmounted after — you pay for two
 * contexts for six hundred milliseconds instead of paying for a stall.
 *
 * WHY THE CONTENT CUTS BUT THE LIGHT DISSOLVES
 * That is how the change is edited. A cut on the content keeps the site quick
 * to use; a dissolve on the light is what makes the quickness feel directed
 * rather than abrupt. Doing both as a dissolve feels slow, and both as a cut
 * feels like a slideshow.
 */
export default function Stage() {
  const [id, setId] = useState<SectionId>('home');
  const [outgoing, setOutgoing] = useState<SectionId | null>(null);
  const [ready, setReady] = useState(false);
  const fadeTimer = useRef(0);

  const scene = sceneOf(id);
  const prev = outgoing ? sceneOf(outgoing) : null;

  const go = useCallback((next: SectionId) => {
    setId((current) => {
      if (current === next) return current;
      setOutgoing(current);
      window.clearTimeout(fadeTimer.current);
      // Matches the CSS fade. Held in one place so the two can't drift.
      fadeTimer.current = window.setTimeout(() => setOutgoing(null), 700);
      if (window.location.hash !== `#${next}`) {
        window.history.pushState(null, '', `#${next}`);
      }
      return next;
    });
  }, []);

  /* The back button, and shared links, both have to work. A site where the
     browser's own controls do nothing is not dummy-proof whatever its nav
     looks like. */
  useEffect(() => {
    setId(sectionFromHash());
    setReady(true);
    const onPop = () => setId(sectionFromHash());
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
      window.clearTimeout(fadeTimer.current);
    };
  }, []);

  /* Arrow keys walk the rooms — a keyboard shortcut for people who want one,
     never the only way to do anything. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea')) return;
      const i = SCENES.findIndex((s) => s.id === id);
      if (e.key === 'ArrowRight') go(SCENES[(i + 1) % SCENES.length].id);
      if (e.key === 'ArrowLeft') go(SCENES[(i - 1 + SCENES.length) % SCENES.length].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, go]);

  const Bg = scene.Bg;
  const PrevBg = prev?.Bg;

  return (
    <div className="n3" data-room={id}>
      {/* ---- the light ---- */}
      <div className="n3-lights" aria-hidden>
        {PrevBg && (
          <div className="n3-light is-out" key={`${outgoing}-out`}>
            <PrevBg {...prev!.props} />
          </div>
        )}
        <div className="n3-light is-in" key={id}>
          <Bg {...scene.props} />
        </div>
        {/* The scrim is per-room: a bright scene needs more of it before type
            will hold, and guessing one value for all six leaves half the site
            either washed out or murky. */}
        <div className="n3-scrim" style={{ opacity: scene.scrim }} />
      </div>

      {/* A soft fall-off at the foot of the screen, so content leaves the
          frame rather than stopping at it. */}
      <GradualBlur position="bottom" height="7rem" strength={1.4} divCount={5} exponential opacity={0.9} zIndex={4} />

      <Nav active={id} onGo={go} accent={scene.accent} />

      <main className={`n3-stage ${ready ? 'is-ready' : ''}`} key={id}>
        <Room id={id} onGo={go} accent={scene.accent} />
      </main>

      {/* The room's own caption, bottom left — the one piece of film language
          kept from Nova I, because it told you where you were without asking
          you to read a menu. */}
      <p className="n3-slug">
        <span style={{ background: scene.accent }} />
        {scene.label} — {scene.note}
      </p>
    </div>
  );
}
