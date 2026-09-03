/**
 * The key light behind the title.
 *
 * A single soft-cornered panel, lit from below to nothing and heavily
 * defocused — the look of a bounce card or a practical just out of frame,
 * rather than a gradient wash. It's built from three stacked copies for the
 * same reason the source artwork is: one panel at this opacity is barely
 * there, and stacking them deepens the core without lifting the falloff, so
 * the edge stays soft while the centre gains body.
 *
 * Title chapter only. It renders inside the shot, so it fades out with
 * everything else and never touches the rest of the film.
 *
 * Pure CSS — no SVG filter. A Gaussian blur primitive over a panel this large
 * is re-rasterised on every repaint; `filter: blur()` on a plain element stays
 * on the compositor.
 */
export default function TitleGlow({ opacity }: { opacity: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{ opacity }}
    >
      <div
        className="nova-glow absolute"
        style={{
          // Right of centre, sitting a little below the middle, so it lifts the
          // empty half of the frame and leaves the type side of the page clean.
          left: '58%',
          top: '52%',
          width: 'min(46vw, 620px)',
          height: 'min(46vw, 620px)',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute inset-0 block"
            style={{
              borderRadius: '22%',
              background:
                'linear-gradient(to top, rgba(0,0,0,0) 1%, rgba(232,224,214,0.85) 100%)',
              filter: `blur(${68 + i * 26}px)`,
              opacity: 0.16 - i * 0.03,
            }}
          />
        ))}
      </div>
    </div>
  );
}
