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

  return (
    <div
      className="absolute inset-0"
      style={{
        opacity,
        pointerEvents: opacity > 0.55 ? 'auto' : 'none',
        // A whisper of push/pull so cuts have depth without moving layout.
        transform: `scale(${1 + (local < 0 ? local * 0.06 : local > 1 ? (local - 1) * -0.05 : 0)})`,
      }}
      aria-hidden={opacity < 0.5}
    >
      {children(Math.max(0, Math.min(1, local)))}
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
