import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Hexagon } from 'lucide-react';
import { CHAPTERS, CHAPTER_OFFSETS, TRACKS, timecode, trackOf } from './chapters';
import { useFilm } from './FilmContext';
import BackgroundPicker from './BackgroundPicker';
import { profile } from '@/data/content';

/**
 * The navigation is an edit timeline, not a nav bar.
 *
 * Chapter segments are proportional to their real scroll length, the playhead
 * tracks scroll position, and the bar is draggable — so the guided path (just
 * scroll) and free roam (grab the playhead, or click a chapter) are the same
 * control. Timecode runs at 24fps against a nominal runtime.
 */
export default function Timeline({
  preset,
  onPreset,
}: {
  preset: string;
  onPreset: (id: string) => void;
}) {
  const { progress, index, seek, goToChapter, past } = useFilm();
  const barRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState<number | null>(null);

  const fractionFromEvent = useCallback((clientX: number) => {
    const el = barRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  }, []);

  // Drag anywhere on the bar to scrub.
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => seek(fractionFromEvent(e.clientX), true);
    const up = () => setDragging(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [dragging, seek, fractionFromEvent]);

  // Arrow keys step chapters when the bar has focus.
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToChapter(Math.min(CHAPTERS.length - 1, index + 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToChapter(Math.max(0, index - 1));
    }
  };

  const active = CHAPTERS[index];
  const track = trackOf(index);

  /** Centre of a track, as a fraction of the whole film. */
  const total = CHAPTERS.reduce((n, c) => n + c.length, 0);
  const trackMid = (i: number) =>
    CHAPTER_OFFSETS[TRACKS[i].index] + TRACKS[i].length / 2 / total;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-50 transition-all duration-500 ${
        past ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="pointer-events-auto border-t border-white/12 bg-[#0a0a0a]/70 backdrop-blur-2xl">
        {/* Tighter gutters on a phone, so the scrubber keeps its width now that
            the resume control sits in this row too. */}
        <div className="nova-shell flex items-center gap-3 pb-8 pt-3 sm:gap-5">
          {/* Identity + resume, kept out of the scrub area */}
          <button
            type="button"
            onClick={() => seek(0)}
            className="cursor-target hidden shrink-0 items-center gap-2 text-white sm:flex"
            aria-label={`${profile.name} — back to titles`}
          >
            <Hexagon size={18} strokeWidth={1.5} />
            <span className="text-sm font-medium tracking-tight">{profile.brand}</span>
          </button>

          {/* Timecode */}
          <span className="shrink-0 font-mono text-[11px] tabular-nums tracking-[0.14em] text-white/85">
            {timecode(progress)}
          </span>

          {/* The scrubber */}
          <div className="relative min-w-0 flex-1">
            <div
              ref={barRef}
              role="slider"
              tabIndex={0}
              aria-label="Film timeline"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              aria-valuetext={`${active.scene} — ${active.label}`}
              onKeyDown={onKey}
              onPointerDown={(e) => {
                e.preventDefault();
                setDragging(true);
                seek(fractionFromEvent(e.clientX), true);
              }}
              onPointerMove={(e) => {
                const f = fractionFromEvent(e.clientX);
                let i = 0;
                TRACKS.forEach((t, k) => {
                  if (f >= CHAPTER_OFFSETS[t.index]) i = k;
                });
                setHover(i);
              }}
              onPointerLeave={() => setHover(null)}
              className="group relative h-9 cursor-ew-resize select-none"
            >
              {/* Chapter segments — one bar per track */}
              <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 gap-[3px]">
                {TRACKS.map((t, i) => {
                  const on = i === track;
                  const lit = hover === i;
                  return (
                    <span
                      key={t.label + i}
                      style={{ flexGrow: t.length, flexBasis: 0 }}
                      className={`h-[3px] rounded-full transition-all duration-300 ${
                        on
                          ? 'bg-white'
                          : lit
                            ? 'bg-white/55'
                            : i < track
                              ? 'bg-white/35'
                              : 'bg-white/15'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Playhead */}
              <span
                className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${progress * 100}%` }}
              >
                <span className="block h-4 w-[2px] bg-white shadow-[0_0_12px_rgba(255,255,255,0.85)]" />
              </span>

              {/* Hover scene tag */}
              {hover !== null && (
                <span
                  className="pointer-events-none absolute -top-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/20 bg-[#0a0a0a]/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-white backdrop-blur-md"
                  style={{ left: `${trackMid(hover) * 100}%` }}
                >
                  {TRACKS[hover].label}
                </span>
              )}
            </div>

            {/*
              The labels.

              Same array and the same flexGrow as the bars above, so each label
              is the box its bar occupies — they cannot fall out of step, which
              is what made the playhead sit over one year while the label under
              it read another.
            */}
            {/*
              Phones get one readable label instead of nine truncated ones. The
              chip row collapsed to "T… 2… 2.." at this width, which is worse
              than no labels at all — it read as a rendering fault.
            */}
            <span className="absolute inset-x-0 top-full block pt-1.5 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-white/60 md:hidden">
              {active.scene} · {active.label}
            </span>

            <div className="absolute inset-x-0 top-full hidden items-stretch gap-[3px] md:flex">
              {TRACKS.map((t, i) => (
                <button
                  key={t.label + i}
                  type="button"
                  onClick={() => goToChapter(t.index)}
                  style={{ flexGrow: t.length, flexBasis: 0, minWidth: 0 }}
                  className={`truncate rounded px-0.5 py-1 text-center font-mono text-[9px] uppercase tracking-[0.12em] transition-colors duration-300 ${
                    i === track ? 'text-white' : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Current scene marker */}
          <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.15em] text-white/55 md:block">
            {active.scene}
          </span>

          <BackgroundPicker value={preset} onChange={onPreset} />

          {/*
            The resume, at every width.

            This used to be `hidden sm:inline-flex` — the one thing a recruiter
            came for, dropped on exactly the device most of them arrive on. The
            label is what actually doesn't fit at 390px, not the control, so
            the label is what goes: a phone gets the download glyph in the same
            white pill, sized as a proper 36px touch target, and the word comes
            back as soon as there is room for it.
          */}
          <a
            href={profile.resumeUrl}
            download
            aria-label={`Download ${profile.name}'s resume`}
            className="cursor-target inline-flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-white text-xs font-medium text-black transition-colors duration-300 hover:bg-white/85 sm:h-auto sm:w-auto sm:px-4 sm:py-2"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Resume</span>
          </a>
        </div>
      </div>
    </div>
  );
}
