import Stage from '@/nova3/Stage';

/**
 * NOVA III.
 *
 * Six rooms, each lit by its own live scene, and one ordinary navigation bar.
 * Nova I put the navigation inside the experience and made you learn it; Nova
 * II replaced the whole site with a game. This keeps the cinematic register of
 * Nova I and spends the invention on atmosphere instead of on wayfinding.
 *
 * Both earlier versions are preserved: `git checkout v1-reel` for the film,
 * `git checkout nova-ii` for the handheld.
 */
export default function App() {
  return <Stage />;
}
