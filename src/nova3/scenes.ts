/**
 * NOVA III — DAYLIGHT.
 *
 * The dark version put a beam of light in a black room. That does not invert:
 * a rim light needs darkness to exist against, and on paper it just looks like
 * a smear. So the light theme changes the instrument as well as the palette —
 * from a hard source in the dark to a soft wash across a wall.
 *
 * The structure is the same one, and it is the part worth keeping: ONE
 * background for the whole site, re-gelled per room. Six different shaders was
 * the incoherence; six tints of one wash is a grade.
 *
 * WHY PAPER AND NOT WHITE
 * Pure #ffffff with a shadow on it is what a template looks like. The ground
 * here is a warm off-white with grain over it, which is the difference between
 * a page and a printed page — and the grain is doing more work in daylight
 * than it was in the dark, because there is nothing else hiding the flatness.
 */

export type SectionId = 'home' | 'work' | 'systems' | 'career' | 'toolkit' | 'contact';

export interface Setup {
  id: SectionId;
  /** What the nav says. Words, always — this is the dummy-proofing. */
  label: string;
  /** The caption in the corner, and the nav tooltip. */
  note: string;
  /**
   * The gel. Two lamps, not one — `wash` and `fill` are near neighbours on
   * the wheel, and the shader mixes between them across the frame, which is
   * what stops a pale field from reading as a flat swatch. `accent` is the
   * same family taken down far enough to set 10px type in: a tint that reads
   * well as a two-metre wash is illegible at caption size.
   */
  wash: string;
  fill: string;
  accent: string;
  /** How much of the wash to let through. Warmer hues carry further. */
  brightness: number;
  /** Where the bands sit and how far they spread. */
  band: number;
  spread: number;
  speed: number;
}

/*
 * SIX HUES, NOT SIX SHADES OF ORANGE.
 *
 * The first pass ran home, career and toolkit as amber, tan and coral, which
 * to the eye is one colour visited three times — walking the nav felt like
 * nothing was changing. These sit roughly sixty degrees apart around the
 * wheel, so every room is unmistakably its own: amber, blue, teal-green,
 * rose, violet, leaf green.
 *
 * They still read as one site because the ground, the grain and the vignette
 * never change, and because each room's `wash` and `fill` are near
 * neighbours — the variation is BETWEEN rooms and the coherence is inside
 * them, which is how a graded film works.
 */
export const SETUPS: Setup[] = [
  {
    id: 'home',
    label: 'Home',
    note: 'The opening setup',
    wash: '#FFB259',
    fill: '#FF8A4C',
    accent: '#A9631B',
    brightness: 0.42,
    band: 0.16,
    spread: 2.1,
    speed: 0.42,
  },
  {
    id: 'work',
    label: 'Work',
    note: 'Selected pieces',
    wash: '#5B9BF5',
    fill: '#7C7CF0',
    accent: '#25508F',
    brightness: 0.38,
    band: 0.1,
    spread: 2.4,
    speed: 0.3,
  },
  {
    id: 'systems',
    label: 'Systems',
    note: 'Automation workflows',
    wash: '#2FC7A6',
    fill: '#5FD08A',
    accent: '#0B6A57',
    brightness: 0.38,
    band: 0.12,
    spread: 2.5,
    speed: 0.26,
  },
  {
    id: 'career',
    label: 'Career',
    note: 'Six roles, in order',
    /*
     * Career is the most text-heavy room on the site — six roles, and up to
     * nine bullets under an open one — so its gel is the quietest of the six.
     * A saturated rose at the strength the other rooms run at fought the copy
     * for attention and lost the copy. Muted plum, a third of the brightness,
     * and the band pushed almost off the bottom of the frame.
     */
    wash: '#C6A6D8',
    fill: '#E2A9B4',
    accent: '#7A4368',
    brightness: 0.26,
    band: 0.05,
    spread: 2.2,
    speed: 0.24,
  },
  {
    id: 'toolkit',
    label: 'Toolkit',
    note: 'How the work gets made',
    wash: '#A886F5',
    fill: '#C77BEA',
    accent: '#5B3AA6',
    brightness: 0.42,
    band: 0.09,
    spread: 2.6,
    speed: 0.22,
  },
  {
    id: 'contact',
    label: 'Contact',
    note: 'Say hello',
    wash: '#8FC63F',
    fill: '#4FBE86',
    accent: '#3F6B1E',
    brightness: 0.44,
    band: 0.15,
    spread: 2.0,
    speed: 0.4,
  },
];

export const setupOf = (id: SectionId) => SETUPS.find((s) => s.id === id) ?? SETUPS[0];

/** The paper the wash sits on. Never changes — it is the site's ground. */
export const PAPER = '#F7F3EC';

/**
 * Props for the single SoftAurora instance.
 *
 * One is mounted for the life of the page and its colours are animated between
 * setups. Mounting a new shader per room meant tearing down and rebuilding a
 * WebGL context on every click, and the stall landed exactly on the transition
 * — the one moment somebody is watching closely.
 */
export function washProps(s: Setup) {
  return {
    /*
     * `lightMode` is the whole trick. In its normal mode the shader ADDS
     * light — it assumes a black room, and on paper an additive glow just
     * washes to grey. In light mode it works subtractively instead: it takes
     * the chroma of the two gels and pulls white DOWN toward it, the way ink
     * sits on a page. Same component, opposite physics.
     */
    lightMode: true,
    color1: s.wash,
    color2: s.fill,
    brightness: s.brightness,
    speed: s.speed,
    scale: 1.6,
    bandHeight: s.band,
    bandSpread: s.spread,
    noiseFrequency: 2.2,
    noiseAmplitude: 0.9,
    colorSpeed: 0.2,
    enableMouseInteraction: true,
    mouseInfluence: 0.1,
  } as Record<string, unknown>;
}

/** Read the room out of the URL, so a shared link and the back button work. */
export function sectionFromHash(): { id: SectionId; caseSlug: string | null } {
  const raw = window.location.hash.replace('#', '');
  if (raw.startsWith('case/')) return { id: 'systems', caseSlug: raw.slice(5) || null };
  const id = raw as SectionId;
  return { id: SETUPS.some((s) => s.id === id) ? id : 'home', caseSlug: null };
}
