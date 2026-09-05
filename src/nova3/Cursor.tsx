import TargetCursor from '@/reactbits/TargetCursor';
import Crosshair from '@/reactbits/Crosshair';
import BlobCursor from '@/reactbits/BlobCursor';
import Ribbons from '@/reactbits/Ribbons';
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

    case 'ribbons':
      return (
        <div className="n3-cursor-layer">
          <Ribbons
            colors={[accent]}
            baseThickness={22}
            speedMultiplier={0.4}
            maxAge={420}
            enableFade
            enableShaderEffect
            effectAmplitude={1.6}
          />
        </div>
      );

    case 'splash':
      return (
        <div className="n3-cursor-layer">
          <SplashCursor
            SPLAT_RADIUS={0.14}
            SPLAT_FORCE={4200}
            DENSITY_DISSIPATION={4.2}
            VELOCITY_DISSIPATION={2.4}
            CURL={2}
            COLOR_UPDATE_SPEED={6}
            TRANSPARENT
          />
        </div>
      );

    default:
      return null;
  }
}
