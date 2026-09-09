import TargetCursor from '@/reactbits/TargetCursor';
import Crosshair from '@/reactbits/Crosshair';
import SplashCursor from '@/reactbits/SplashCursor';
import type { CursorId } from './theme';

/**
 * The cursor layer. Three effects, down from ten.
 *
 * The five hand-written ones went first — Dot, Ring, Trail, Blade and Halo
 * were one idea repeated, an element chasing the pointer in a rAF loop, and
 * that idea has a ceiling: the real pointer is drawn by the compositor and is
 * never late, so anything drawn in JavaScript is at least a frame behind it.
 *
 * Blob and Lines have now gone as well. Both worked; neither belonged. A
 * gooey ball trailing the hand and a field of rules swivelling to face it are
 * effects that announce themselves, and on a site whose argument is restraint
 * that reads as a tour of a component library rather than as a decision.
 *
 * What remains responds to the page instead of performing over it — Crosshair
 * and Target register what you are pointing AT — plus Splash, which is kept
 * because it is genuinely beautiful and honestly labelled.
 *
 * WHAT EACH ONE COSTS, since these are not the same weight:
 *   Crosshair, Target   GSAP and DOM. Cheap.
 *   Splash              a live fluid simulation. By far the most expensive
 *                       thing on the site — worth knowing before choosing it.
 *
 * All of them are pointer-only. A cursor effect is meaningless on touch, and
 * hiding the system pointer there would leave nothing at all, so the whole
 * layer sits behind a `pointer: fine` check.
 */
export default function Cursor({ mode, accent }: { mode: CursorId; accent: string }) {
  if (mode === 'system') return null;
  if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) {
    return null;
  }

  switch (mode) {
    case 'crosshair':
      return (
        <div className="n3-cursor-layer">
          <Crosshair color={accent} />
        </div>
      );

    case 'target':
      return (
        <TargetCursor
          targetSelector="button, a, .n3-link"
          spinDuration={6}
          hideDefaultCursor
          cursorColor={accent}
        />
      );

    case 'splash':
      return (
        <div className="n3-cursor-layer">
          {/*
            Rainbow mode off and the room's accent in its place — the default
            picks a random hue per splat, which on a graded site means the one
            element on screen that ignores the grade entirely. `key` on the
            accent forces a remount when the room changes: the colour is read
            once when the simulation initialises, so without it the fluid
            keeps the previous room's gel until you reload.
          */}
          <SplashCursor
            key={accent}
            RAINBOW_MODE={false}
            COLOR={accent}
            SPLAT_RADIUS={0.16}
            SPLAT_FORCE={4200}
            DENSITY_DISSIPATION={4.6}
            VELOCITY_DISSIPATION={2.6}
            CURL={1.5}
            TRANSPARENT
          />
        </div>
      );

    default:
      return null;
  }
}
