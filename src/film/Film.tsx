import { useMemo } from 'react';
import { CHAPTERS, TOTAL_LENGTH, chapterLocal } from './chapters';
import { useFilm } from './FilmContext';
import TitleShot from './shots/TitleShot';
import RoleShot from './shots/RoleShot';
import ReelShot from './shots/ReelShot';
import ToolkitShot from './shots/ToolkitShot';
import EndShot from './shots/EndShot';

/**
 * A chapter's frame. Always in the DOM, always `absolute inset-0`, so its
 * contents can appear, disappear or resize without moving anything else.
 */
function Frame({
  index,
  children,
}: {
  index: number;
  children: (local: number) => React.ReactNode;
}) {
  const { progress } = useFilm();
  const local = chapterLocal(progress, index);

  // Cross-fade shoulders either side of the chapter's own span.
  const IN = 0.16;
  const OUT = 0.16;
  let opacity = 0;
  if (local > -IN && local < 1 + OUT) {
    if (local < 0) opacity = 1 + local / IN;
    else if (local > 1) opacity = 1 - (local - 1) / OUT;
    else opacity = 1;
  }

  const near = local > -0.6 && local < 1.6;
  if (!near) return <div className="pointer-events-none absolute inset-0" aria-hidden />;

  /*
   * Continuous drift across the WHOLE chapter.
   *
   * This is the fix for "one scroll has no effect". Every shot's own entrance
   * finishes in the first quarter of its chapter, so past that point scrolling
   * changed nothing on screen and the page read as frozen. This binds a slow
   * vertical drift to `local` over its entire 0→1 range, so there is no scroll
   * position anywhere in the film where input produces no movement.
   *
   * 72px over ~8 wheel notches is about 9px a notch — under the threshold where
   * it reads as the content sliding around, over the threshold where the eye
   * registers that something answered.
   */
  const clamped = Math.max(0, Math.min(1, local));
  // Anchored at zero, not centred: a chapter opens exactly where it was
  // designed to sit and lifts away as you scroll through it. Centring the
  // drift pushed every shot's resting state 36px below its intended position.
  const drift = -clamped * 72;

  return (
    <div
      className="absolute inset-0"
      style={{
        opacity,
        pointerEvents: opacity > 0.55 ? 'auto' : 'none',
        // A whisper of push/pull so cuts have depth, plus the drift above.
        transform:
          `translate3d(0, ${drift}px, 0) ` +
          `scale(${1 + (local < 0 ? local * 0.06 : local > 1 ? (local - 1) * -0.05 : 0)})`,
        willChange: 'transform',
      }}
      aria-hidden={opacity < 0.5}
    >
      {children(clamped)}
    </div>
  );
}

export default function Film() {
  const { registerTrack } = useFilm();

  const shots = useMemo(
    () =>
      CHAPTERS.map((c, i) => (
        <Frame key={c.id} index={i}>
          {(local) => {
            switch (c.kind) {
              case 'title':
                return <TitleShot local={local} />;
              case 'role':
                return <RoleShot chapter={c} local={local} />;
              case 'reel':
                return <ReelShot local={local} />;
              case 'toolkit':
                return <ToolkitShot local={local} />;
              case 'end':
                return <EndShot local={local} />;
              default:
                return null;
            }
          }}
        </Frame>
      )),
    []
  );

  return (
    <div
      ref={registerTrack}
      id="film"
      className="relative"
      style={{ height: `${TOTAL_LENGTH * 100}svh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden supports-[height:100svh]:h-[100svh]">
        {shots}
      </div>
    </div>
  );
}
