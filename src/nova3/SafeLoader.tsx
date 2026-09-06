import { Component, type ReactNode } from 'react';

/**
 * A guard around the opening sequence.
 *
 * WHY THIS EXISTS
 * The loader gates the whole site: nothing renders until it reports that the
 * wordmark has landed. That is right for the choreography and dangerous for
 * everything else, because it makes one decorative component a single point of
 * failure for the entire page. React unmounts the whole tree when a render or
 * an effect throws, so a bad prop, a missing GSAP plugin, or a browser without
 * some API the animation reaches for would not degrade the intro — it would
 * leave the visitor on a blank screen with the real content sitting one state
 * flag away.
 *
 * So: if the loader throws, this catches it, boots the site immediately, and
 * renders nothing in its place. The visitor loses an animation, which is the
 * correct thing to lose. A portfolio that fails to appear is worse than a
 * portfolio that appears without a title sequence.
 *
 * It is a class component because error boundaries have no hook equivalent —
 * `componentDidCatch` is still the only way to catch a descendant's throw.
 */
export default class SafeLoader extends Component<
  { children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Worth saying out loud in the console: the page will look fine, so
    // without this the failure is completely silent to whoever is debugging.
    console.warn('[nova3] opening sequence failed; showing the site directly.', error);
    this.props.onFail();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
