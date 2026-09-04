import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
   * this page did. On a phone the same scroll-driven strip runs on Y, so the
   * gesture and the motion finally point the same way.
   *
   * WHY THE PHONE CELL IS A ROW, NOT A CARD
   * It used to be the desktop card at full width: a 16:9 still with the label
   * underneath, about 268px tall. Two consequences, and they were the two
   * complaints. Only about one and a half of them fitted on screen at once, so
   * there was never enough on screen to read as a *strip* of work — it looked
   * like one picture that kept being replaced. And 37 of them make a column
   * about 10,000px long, which has to be crossed inside the chapter's ~4,600px
   * of scrolling: the strip moved at more than twice the speed of the thumb
   * pushing it.
   *
   * Laid out as a row — thumbnail beside the title — a cell is ~96px. Four or
   * five are visible at once, so it reads as a list you are travelling through,
   * and the whole column is ~4,300px, which is slightly *less* than the scroll
   * available. The strip now moves a little slower than the finger rather than
   * twice as fast.
   */
  const TILE = isMobile ? 96 : 320;   // cell extent along the travel axis
  const MARKER = isMobile ? 76 : 210;
  const GAP = isMobile ? 12 : 20;
  const extent = (c: Cell) => (c.kind === 'marker' ? MARKER : TILE);
  const strip = cells.reduce((n, c) => n + extent(c) + GAP, 0);

  /*
   * The frame measures itself on phones instead of assuming a number.
   *
   * The old 520px constant was both the height the strip was given and the
   * height the travel maths subtracted, but it was never what the frame
   * actually got — the header and the counter take whatever they need first, so
   * on a small phone the strip was handed less than 520 and the last cells
   * could never be reached. Measuring closes that gap and makes the maths
   * correct on every screen size.
   */
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameH, setFrameH] = useState(0);
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setFrameH(el.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const viewport = isMobile ? frameH || 440 : 900;
  const shift = run * Math.max(0, strip - viewport);
  const at = Math.min(tileCount, Math.floor(run * tileCount) + 1);

  return (
    <>
      {/* `min-h-0` so the strip below can be a flex child that shrinks rather
          than one that pushes the header off the top of a phone. */}
      <div className="flex h-full min-h-0 flex-col justify-center pb-24 pt-16 md:pb-28 md:pt-24">
        <div
          className="nova-shell mb-5 flex flex-wrap items-end justify-between gap-5 md:mb-7"
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
            {/* Hidden on phones. It costs about 60px of the strip's frame and
                says what the three marker boards in the strip say anyway. */}
            <p className="hidden text-sm leading-relaxed text-white/65 md:block">
              {workScene.intro}
            </p>
            {/*
              The one place the page breaks the vertical convention, so it says
              so out loud. Set as a hairline-ruled mono line — the same language
              as the marker boards in the strip — rather than a floating pill,
              so it reads as part of the scene instead of a notification landing
              on top of it. It brightens if someone tries the wrong gesture.
            */}
            <p
              className="mt-2 flex items-center gap-2.5 border-l-2 py-1 pl-3 font-mono text-[10px] uppercase leading-[1.5] tracking-[0.18em] transition-colors duration-300 md:ml-auto md:mt-4 md:w-fit"
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

          On a phone it is a flex child that takes whatever the header and the
          counter leave, and reports that height back through `frameRef`. It
          used to be a hard 520px, which is more than a small phone has to give
          — so the column overflowed the stage and the heading was pushed off
          the top. Letting it claim the remainder means the header, the strip
          and the counter are always all in frame, whatever the device.
        */}
        <div
          ref={frameRef}
          className={`relative overflow-hidden ${isMobile ? 'min-h-0 flex-1' : ''}`}
          style={{ opacity: 1 - out }}
        >
          <div
            className={
              isMobile
                ? 'flex flex-col gap-3 px-5 will-change-transform'
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
                if (isMobile) {
                  return (
                    <div
                      key={cell.key}
                      style={{ opacity: appear, height: MARKER }}
                      className="flex shrink-0 flex-col justify-center border-l-2 border-white pl-3"
                    >
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
                        {String(cell.count).padStart(2, '0')} pieces
                      </span>
                      <span className="mt-1 block text-[15px] font-medium leading-[1.15] tracking-[-0.01em] text-white">
                        {cell.label}
                      </span>
                      <span className="mt-1 block text-[10.5px] leading-[1.35] text-white/50">
                        {cell.note}
                      </span>
                    </div>
                  );
                }
                return (
                  <div
                    key={cell.key}
                    style={{ width: MARKER, opacity: appear }}
                    className="flex shrink-0 flex-col justify-end border-l-2 border-white pb-4 pl-4"
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

              /* ---- A clip, as a row on phones ---- */
              if (cell.kind === 'media' && isMobile) {
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setActive(cell.item)}
                    style={{ opacity: appear, height: TILE }}
                    className="group flex shrink-0 items-center gap-3 overflow-hidden rounded-lg border border-white/12 bg-white/[0.04] p-2.5 text-left"
                  >
                    <span className="relative block aspect-video w-[128px] shrink-0 overflow-hidden rounded-md bg-black/50">
                      <Poster item={cell.item} />
                      <span className="absolute inset-0 bg-black/25" />
                      <span className="absolute left-1/2 top-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-black/45">
                        <Play size={10} className="ml-px fill-white text-white" />
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                        {num}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[13px] font-medium leading-[1.3] text-white/90">
                        {cell.item.title}
                      </span>
                      <span className="mt-1 block truncate font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
                        {cell.item.meta}
                      </span>
                    </span>
                  </button>
                );
              }

              /* ---- A clip ---- */
              if (cell.kind === 'media') {
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setActive(cell.item)}
                    style={{ width: TILE, opacity: appear }}
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

              /* ---- A workflow, as a row on phones. Still the brightest cell. ---- */
              if (isMobile) {
                return (
                  <a
                    key={cell.key}
                    href={`#case-${cell.slug}`}
                    style={{ opacity: appear, height: TILE }}
                    className="flex shrink-0 items-center gap-3 overflow-hidden rounded-lg border-2 border-white bg-white/[0.10] p-2"
                  >
                    <span className="relative block aspect-video w-[128px] shrink-0 overflow-hidden rounded-md bg-black/50">
                      <Poster src={cell.thumbnail} caption={cell.tool} />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-sm bg-white px-1.5 py-0.5 font-mono text-[7.5px] font-semibold uppercase tracking-[0.16em] text-black">
                        <FileText size={8} strokeWidth={2.5} />
                        Workflow
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[9px] uppercase tracking-[0.16em] text-white/70">
                        {cell.tool}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[13px] font-semibold leading-[1.3] text-white">
                        {cell.title}
                      </span>
                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-white/85">
                        Read the case
                        <ArrowUpRight size={11} />
                      </span>
                    </span>
                  </a>
                );
              }

              /* ---- A workflow. Deliberately the brightest thing in the strip. ---- */
              return (
                <a
                  key={cell.key}
                  href={`#case-${cell.slug}`}
                  style={{ width: TILE, opacity: appear }}
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
          className="nova-shell mt-4 flex shrink-0 items-center gap-4 md:mt-7"
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
