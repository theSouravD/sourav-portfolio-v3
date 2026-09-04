import { profile, stats, about, coreSkills, experience } from '@/data/content';
import { automationProjects, portfolioWork } from '@/data/work';
import type { MediaItem } from '@/data/work';

/**
 * The level, and the six things in it.
 *
 * ONE RESOLUTION, EVERY DEVICE. 240×160 internal pixels, always. A desktop
 * does not get a wider level — it gets a bigger console. That is what makes
 * "the same experience on mobile" literally true here rather than a claim
 * about a responsive layout: there is one level, and both devices show all
 * of it. It also means the level can be hand-placed once, which is the only
 * way a platformer this small stays tuned.
 */
export const W = 240;
export const H = 160;

export interface Block { x: number; y: number; id: SectionId; used: boolean; bump: number }
export interface Coin { x: number; y: number; label: string; got: boolean }
export interface Solid { x: number; y: number; w: number; h: number; thin?: boolean }

export type SectionId = 'reel' | 'work' | 'exp' | 'kit' | 'cv' | 'say';

export const LEVEL = {
  spawn: { x: 10, y: 124 },

  solids: [
    { x: 0, y: 140, w: W, h: 20 },                    // ground
    { x: 150, y: 104, w: 52, h: 6, thin: true },      // the upper ledge
    /*
     * The pipe is a solid, not scenery. Without this the character walks
     * straight through it, which looks broken, and the third coin — which sits
     * above the pipe — becomes unreachable because there is nothing to stand
     * on. Arrival at the pipe is a proximity test rather than an overlap, so
     * standing on top of it still counts as going down it.
     */
    { x: 206, y: 118, w: 22, h: 22 },
  ] as Solid[],

  /*
   * Four blocks, placed so every one is reachable and the route reads left to
   * right. The two low blocks are a single jump from the ground; the third is
   * a jump from the ground at the top of the arc; the fourth needs the ledge,
   * which is what makes the ledge worth having.
   */
  blocks: [
    { x: 32,  y: 96, id: 'reel', used: false, bump: 0 },
    { x: 68,  y: 96, id: 'work', used: false, bump: 0 },
    { x: 112, y: 80, id: 'exp',  used: false, bump: 0 },
    { x: 160, y: 62, id: 'kit',  used: false, bump: 0 },
  ] as Block[],

  /* The CV is a pipe because going down one is what a download is. */
  pipe: { x: 206, y: 118, w: 22, h: 22 },

  /* Contact is the flag because the end of the level is where you say hello. */
  flag: { x: 232, y: 84, h: 56 },

  /*
   * The statistics are coins.
   *
   * This is the one piece of the design I'd defend hardest: a number you
   * watch someone collect is worth more than a number you read in a box. The
   * labels come from the same `stats` array the old site used, so they can
   * never drift from the CV.
   */
  coins: [
    { x: 52,  y: 86, label: coinLabel(0), got: false },
    { x: 178, y: 70, label: coinLabel(1), got: false },
    { x: 216, y: 96, label: coinLabel(2), got: false },
  ] as Coin[],
};

function coinLabel(i: number) {
  const s = stats[i];
  return `${s.value}${s.suffix} ${s.label}`.toUpperCase();
}

/* ------------------------------------------------------------------ *
 * The six doors, built from the real content files.
 *
 * Nothing here is retyped. `label` is what the level paints under a block —
 * short, because a 16px block has about seven characters of room under it —
 * and `title` is what the panel says.
 * ------------------------------------------------------------------ */

export interface Row { left: string; right: string; href?: string }
export interface Section {
  id: SectionId;
  label: string;
  title: string;
  meta: string;
  body: string;
  rows: Row[];
}

const reelCount =
  (portfolioWork.direction as MediaItem[]).length +
  (portfolioWork.ai as MediaItem[]).length;

export const SECTIONS: Record<SectionId, Section> = {
  reel: {
    id: 'reel',
    label: 'REEL',
    title: 'Selected Work',
    meta: `${reelCount} pieces · 2 runs`,
    body: 'Campaign and trailer work, AI ad creatives, motion graphics and video editing.',
    rows: (portfolioWork.direction as MediaItem[]).slice(0, 3)
      .concat((portfolioWork.ai as MediaItem[]).slice(0, 3))
      .map((m) => ({ left: m.title, right: m.meta })),
  },
  work: {
    id: 'work',
    label: 'SYSTEMS',
    title: 'Automation Workflows',
    meta: `${automationProjects.length} case studies`,
    body: 'Systems, not clips. Each one opens a written breakdown — the problem, the build, and what it changed.',
    rows: automationProjects.map((p) => ({ left: p.title, right: p.tool })),
  },
  exp: {
    id: 'exp',
    label: 'CAREER',
    title: 'Experience',
    meta: `${experience.length} roles · 2019–2026`,
    body: 'Graphics designer to Gen AI Production Lead, in order.',
    rows: experience.map((j) => ({ left: `${j.company} — ${shortTitle(j.title)}`, right: j.period })),
  },
  kit: {
    id: 'kit',
    label: 'TOOLKIT',
    title: about.heading,
    meta: `${coreSkills.length} skills`,
    body: about.body,
    rows: coreSkills.slice(0, 8).map((s) => ({ left: s, right: 'Core' })),
  },
  cv: {
    id: 'cv',
    label: 'RESUME',
    title: 'Resume',
    meta: 'PDF · 2 pages · 2026',
    body: 'Two pages, cut to match the site. One click, no forms.',
    rows: [{ left: 'Download the PDF', right: '2 pages', href: profile.resumeUrl }],
  },
  say: {
    id: 'say',
    label: 'HELLO',
    title: 'Contact',
    meta: 'Kolkata, WB · remote',
    body: 'End of the level. Open to Gen AI production and creative direction work.',
    rows: [
      { left: 'souravdey2105@gmail.com', right: 'Email', href: 'mailto:souravdey2105@gmail.com' },
      { left: 'linkedin.com/in/souravdey2105', right: 'LinkedIn', href: 'https://linkedin.com/in/souravdey2105' },
    ],
  },
};

/** Job titles run long; a panel row has room for about forty characters. */
function shortTitle(t: string) {
  return t.split(',')[0].replace('Sr. ', 'Sr ').slice(0, 34);
}

export const SECTION_ORDER: SectionId[] = ['reel', 'work', 'exp', 'kit', 'cv', 'say'];
