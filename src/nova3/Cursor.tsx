import TargetCursor from '@/reactbits/TargetCursor';
import Crosshair from '@/reactbits/Crosshair';
import BlobCursor from '@/reactbits/BlobCursor';
import MagnetLines from '@/reactbits/MagnetLines';
import SplashCursor from '@/reactbits/SplashCursor';
import type { CursorId } from './theme';

/**
 * The cursor layer.
 *
 * THE HAND-WRITTEN ONES ARE GONE
 * Dot, Ring, Trail, Blade and Halo were all the same idea — an element chased
 * after the pointer in a rAF loop — and that idea has a ceiling: the real
 * pointer is drawn by the compositor and is never late, so anything drawn in
 * JavaScript is at least a frame behind it. At that point a follower is only
 * as good as the excuse it has for lagging, and five variations on "a small
 * shape, slightly behind" is four too many.
 *
 * These five have real reasons to exist. Crosshair and Target respond to what
 * you are pointing AT rather than merely following. Blob, Ribbons and Splash
 * are made of the lag: the trailing is the effect, so being behind the pointer
 * is what they are for rather than what is wrong with them.
 *
 * WHAT EACH ONE COSTS, since these are not all the same weight:
 *   Crosshair, Target, Blob   GSAP and DOM. Cheap.
 *   Ribbons                   one WebGL context (ogl).
 *   Splash                    a live fluid simulation. Beautiful, and by far
 *                             the most expensive thing on the site — worth
 *                             knowing before it becomes the default.
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

    case 'blob':
      return (
        <div className="n3-cursor-layer">
          <BlobCursor
            blobType="circle"
            fillColor={accent}
            trailCount={3}
            sizes={[42, 76, 52]}
            innerSizes={[14, 26, 18]}
            innerColor="rgba(255,253,249,0.85)"
            opacities={[0.35, 0.3, 0.28]}
            shadowColor="rgba(23,20,15,0.18)"
            shadowBlur={6}
            shadowOffsetX={4}
            shadowOffsetY={6}
            filterStdDeviation={22}
            fastDuration={0.12}
            slowDuration={0.42}
            zIndex={90}
          />
        </div>
      );

    case 'lines':
      return (
        <div className="n3-cursor-layer n3-cursor-lines">
          {/*
            A field of rules that all turn to point at the pointer. It is the
            only option here that is not a follower at all — nothing chases
            anything, so there is no lag to hide, and the whole viewport
            responds rather than one shape near your hand.
          */}
          <MagnetLines
            rows={10}
            columns={16}
            containerSize="100%"
            lineColor={accent}
            lineWidth="1.5px"
            lineHeight="20px"
            baseAngle={-10}
          />
        </div>
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
