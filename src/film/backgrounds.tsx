import { lazy, Suspense } from 'react';
import LightRays from '@/reactbits/LightRays';
import Particles from '@/reactbits/Particles';

/**
 * Background presets.
 *
 * Each one is tuned to the same warm-on-near-black palette so switching
 * changes the mood, never the legibility of the type sitting on top. They
 * mount lazily — only the selected one ever runs a WebGL context.
 */

const Grainient = lazy(() => import('@/reactbits/Grainient'));
const Aurora = lazy(() => import('@/reactbits/Aurora'));
const SoftAurora = lazy(() => import('@/reactbits/SoftAurora'));
const Threads = lazy(() => import('@/reactbits/Threads'));
const Ferrofluid = lazy(() => import('@/reactbits/Ferrofluid'));
const LiquidChrome = lazy(() =>
  import('@/reactbits/LiquidChrome').then((m) => ({ default: m.LiquidChrome }))
);
const Topography = lazy(() => import('@/reactbits/Topography'));

export interface Preset {
  id: string;
  name: string;
  /** One line on what it feels like, shown in the picker. */
  note: string;
  /**
   * How much black to lay over this look. One shared value doesn't work:
   * the busy ones need taming so type stays readable, and the already-dark
   * ones get crushed to nothing by the same amount.
   */
  scrim: number;
  render: () => React.ReactNode;
}

export const PRESETS: Preset[] = [
  {
    id: 'projector',
    scrim: 0.16,
    name: 'Projector',
    note: 'Warm beams from above, with drifting bokeh',
    render: () => (
      <>
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffd7a8"
          raysSpeed={0.7}
          lightSpread={1.1}
          rayLength={2.4}
          followMouse
          mouseInfluence={0.12}
          noiseAmount={0.06}
          distortion={0.04}
          fadeDistance={1.4}
          saturation={0.85}
          className="absolute inset-0"
        />
        <Particles
          className="absolute inset-0"
          particleCount={180}
          particleSpread={14}
          speed={0.06}
          particleColors={['#ffffff', '#ffe2bd', '#cfd8e3']}
          particleBaseSize={62}
          sizeRandomness={0.9}
          alphaParticles
          moveParticlesOnHover
          particleHoverFactor={0.35}
          cameraDistance={18}
        />
      </>
    ),
  },
  {
    id: 'filmstock',
    scrim: 0.18,
    name: 'Film stock',
    note: 'Slow warm gradient under live grain',
    render: () => (
      <Grainient
        timeSpeed={0.14}
        warpStrength={0.55}
        warpFrequency={1.1}
        warpSpeed={0.2}
        grainAmount={0.12}
        grainScale={1.6}
        grainAnimated
        contrast={1.15}
        gamma={1.05}
        saturation={0.7}
        color1="#0a0a0a"
        color2="#2a1d12"
        color3="#4a3a24"
      />
    ),
  },
  {
    id: 'nightfall',
    scrim: 0.04,
    name: 'Nightfall',
    note: 'Deep amber aurora, slow and wide',
    render: () => (
      <SoftAurora
        speed={0.35}
        scale={1.3}
        brightness={0.42}
        color1="#3a2415"
        color2="#0e1520"
        noiseFrequency={1.1}
        noiseAmplitude={0.5}
        bandHeight={0.55}
        bandSpread={1.2}
        enableMouseInteraction
        mouseInfluence={0.12}
      />
    ),
  },
  {
    id: 'ribbons',
    scrim: 0.14,
    name: 'Ribbons',
    note: 'Aurora bands, cooler and more graphic',
    render: () => (
      <Aurora colorStops={['#2b1c10', '#b07a3e', '#1a2230']} amplitude={0.85} blend={0.62} speed={0.5} />
    ),
  },
  {
    id: 'strands',
    scrim: 0.1,
    name: 'Strands',
    note: 'Fine drawn lines that part around the cursor',
    render: () => (
      <Threads color={[1, 0.86, 0.68]} amplitude={1.1} distance={0.28} enableMouseInteraction />
    ),
  },
  {
    id: 'ferro',
    scrim: 0.05,
    name: 'Ferrofluid',
    note: 'Heavy liquid metal — the most dramatic',
    render: () => (
      <Ferrofluid
        className="absolute inset-0"
        colors={['#0a0a0a', '#5a4326', '#e8c99b']}
        speed={0.32}
        scale={1.15}
        turbulence={0.5}
        fluidity={0.85}
        rimWidth={0.12}
        shimmer={0.4}
        glow={0.35}
        opacity={0.85}
        mouseInteraction
        mouseStrength={0.3}
      />
    ),
  },
  {
    id: 'contour',
    scrim: 0.30,
    name: 'Contour',
    note: 'Topographic lines — quiet, architectural',
    render: () => (
      <Topography
        lowColor="#0a0a0a"
        midColor="#8a6a42"
        highColor="#e8c99b"
        speed={0.22}
        morphAmount={0.5}
        morphSpeed={0.18}
        bands={9}
        thickness={0.6}
        scale={1.4}
        glow={0.25}
        contrast={0.9}
        brightness={0.55}
        opacity={0.55}
        grain
        grainIntensity={0.08}
        mouseInteraction
      />
    ),
  },
  {
    id: 'chrome',
    scrim: 0.24,
    name: 'Chrome',
    note: 'Slow reflective flow',
    render: () => (
      <LiquidChrome
        baseColor={[0.06, 0.055, 0.05]}
        speed={0.14}
        amplitude={0.38}
        frequencyX={2.4}
        frequencyY={1.8}
        interactive
      />
    ),
  },
  {
    id: 'none',
    scrim: 0.0,
    name: 'Off',
    note: 'Flat black — lets the type carry it alone',
    render: () => null,
  },
];

export function PresetLayer({ id }: { id: string }) {
  const preset = PRESETS.find((p) => p.id === id) ?? PRESETS[0];
  return (
    <Suspense fallback={null}>
      <div className="absolute inset-0">{preset.render()}</div>
    </Suspense>
  );
}
