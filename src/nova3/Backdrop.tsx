import { memo } from 'react';
import SoftAurora from '@/reactbits/SoftAurora';
import Aurora from '@/reactbits/Aurora';
import Topography from '@/reactbits/Topography';
import Grainient from '@/reactbits/Grainient';
import type { Setup } from './scenes';
import {
  auroraProps, contourProps, gradientProps, washProps,
  type BackdropId,
} from './backdrops';

/**
 * The ground.
 *
 * `memo` on the setup id and backdrop id rather than the whole setup object
 * matters more than it looks: these are WebGL components, and re-rendering one
 * unnecessarily can tear down and rebuild a GL context. Rebuilding it on a
 * room change would put the stall exactly on the transition — the one moment
 * somebody is watching closely.
 */
function BackdropInner({ id, setup }: { id: BackdropId; setup: Setup }) {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  switch (id) {
    case 'aurora':
      return <Aurora {...(auroraProps(setup) as any)} />;
    case 'contour':
      return <Topography {...(contourProps(setup) as any)} />;
    case 'gradient':
      return <Grainient {...(gradientProps(setup) as any)} />;
    case 'paper':
      // Deliberately nothing. No canvas, no shader compile, no GPU work.
      return null;
    default:
      return <SoftAurora {...(washProps(setup) as any)} />;
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export default memo(
  BackdropInner,
  (a, b) => a.id === b.id && a.setup.id === b.setup.id,
);
