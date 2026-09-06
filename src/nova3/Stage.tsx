import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Backdrop from './Backdrop';
import BackdropPicker from './BackdropPicker';
import Nav from './Nav';
import { Room } from './Sections';
import CaseRoom from './CaseRoom';
import { SETUPS, setupOf, sectionFromHash, type SectionId } from './scenes';
import Cursor from './Cursor';
import Loader from './Loader';
import {
  paperAt, readBackdrop, readClick, readCursor, readIntensity, readPaperness,
  readSound, readTexture, save,
  INTENSITY, PAPERNESS,
} from './theme';
import type { ThemeState } from './BackdropPicker';
import { cue, initSound, setClick, setSound } from './titleSound';
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
  const stageRef = useRef<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  /*
   * The opening runs once per page load, not per room. `booted` gates the
   * chrome and the room so nothing appears until the wordmark has landed —
   * and it flips a little BEFORE the flight ends, so the page assembles
   * underneath the mark rather than after it.
   */
  const [booted, setBooted] = useState(false);
  const boot = useCallback(() => setBooted(true), []);

  /*
   * Everything the theme centre controls, in one object.
   *
   * Read lazily so storage is touched once on the first render rather than on
   * every one, and written as a patch so a new option needs no new setter —
   * the panel says what changed and this persists it generically.
   */
  const [theme, setTheme] = useState<ThemeState>(() => ({
    backdrop: readBackdrop(),
    texture: readTexture(),
    sound: readSound(),
    click: readClick(),
    cursor: readCursor(),
    intensity: readIntensity(),
    paperness: readPaperness(),
  }));

  const patchTheme = useCallback((patch: Partial<ThemeState>) => {
    setTheme((cur) => {
      const next = { ...cur, ...patch };
      for (const [k, v] of Object.entries(patch)) {
        if (k === 'sound') continue; // setSound persists it and ramps the bus
        save(k, v as string | number);
      }
      if (patch.sound !== undefined) setSound(patch.sound);
      if (patch.click) setClick(patch.click);
      return next;
    });
  }, []);

  const resetTheme = useCallback(() => {
    const d: ThemeState = {
      backdrop: 'wash', texture: 'fine', sound: true, click: 'hollow',
      cursor: 'system', intensity: INTENSITY.def, paperness: PAPERNESS.def,
    };
    setTheme(d);
    for (const [k, v] of Object.entries(d)) if (k !== 'sound') save(k, v as string | number);
    setSound(d.sound);
    setClick(d.click);
  }, []);

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
    root.addEventListener('pointerdown', onDown);
    return () => root.removeEventListener('pointerdown', onDown);
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
    <div
      className={`n3 ${scrolled ? 'is-scrolled' : ''} ${booted ? 'is-booted' : ''}`}
      style={{
        ['--accent' as string]: setup.accent,
        ['--wash' as string]: setup.wash,
        /* The paper slider rewrites the ground token, so every surface that
           is built from it — cards, the bar, the picker — moves with it and
           nothing has to be told about the change. */
        ['--paper' as string]: paperAt(theme.paperness / 100),
      }}
    >
      {/* ---- the wash: one instance, re-gelled ---- */}
      <div className="n3-lights" aria-hidden>
        <Backdrop id={theme.backdrop} setup={setup} k={theme.intensity / 100} />
        {/*
          The shaders' light mode paints down from pure #ffffff, and pure white
          is what a template looks like. One multiply of the paper stock over
          it warms the ground and the gel together — the same as printing the
          image on cream rather than recolouring every pixel of it.
        */}
        <div className="n3-paper" />
        {theme.texture !== 'none' && <div className="n3-grain" />}
        {theme.texture === 'full' && <div className="n3-tooth" />}
        <div className="n3-vig" />
      </div>

      {/*
        The theme control lives in the bar next to Resume rather than floating
        in a corner. A settings affordance belongs with the other chrome; on
        its own over the page it read as a stray element, and on Contact it
        sat on top of the content.
      */}
      <Nav
        active={id}
        onGo={(next) => go(next)}
        themeControl={
          <BackdropPicker state={theme} onChange={patchTheme} onReset={resetTheme} />
        }
      />

      <main ref={stageRef} className={`n3-stage ${cutting ? 'is-cutting' : ''}`}>
        <div key={caseSlug ?? id} className="n3-cut">
          {booted && (caseSlug
            ? <CaseRoom slug={caseSlug} onBack={() => go('systems')} />
            : <Room id={id} onGo={go} />)}
        </div>
      </main>

      <Cursor mode={theme.cursor} accent={setup.accent} />

      {/*
        Mounted unconditionally, and it removes itself by rendering null once
        the sequence is over. Gating this on `!booted` was a bug with a very
        specific symptom: `boot` fires deliberately BEFORE the flight lands, so
        the room can assemble underneath the travelling mark — which meant the
        gate tore the loader out roughly a third of the way through its own
        flight, and the wordmark blinked out in mid-air instead of arriving.
      */}
      <Loader onDone={boot} />

      <p className="n3-slug">
        <span />
        {caseSlug ? 'Systems — case study' : `${setup.label} — ${setup.note}`}
      </p>
    </div>
  );
}
