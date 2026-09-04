import type { ComponentType } from 'react';
import Aurora from '@/reactbits/Aurora';
import DarkVeil from '@/reactbits/DarkVeil';
import Grainient from '@/reactbits/Grainient';
import LightRays from '@/reactbits/LightRays';
import Threads from '@/reactbits/Threads';
import Topography from '@/reactbits/Topography';

/**
 * NOVA III — SIX ROOMS, SIX LIGHTS.
 *
 * The idea the whole site rests on: a director does not present their work as
 * one continuous journey, they present it one lit setup at a time. So each
 * section here has its own light — a different React Bits scene, running live
 * behind it, cross-fading when you change rooms.
 *
 * That is what makes this feel directed rather than decorated, and it costs
 * nothing in usability: the navigation is a labelled bar, so a visitor never
 * has to understand the lighting to use the site. The creativity is in the
 * atmosphere; the interface stays boring on purpose.
 *
 * WHY EACH SCENE SITS WHERE IT DOES
 * Every one is chosen for what the section is about, not for how it looks in
 * isolation. A background that means something is the difference between a
 * lighting plot and a screensaver.
 */

export type SectionId = 'home' | 'work' | 'systems' | 'career' | 'toolkit' | 'contact';

export interface Scene {
  id: SectionId;
  /** What the nav says. Words, always — this is the dummy-proofing. */
  label: string;
  /** The line under the title, and the nav's tooltip. */
  note: string;
  /** The live background for this room. */
  Bg: ComponentType<Record<string, unknown>>;
  props: Record<string, unknown>;
  /** Accent used by type and rules inside this room, so the grade is total. */
  accent: string;
  /** How dark the scrim over the background needs to be for text to hold. */
  scrim: number;
}

export const SCENES: Scene[] = [
  {
    id: 'home',
    label: 'Home',
    note: 'The opening setup',
    // Rays from a source above and behind — a projector beam, and the one
    // scene that reacts to the cursor, so the first room answers you.
    Bg: LightRays as ComponentType<Record<string, unknown>>,
    props: {
      raysOrigin: 'top-center',
      raysColor: '#ffd9a8',
      raysSpeed: 0.7,
      lightSpread: 0.9,
      rayLength: 2.1,
      followMouse: true,
      mouseInfluence: 0.12,
      noiseAmount: 0.06,
      distortion: 0.03,
      fadeDistance: 1.3,
      saturation: 0.85,
    },
    accent: '#FFD9A8',
    scrim: 0.32,
  },
  {
    id: 'work',
    label: 'Work',
    note: 'Selected pieces',
    // Scanlines and a slow warp: a monitor in a dark suite. The work is the
    // brightest thing in this room, so the light behind it stays low.
    Bg: DarkVeil as ComponentType<Record<string, unknown>>,
    props: {
      hueShift: 18,
      noiseIntensity: 0.03,
      scanlineIntensity: 0.12,
      speed: 0.35,
      scanlineFrequency: 1.4,
      warpAmount: 0.6,
      resolutionScale: 1,
    },
    accent: '#8FB8FF',
    scrim: 0.5,
  },
  {
    id: 'systems',
    label: 'Systems',
    note: 'Automation workflows',
    // Contour bands, drawn and redrawn. The only scene on the site that looks
    // like a diagram, behind the only section that is about building things.
    Bg: Topography as ComponentType<Record<string, unknown>>,
    props: {
      lowColor: '#0b1418',
      midColor: '#123038',
      highColor: '#4fd6c4',
      speed: 0.28,
      morphAmount: 0.55,
      morphSpeed: 0.25,
      bands: 14,
      thickness: 0.9,
      scale: 1.5,
      glow: 0.35,
    },
    accent: '#4FD6C4',
    scrim: 0.44,
  },
  {
    id: 'career',
    label: 'Career',
    note: 'Six roles, in order',
    // Parallel lines that drift — the closest thing in the set to a timeline,
    // which is what this room is.
    Bg: Threads as ComponentType<Record<string, unknown>>,
    props: {
      color: [0.86, 0.74, 0.62],
      amplitude: 1.1,
      distance: 0.35,
      enableMouseInteraction: true,
    },
    accent: '#E4BC9E',
    scrim: 0.4,
  },
  {
    id: 'toolkit',
    label: 'Toolkit',
    note: 'How the work gets made',
    // Soft, grainy, warm. A room to read in rather than look at.
    Bg: Grainient as ComponentType<Record<string, unknown>>,
    props: {
      timeSpeed: 0.16,
      colorBalance: 0.55,
      warpStrength: 0.5,
      warpFrequency: 1.1,
      grainAmount: 0.09,
      grainScale: 1.4,
      blendSoftness: 0.7,
    },
    accent: '#F0A87A',
    scrim: 0.52,
  },
  {
    id: 'contact',
    label: 'Contact',
    note: 'Say hello',
    // The one scene that opens upward instead of pressing down. The last room
    // should feel like a door, not a wall.
    Bg: Aurora as ComponentType<Record<string, unknown>>,
    props: {
      colorStops: ['#4C7DFF', '#B07BFF', '#FF9E7D'],
      amplitude: 1.15,
      blend: 0.6,
      speed: 0.55,
    },
    accent: '#B9A6FF',
    scrim: 0.38,
  },
];

export const sceneOf = (id: SectionId) => SCENES.find((s) => s.id === id) ?? SCENES[0];

/** Read the room out of the URL, so a shared link and the back button work. */
export function sectionFromHash(): SectionId {
  const h = window.location.hash.replace('#', '') as SectionId;
  return SCENES.some((s) => s.id === h) ? h : 'home';
}
