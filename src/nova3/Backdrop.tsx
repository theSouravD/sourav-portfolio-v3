import { memo } from 'react';
import SoftAurora from '@/reactbits/SoftAurora';
import Aurora from '@/reactbits/Aurora';
import Topography from '@/reactbits/Topography';
import type { Setup } from './scenes';
import {
  auroraProps, contourProps, washProps,
  type BackdropId,
} from './theme';

/**
 * The ground.
 *
 * `memo` on the id, the room and the intensity rather than the whole setup
 * object matters more than it looks: these are WebGL components, and
 * re-rendering one unnecessarily can tear down and rebuild a GL context.
 * Rebuilding it on a room change would put the stall exactly on the
 * transition — the one moment somebody is watching closely.
 *
 * Two of the grounds are pure CSS and mount no canvas at all. That is not a
 * fallback: on a text-heavy room they are the most legible options here, and
 * they are the only ones that cost nothing on a laptop battery.
 */
function BackdropInner({ id, setup, k }: { id: BackdropId; setup: Setup; k: number }) {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  switch (id) {
    case 'aurora':
      return <Aurora {...(auroraProps(setup, k) as any)} />;
    case 'contour':
      return <Topography {...(contourProps(setup, k) as any)} />;

    /*
     * Mesh is drawn by CSS from the room's own custom properties, so it
     * re-gels with everything else for free and there is nothing to render.
     * `--k` carries the intensity into the stylesheet.
     */
    case 'mesh':
      return <div className="n3-mesh" style={{ ['--k' as string]: k }} />;

    case 'paper':
      // Deliberately nothing.
      return null;
    default:
      return <SoftAurora {...(washProps(setup, k) as any)} />;
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export default memo(
  BackdropInner,
  (a, b) => a.id === b.id && a.setup.id === b.setup.id && a.k === b.k,
);
