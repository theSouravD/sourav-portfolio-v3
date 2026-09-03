import { experience } from '@/data/content';

export type ChapterKind = 'title' | 'role' | 'reel' | 'toolkit' | 'end';

export interface Chapter {
  id: string;
  /** Label shown on the timeline. */
  label: string;
  /** Slate-style scene marker. */
  scene: string;
  kind: ChapterKind;
  /** Viewport-heights of scroll this chapter occupies. */
  length: number;
  /** Index into `experience` for role chapters. */
  roleIndex?: number;
}

/**
 * The film. Six role chapters run oldest to newest — the actual career arc,
 * in order — bracketed by a title card, the reel, the toolkit and an end card.
 *
 * `experience` is stored newest-first, so role chapters index it in reverse.
 *
 * LENGTHS ARE A UX BUDGET, NOT A FEEL.
 *
 * The reel is the exception that proves it. Every other chapter holds one
 * screen of content, so extra length is dead scrolling; the reel holds 37 cells
 * of real content, so length there buys legibility rather than wasting a
 * gesture. At 2.6 it moved most of two tiles per wheel notch — unreadable. At
 * 5.5 it moves about three quarters of one.
 *
 * `length` is in viewport-heights of scrolling. At a 900px viewport, one wheel
 * notch is ~100px — so a 1.9 chapter took 17 notches to cross while its content
 * finished animating after 5. Two thirds of the scrolling on this site produced
 * no visible change, which is why people could not tell the page was responding
 * at all. These are roughly halved: a chapter is now 8-9 notches, and every shot
 * animates across the whole of it.
 */
const roleCount = experience.length;

export const CHAPTERS: Chapter[] = [
  { id: 'open', label: 'Titles', scene: 'SC 00', kind: 'title', length: 1.0 },

  ...Array.from({ length: roleCount }, (_, i): Chapter => {
    const roleIndex = roleCount - 1 - i; // oldest first
    const job = experience[roleIndex];
    return {
      id: `sc${String(i + 1).padStart(2, '0')}`,
      label: job.period.split(' - ')[0].split(' ').pop() ?? job.period,
      scene: `SC ${String(i + 1).padStart(2, '0')}`,
      kind: 'role',
      length: 0.9,
      roleIndex,
    };
  }),

  { id: 'reel', label: 'The Reel', scene: 'SC 07', kind: 'reel', length: 5.5 },
  { id: 'kit', label: 'Toolkit', scene: 'SC 08', kind: 'toolkit', length: 1.0 },
  { id: 'end', label: 'End', scene: 'SC 09', kind: 'end', length: 1.0 },
];

/**
 * The scrubber's bars.
 *
 * Consecutive chapters that carry the same label are one bar. Two roles both
 * began in 2025, so the timeline was printing "2025" twice over two separate
 * segments — which reads as a repeat rather than as two jobs. They stay
 * separate scenes in the film; they just share a bar and a label here.
 *
 * Both rows of the scrubber are built from this one array, so a label and the
 * segment it names are the same box and cannot drift apart.
 */
export interface Track {
  label: string;
  /** Combined scroll length of the chapters in this bar. */
  length: number;
  /** Chapter this bar jumps to. */
  index: number;
  /** Every chapter folded into this bar. */
  members: number[];
}

export const TRACKS: Track[] = CHAPTERS.reduce<Track[]>((acc, c, i) => {
  const last = acc[acc.length - 1];
  if (last && last.label === c.label) {
    last.length += c.length;
    last.members.push(i);
  } else {
    acc.push({ label: c.label, length: c.length, index: i, members: [i] });
  }
  return acc;
}, []);

/** Which bar a chapter index belongs to. */
export function trackOf(chapterIndex: number) {
  return Math.max(
    0,
    TRACKS.findIndex((t) => t.members.includes(chapterIndex))
  );
}

export const TOTAL_LENGTH = CHAPTERS.reduce((n, c) => n + c.length, 0);

/** Cumulative start offset of each chapter, in viewport-heights. */
export const CHAPTER_STARTS = CHAPTERS.reduce<number[]>((acc, _c, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + CHAPTERS[i - 1].length);
  return acc;
}, []);

/** Fraction of the whole film at which each chapter begins. */
export const CHAPTER_OFFSETS = CHAPTER_STARTS.map((s) => s / TOTAL_LENGTH);

/** Runtime the timecode readout counts through. */
export const RUNTIME_SECONDS = 4 * 60 + 12;

/** Film-style timecode, MM:SS:FF at 24fps. */
export function timecode(progress: number) {
  const t = Math.max(0, Math.min(1, progress)) * RUNTIME_SECONDS;
  const mm = Math.floor(t / 60);
  const ss = Math.floor(t % 60);
  const ff = Math.floor((t % 1) * 24);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

/** Which chapter a global progress value falls in, plus its local 0..1. */
export function locate(progress: number) {
  const pos = Math.max(0, Math.min(1, progress)) * TOTAL_LENGTH;
  let index = 0;
  for (let i = 0; i < CHAPTERS.length; i += 1) {
    if (pos >= CHAPTER_STARTS[i]) index = i;
  }
  const local = (pos - CHAPTER_STARTS[index]) / CHAPTERS[index].length;
  return { index, local: Math.max(0, Math.min(1, local)) };
}

/** Local progress of one chapter given the global progress. */
export function chapterLocal(progress: number, index: number) {
  const pos = progress * TOTAL_LENGTH;
  return (pos - CHAPTER_STARTS[index]) / CHAPTERS[index].length;
}
