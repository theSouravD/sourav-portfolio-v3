/**
 * NOVA III — ONE LIGHT, SIX GELS.
 *
 * The first pass gave every room a different shader: rays here, contours
 * there, an aurora somewhere else. Six looks is not a design system, it is six
 * design systems — every room read as a different website, which is exactly
 * the incoherence a premium site cannot have.
 *
 * So there is one light source for the whole site, and each room changes the
 * gel on it: colour, angle, spread and intensity. That is what a DP actually
 * does across a day's setups — the same instrument, re-gelled and re-aimed —
 * and it produces variety that still reads as one hand.
 *
 * Two things never change, and they are what bind the rooms together: a fine
 * grain over everything, and a vignette. Those two constants are most of why
 * film looks like film across wildly different scenes.
 */

export type SectionId = 'home' | 'work' | 'systems' | 'career' | 'toolkit' | 'contact';

export interface Setup {
  id: SectionId;
  /** What the nav says. Words, always — this is the dummy-proofing. */
  label: string;
  /** The caption in the bottom corner, and the nav tooltip. */
  note: string;
  /** The gel: colour of the beam, and the accent every element inherits. */
  accent: string;
  /** Where the light is coming from. */
  origin: 'top-center' | 'top-left' | 'top-right' | 'left' | 'right';
  spread: number;
  length: number;
  speed: number;
  /** How hard the scrim has to work before type will hold on this setup. */
  scrim: number;
}

/*
 * The gels run warm → cool → warm across the site, so moving through the nav
 * left to right is a temperature arc rather than six unrelated colours. The
 * accent is the beam colour desaturated to something type can be set in.
 */
export const SETUPS: Setup[] = [
  {
    id: 'home',
    label: 'Home',
    note: 'The opening setup',
    accent: '#F2C79A',
    origin: 'top-center',
    spread: 0.9,
    length: 2.1,
    speed: 0.7,
    scrim: 0.3,
  },
  {
    id: 'work',
    label: 'Work',
    note: 'Selected pieces',
    accent: '#C9D8FF',
    origin: 'top-right',
    spread: 1.15,
    length: 1.7,
    speed: 0.45,
    scrim: 0.46,
  },
  {
    id: 'systems',
    label: 'Systems',
    note: 'Automation workflows',
    accent: '#8FE3D4',
    origin: 'top-left',
    spread: 1.3,
    length: 1.6,
    speed: 0.4,
    scrim: 0.46,
  },
  {
    id: 'career',
    label: 'Career',
    note: 'Six roles, in order',
    accent: '#E8C7A6',
    origin: 'left',
    spread: 1.4,
    length: 1.9,
    speed: 0.35,
    scrim: 0.44,
  },
  {
    id: 'toolkit',
    label: 'Toolkit',
    note: 'How the work gets made',
    accent: '#F0A87A',
    origin: 'top-center',
    spread: 1.5,
    length: 1.4,
    speed: 0.3,
    scrim: 0.5,
  },
  {
    id: 'contact',
    label: 'Contact',
    note: 'Say hello',
    accent: '#D6B9FF',
    origin: 'top-center',
    spread: 0.8,
    length: 2.4,
    speed: 0.6,
    scrim: 0.34,
  },
];

export const setupOf = (id: SectionId) => SETUPS.find((s) => s.id === id) ?? SETUPS[0];

/**
 * Props for the single LightRays instance.
 *
 * There is one mounted for the life of the site and its props are animated
 * between setups, rather than one instance per room. Mounting a new shader per
 * room meant tearing down and rebuilding a WebGL context on every click — the
 * stall was small but it landed exactly on the transition, which is the one
 * moment a visitor is watching closely.
 */
export function rayProps(s: Setup) {
  return {
    raysOrigin: s.origin,
    raysColor: s.accent,
    raysSpeed: s.speed,
    lightSpread: s.spread,
    rayLength: s.length,
    followMouse: true,
    mouseInfluence: 0.14,
    noiseAmount: 0.06,
    distortion: 0.03,
    fadeDistance: 1.35,
    saturation: 0.9,
  } as Record<string, unknown>;
}

/** Read the room out of the URL, so a shared link and the back button work. */
export function sectionFromHash(): { id: SectionId; caseSlug: string | null } {
  const raw = window.location.hash.replace('#', '');
  if (raw.startsWith('case/')) {
    return { id: 'systems', caseSlug: raw.slice(5) || null };
  }
  const id = raw as SectionId;
  return { id: SETUPS.some((s) => s.id === id) ? id : 'home', caseSlug: null };
}
