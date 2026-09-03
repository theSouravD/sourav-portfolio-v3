import { useEffect, useMemo, useRef, useState } from 'react';
import { useIsMobile } from '@/lib/useViewport';
import { Play, ArrowUpRight, FileText, ArrowDown, ArrowRight } from 'lucide-react';
import Lightbox from '@/components/Lightbox';
import Poster from '@/components/Poster';
import { automationProjects, portfolioWork } from '@/data/work';
import type { MediaItem } from '@/data/work';
import { workScene } from '@/data/content';

const ease = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);

type Tile =
  | { kind: 'case'; key: string; slug: string; title: string; tool: string; thumbnail: string }
  | { kind: 'media'; key: string; item: MediaItem };

/**
 * The strip runs three different kinds of work past you and, unlabelled, they
 * blur into one long row. A marker board opens each run — the way a reel is
 * split by leader — so it is obvious which stretch you are in.
 */
type Marker = { kind: 'marker'; key: string; label: string; note: string; count: number };
type Cell = Tile | Marker;

/**
 * SC 07 — the reel.
 *
 * Vertical scroll runs the strip horizontally. The strip lives inside the
 * stage's fixed frame and is translated, never resized, so opening the player
 * or resizing the window cannot disturb anything above or below it.
 */
export default function ReelShot({ local }: { local: number }) {
  const [active, setActive] = useState<MediaItem | null>(null);
  const isMobile = useIsMobile();

  /*
   * A sideways gesture here is the wrong one — the strip is driven by vertical
   * scroll. Rather than ignore it, catch it and light up the line that says so.
   * Detectable because a trackpad swipe arrives as a wheel event with deltaX.
   */
  const [wrongWay, setWrongWay] = useState(false);
  const wrongTimer = useRef(0);
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 6) return;
      setWrongWay(true);
      clearTimeout(wrongTimer.current);
      wrongTimer.current = window.setTimeout(() => setWrongWay(false), 2400);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      clearTimeout(wrongTimer.current);
    };
  }, []);

  const { cells, tileCount } = useMemo(() => {
    const cases: Tile[] = automationProjects.map((p) => ({
      kind: 'case',
      key: `c-${p.slug}`,
      slug: p.slug,
      title: p.title,
      tool: p.tool,
      thumbnail: p.thumbnail,
    }));
    const direction: Tile[] = (portfolioWork.direction as MediaItem[]).map((item) => ({
      kind: 'media',
      key: `d-${item.id}`,
      item,
    }));
    const ai: Tile[] = (portfolioWork.ai as MediaItem[]).map((item) => ({
      kind: 'media',
      key: `a-${item.id}`,
      item,
    }));

    const out: Cell[] = [
      { kind: 'marker', key: 'mk-wf', label: 'Automation Workflows', note: 'Systems, not clips — each opens a written breakdown', count: cases.length },
      ...cases,
      { kind: 'marker', key: 'mk-dir', label: 'Creative Direction', note: 'Campaign and trailer work', count: direction.length },
      ...direction,
      { kind: 'marker', key: 'mk-ai', label: 'AI Ads and Motion', note: 'Generated and edited at production scale', count: ai.length },
      ...ai,
    ];
    return { cells: out, tileCount: cases.length + direction.length + ai.length };
  }, []);

  const head = ease(local / 0.14);
  const out = Math.max(0, (local - 0.9) / 0.1);

  /*
   * The strip moves from the first pixel of the chapter.
   *
   * There used to be a 26% hold here — 11 wheel notches during which scrolling
   * did nothing at all. It was meant to stop the workflow cards flying past,
   * but the real problem was that the chapter was too long, not that it started
   * too early. The chapter is now 2.6vh instead of 4.5, so the cards are
   * readable without freezing the page to achieve it.
   *
   * A small lead-in remains so the heading can land, and the travel is eased at
   * both ends rather than starting at full pace.
   */
  const raw = Math.max(0, Math.min(1, (local - 0.06) / 0.82));
  const run = raw * raw * (3 - 2 * raw);

  /*
   * Axis follows the device.
   *
   * A 320px tile does not fit a 390px phone, and asking a thumb to drive
   * horizontal travel with a vertical swipe is the single least intuitive thing
   * this page did. On a phone the same scroll-driven strip runs on Y with
   * full-width tiles, so the gesture and the motion finally point the same way.
   */
  const TILE = isMobile ? 268 : 320;   // tile extent along the travel axis
  const MARKER = isMobile ? 150 : 210;
  const GAP = isMobile ? 14 : 20;
  const extent = (c: Cell) => (c.kind === 'marker' ? MARKER : TILE);
  const strip = cells.reduce((n, c) => n + extent(c) + GAP, 0);
  const viewport = isMobile ? 520 : 900;
  const shift = run * Math.max(0, strip - viewport);
  const at = Math.min(tileCount, Math.floor(run * tileCount) + 1);

  return (
    <>
      <div className="flex h-full flex-col justify-center pb-28 pt-24">
        <div
          className="nova-shell mb-7 flex flex-wrap items-end justify-between gap-5"
          style={{ opacity: head * (1 - out), transform: `translateY(${(1 - head) * 20}px)` }}
        >
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
              SC 07 · The Reel
            </span>
            <h2 className="mt-3 text-[clamp(2rem,4.6vw,3.6rem)] font-normal leading-[1.05] tracking-[-0.03em] text-white">
              Selected Work
            </h2>
          </div>
          <div className="max-w-sm md:text-right">
            <p className="text-sm leading-relaxed text-white/65">{workScene.intro}</p>
            {/*
              The one place the page breaks the vertical convention, so it says
              so out loud. Set as a hairline-ruled mono line — the same language
              as the marker boards in the strip — rather than a floating pill,
              so it reads as part of the scene instead of a notification landing
              on top of it. It brightens if someone tries the wrong gesture.
            */}
            <p
              className="mt-4 flex items-center gap-2.5 border-l-2 py-1 pl-3 font-mono text-[10px] uppercase leading-[1.5] tracking-[0.18em] transition-colors duration-300 md:ml-auto md:w-fit"
              style={{
                borderColor: wrongWay ? '#ffffff' : 'rgba(255,255,255,0.28)',
                color: wrongWay ? '#ffffff' : 'rgba(255,255,255,0.62)',
              }}
            >
              <ArrowDown size={12} className="nova-scroll-hint shrink-0" />
              {wrongWay
                ? 'Scroll down — not sideways'
                : isMobile
                  ? 'Keep scrolling — the reel runs down'
                  : 'Keep scrolling — the strip runs sideways'}
              {!isMobile && !wrongWay && (
                <ArrowRight size={12} className="nova-strip-hint shrink-0" />
              )}
            </p>
          </div>
        </div>

        {/*
          The strip.

          Height is capped on phones. Stacked vertically the cells are one very
          tall column, and inside a `justify-center` stage that column shoved the
          heading clean off the top of the screen. Capping it to the same 520px
          the travel maths already assumes keeps the header, the strip and the
          counter all in frame.
        */}
        <div
          className="relative overflow-hidden"
          style={{ opacity: 1 - out, height: isMobile ? 520 : undefined }}
        >
          <div
            className={
              isMobile
                ? 'flex flex-col gap-3.5 px-5 will-change-transform'
                : 'flex gap-5 pl-[calc((100vw-min(1160px,100vw-3rem))/2)] will-change-transform'
            }
            style={{
              transform: isMobile
                ? `translate3d(0,${-shift}px,0)`
                : `translate3d(${-shift}px,0,0)`,
            }}
          >
            {cells.map((cell, i) => {
              const appear = ease((local - 0.04 - i * 0.003) / 0.14);

              /* ---- Marker board: the leader between runs ---- */
              if (cell.kind === 'marker') {
                return (
                  <div
                    key={cell.key}
                    style={isMobile ? { opacity: appear } : { width: MARKER, opacity: appear }}
                    className="flex shrink-0 flex-col justify-end border-l-2 border-white pb-4 pl-4 md:pb-4"
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
                      {String(cell.count).padStart(2, '0')} pieces
                    </span>
                    <span className="mt-2 block text-[17px] font-medium leading-[1.15] tracking-[-0.01em] text-white">
                      {cell.label}
                    </span>
                    <span className="mt-2 block text-[11px] leading-[1.5] text-white/50">
                      {cell.note}
                    </span>
                  </div>
                );
              }

              const num = String(i).padStart(2, '0');

              /* ---- A clip ---- */
              if (cell.kind === 'media') {
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setActive(cell.item)}
                    style={isMobile ? { opacity: appear } : { width: TILE, opacity: appear }}
                    className="cursor-target group shrink-0 overflow-hidden rounded-xl border border-white/12 bg-white/[0.04] text-left backdrop-blur-xl transition-colors duration-300 hover:border-white/30 hover:bg-white/10"
                  >
                    <span className="relative block aspect-video overflow-hidden bg-black/50">
                      <Poster
                        item={cell.item}
                        className="transition-transform duration-[900ms] group-hover:scale-[1.06]"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/35 bg-black/40 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-white group-hover:bg-white">
                        <Play
                          size={15}
                          className="ml-0.5 fill-white text-white transition-colors duration-300 group-hover:fill-black group-hover:text-black"
                        />
                      </span>
                      <span className="absolute left-3 top-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/60">
                        {num}
                      </span>
                    </span>
                    <span className="block px-4 py-3.5">
                      <span className="block truncate text-sm font-medium text-white/90">
                        {cell.item.title}
                      </span>
                      <span className="mt-1 block truncate font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                        {cell.item.meta}
                      </span>
                    </span>
                  </button>
                );
              }

              /* ---- A workflow. Deliberately the brightest thing in the strip. ---- */
              return (
                <a
                  key={cell.key}
                  href={`#case-${cell.slug}`}
                  style={isMobile ? { opacity: appear } : { width: TILE, opacity: appear }}
                  className="cursor-target group relative shrink-0 overflow-hidden rounded-xl border-2 border-white bg-white/[0.10] backdrop-blur-xl transition-colors duration-300 hover:bg-white/20"
                >
                  <span className="relative block aspect-video overflow-hidden bg-black/50">
                    <Poster
                      src={cell.thumbnail}
                      caption={cell.tool}
                      className="transition-transform duration-[900ms] group-hover:scale-[1.06]"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-sm bg-white px-2 py-1 font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-black">
                      <FileText size={9} strokeWidth={2.5} />
                      Workflow
                    </span>
                  </span>
                  <span className="block px-4 py-3.5">
                    <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-white/70">
                      {cell.tool}
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-white">{cell.title}</span>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-white transition-opacity duration-300 group-hover:opacity-100 opacity-80">
                      Read the case
                      <ArrowUpRight
                        size={12}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Strip counter */}
        <div
          className="nova-shell mt-7 flex items-center gap-4"
          style={{ opacity: head * (1 - out) }}
        >
          <div className="relative h-px flex-1 bg-white/15">
            <span
              className="absolute left-0 top-0 h-px bg-white"
              style={{ width: `${run * 100}%` }}
            />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55 tabular-nums">
            {String(at).padStart(2, '0')} / {String(tileCount).padStart(2, '0')}
          </span>
        </div>
      </div>

      <Lightbox item={active} onClose={() => setActive(null)} />
    </>
  );
}
