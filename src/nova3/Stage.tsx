import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Backdrop from './Backdrop';
import BackdropPicker from './BackdropPicker';
import Nav from './Nav';
import { Room } from './Sections';
import CaseRoom from './CaseRoom';
import { SETUPS, setupOf, sectionFromHash, type SectionId } from './scenes';
import {
  readBackdrop, readTexture, saveBackdrop, saveTexture,
  type BackdropId, type TextureId,
} from './backdrops';
import { useSwipeRooms } from './useSwipeRooms';
import { cue, initSound } from './titleSound';
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
  const hoverRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);

  /* The chosen ground. Read lazily so the stored value is fetched once, on
     the first render, rather than on every one. */
  const [backdrop, setBackdrop] = useState<BackdropId>(readBackdrop);
  const [texture, setTexture] = useState<TextureId>(readTexture);
  const pickBackdrop = useCallback((b: BackdropId) => { setBackdrop(b); saveBackdrop(b); }, []);
  const pickTexture = useCallback((t: TextureId) => { setTexture(t); saveTexture(t); }, []);

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
      cue('move');
      setCutting(true);
      window.clearTimeout(cutTimer.current);
      cutTimer.current = window.setTimeout(() => setCutting(false), 170);
      return next;
    });
    setCaseSlug(slug);
    const hash = slug ? `#case/${slug}` : `#${next}`;
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
  }, [caseSlug]);

  /*
   * A room opens at its top, the way turning to a page does.
   *
   * This used to run inside `go`, which is too early: at that moment the
   * outgoing room is still mounted, so it scrolled the OLD content to zero
   * and the new one arrived at whatever offset the browser felt like. Doing
   * it in a layout effect keyed on the room means it runs after the new
   * content is in the DOM and before the browser paints, so there is no
   * visible jump.
   */
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    el.scrollTo({ top: 0 });
    // Reset via the setter's callback form rather than unconditionally: the
    // flag is almost always already false here, and setting it anyway would
    // schedule a render on every single room change for nothing.
    setScrolled((v) => (v ? false : v));
  }, [id, caseSlug]);

  /* The bar only lifts once something is actually underneath it. */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 6);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  /* The back button and shared links both have to work. A site where the
     browser's own controls do nothing is not dummy-proof, whatever the nav
     looks like. */
  /* Audio arms itself on the first real gesture anywhere — see titleSound. */
  useEffect(() => { initSound(); }, []);

  /*
   * Interface sound is delegated rather than wired per component: one listener
   * on the root reads what was actually clicked or hovered. Threading an
   * onClick through forty buttons to play a tick would mean forty places to
   * forget one, and every new control would start silent.
   */
  useEffect(() => {
    const root = document.querySelector('.n3');
    if (!root) return;
    const hit = (e: Event) => (e.target as HTMLElement)?.closest?.('button, a, .n3-link');
    const onDown = (e: Event) => { if (hit(e)) cue('tap'); };
    const onOver = (e: Event) => {
      const el = hit(e);
      // `pointerover` fires again for every child element under the cursor,
      // so without this the tick repeats as the pointer crosses an icon
      // inside the button it is already on.
      if (el && el !== hoverRef.current) { hoverRef.current = el as HTMLElement; cue('hover'); }
      if (!el) hoverRef.current = null;
    };
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointerover', onOver);
    return () => {
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointerover', onOver);
    };
  }, []);

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
    <div className={`n3 ${scrolled ? 'is-scrolled' : ''}`} style={{ ['--accent' as string]: setup.accent, ['--wash' as string]: setup.wash }}>
      {/* ---- the wash: one instance, re-gelled ---- */}
      <div className="n3-lights" aria-hidden>
        <Backdrop id={backdrop} setup={setup} />
        {/*
          The shaders' light mode paints down from pure #ffffff, and pure white
          is what a template looks like. One multiply of the paper stock over
          it warms the ground and the gel together — the same as printing the
          image on cream rather than recolouring every pixel of it.
        */}
        <div className="n3-paper" />
        {texture !== 'none' && <div className="n3-grain" />}
        {texture === 'full' && <div className="n3-tooth" />}
        <div className="n3-vig" />
      </div>

      <Nav active={id} onGo={(next) => go(next)} />

      <main ref={stageRef} className={`n3-stage ${cutting ? 'is-cutting' : ''}`}>
        <div key={caseSlug ?? id} className="n3-cut">
          {caseSlug
            ? <CaseRoom slug={caseSlug} onBack={() => go('systems')} />
            : <Room id={id} onGo={go} />}
        </div>
      </main>

      <BackdropPicker
        backdrop={backdrop}
        texture={texture}
        onBackdrop={pickBackdrop}
        onTexture={pickTexture}
      />

      <p className="n3-slug">
        <span />
        {caseSlug ? 'Systems — case study' : `${setup.label} — ${setup.note}`}
      </p>
    </div>
  );
}
