import type { AutomationProject } from '@/data/work';

/**
 * A tile per workflow — the third attempt, so it is worth recording what the
 * first two got wrong.
 *
 * The FIRST drew every workflow the same way: nodes on a line, sized by stage
 * count. That is a picture of "a pipeline exists", which is true of all five
 * and therefore says nothing about any of them.
 *
 * The SECOND drew each transformation literally — a script becoming frames, a
 * grid sliced onto a timeline, a waveform fanning into languages. Accurate,
 * and still infographics: tick rules, brackets and captions, at a size where
 * the whole argument dissolved into texture on a 118px card.
 *
 * THESE ARE OBJECTS, NOT DIAGRAMS.
 * The construction is Apple's icon language, and it is specific: continuous
 * curvature rather than rounded corners, a gradient running light to deep on
 * the diagonal, a specular band across the top third, and one symbol carrying
 * the whole idea. It is a language designed for something an inch wide on a
 * home screen, which is exactly the problem a card thumbnail poses.
 *
 * ALMOST NO GROUND AT ALL.
 * The first cut was a deep accent ground with paper symbols, and it was too
 * heavy: a dark tile is a heavy object, and five on Systems plus one on the
 * home hero pulled the eye off the type the page is for. A mid tint fixed the
 * weight and still put a coloured panel in every card.
 *
 * So the ground is now barely there — paper, falling to a whisper of accent —
 * and the symbol does all the work. The tile stops being a panel with a mark
 * on it and becomes a drawing that happens to be framed, which is the lightest
 * a thumbnail can be while still reading as a made thing.
 *
 * What holds it together at that weight is the EDGE. On a near-paper tile
 * inside a near-paper card there is no value difference left to define the
 * boundary, so the hairline is accent-tinted and slightly firmer than it would
 * otherwise need to be — without it the thumbnail dissolves into the card.
 *
 * THE COLOUR IS THE ROOM'S.
 * Every stop is mixed from `--accent`, the same variable the nav underline,
 * the kickers and the hover borders take, so a tile is graded with the room it
 * is standing in and re-grades itself the moment the room changes.
 *
 * An earlier pass gave each workflow a DIFFERENT room's accent — teal, blue,
 * violet, amber, rose — on the theory that five hues make five workflows more
 * memorable. It does, and it was still wrong: the Systems room is graded teal,
 * so four of the five tiles sat against a colour they had nothing to do with.
 * A thumbnail that ignores the grade is not a thumbnail with personality, it
 * is a thumbnail from another site.
 *
 * They stay separable through TONE and symbol instead of hue: each tile takes
 * its own position on one ramp, so the set reads as a family without any of
 * them reading as a mistake.
 *
 * ONE CANVAS FOR BOTH SIZES. 16:9, composed to fill the frame, so the same
 * drawing serves a 118px card and a 940px hero.
 */

const W = 320;
const H = 180;

/**
 * Where each tile's ground settles, as a percentage toward paper.
 *
 * At this weight the ramp is nearly flat — a few points either side of 93 —
 * because there is almost no room left to vary. Tone has stopped being what
 * separates these; the symbols do that now, which is the right division of
 * labour and was always half true.
 */
const RAMP: Record<string, number> = {
  'script-to-motion': 92,
  'script-to-image': 95,
  'character-standardization': 90,
  'growth-show-thumbnail-generation': 96,
  'video-dubbing-localization': 93,
};

/* Mixing happens in CSS rather than in JS because `--accent` is only known at
   paint time — it animates as the room's light changes, and a value read once
   in a render would freeze the tile at whatever the accent was then. */
const PAPER = '#F7F3EC';
const INK = '#17140F';
/** `pct` toward paper: 0 is the raw accent, 100 is paper. */
const lighter = (pct: number) => `color-mix(in srgb, var(--accent) ${100 - pct}%, ${PAPER})`;
const deeper = (pct: number) => `color-mix(in srgb, var(--accent) ${100 - pct}%, ${INK})`;

/**
 * The four roles a shape can take on a light tile.
 *
 * On the dark version the solids were paper and the knockouts were accent.
 * Inverting the ground inverts all of that, so the roles are named rather than
 * spelled out per symbol — otherwise the next value change means editing five
 * drawings by hand and getting one of them wrong.
 */
interface Palette {
  /** The hero shape: deep accent, carries the idea. */
  mark: string;
  /** Outlines and connectors. */
  soft: string;
  /** Supporting shapes — the ones that are context, not subject. */
  faint: string;
  /** Knocked out of `mark`. */
  paper: string;
}

/**
 * A superellipse — |x/a|ⁿ + |y/b|ⁿ = 1 — sampled as a path.
 *
 * Not a rounded rectangle. A rounded rect joins a straight edge to a circular
 * arc and the curvature jumps at that join; a superellipse's curvature is
 * continuous the whole way round. That one difference is most of why a shape
 * reads as Apple rather than as a box with soft corners, and it is plainly
 * visible at the size these symbols are drawn.
 */
function sq(cx: number, cy: number, w: number, h: number, n = 5, steps = 72) {
  const a = w / 2;
  const b = h / 2;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const x = cx + a * Math.sign(ct) * Math.abs(ct) ** (2 / n);
    const y = cy + b * Math.sign(st) * Math.abs(st) ** (2 / n);
    d += `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
  }
  return `${d}Z`;
}

/* ==================================================================
 * THE SYMBOLS
 *
 * One idea each, at a weight that survives 118px. Anything that read as an
 * interface control was cut in review — an ellipsis under the grid, dots
 * beside the waveforms, a funnel on the thumbnail tile. A tile should look
 * like an object, not like a screenshot of a panel.
 * ================================================================== */

/** A page, and the frame it becomes. */
const ScriptToMotion = ({ c }: { c: Palette }) => (
  <>
    <path d={sq(92, 90, 64, 84)} fill={c.faint} stroke={c.soft} strokeWidth={1.3} />
    {[0, 1, 2, 3].map((i) => (
      <rect
        key={i} x={70} y={64 + i * 14} width={44 - (i % 2 ? 14 : 0)} height={5}
        rx={2.5} fill={c.mark} opacity={0.45}
      />
    ))}
    <g fill={c.mark}>
      <rect x={140} y={86} width={26} height={8} rx={4} />
      <path d="M164 78 l18 12 -18 12 z" />
    </g>
    <path d={sq(240, 90, 72, 84)} fill={c.mark} />
    <path d="M228 74 l26 16 -26 16 z" fill={c.paper} />
  </>
);

/** Nine panes, one chosen, drawn out as a slice. */
const ScriptToImage = ({ c }: { c: Palette }) => (
  <>
    {[0, 1, 2].map((r) =>
      [0, 1, 2].map((col) => {
        const sel = r === 1 && col === 1;
        return (
          <path
            key={`${r}-${col}`}
            d={sq(112 + col * 48, 46 + r * 44, 40, 36)}
            fill={sel ? c.mark : c.faint}
            stroke={sel ? undefined : c.soft}
            strokeWidth={sel ? undefined : 1.3}
          />
        );
      }),
    )}
    <path d={sq(160, 90, 52, 48)} fill="none" stroke={c.mark} strokeWidth={2.6} />
    <path d={sq(252, 90, 44, 48)} fill={c.mark} />
    <path d="M196,90 h30" stroke={c.soft} strokeWidth={2.4} strokeLinecap="round" />
  </>
);

/** One subject, ringed by its own coverage. */
const CharacterCanvas = ({ c }: { c: Palette }) => (
  <>
    <circle cx={160} cy={90} r={62} fill="none" stroke={c.soft} strokeWidth={1.3} />
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      return (
        <path
          key={i}
          d={sq(160 + Math.cos(a) * 62, 90 + Math.sin(a) * 62, 17, 20)}
          fill={c.faint}
        />
      );
    })}
    <path d={sq(160, 90, 62, 74)} fill={c.mark} />
    <g fill={c.paper}>
      <circle cx={160} cy={76} r={11} />
      <path d="M143,116 Q145,92 160,90 Q175,92 177,116 Z" />
    </g>
  </>
);

/** A field of candidates, and the one that shipped. */
const ThumbnailWall = ({ c }: { c: Palette }) => (
  <>
    {Array.from({ length: 12 }, (_, i) => (
      <path
        key={i}
        d={sq(66 + (i % 6) * 26, 40 + Math.floor(i / 6) * 24, 20, 16)}
        fill={c.faint}
      />
    ))}
    <path d={sq(238, 52, 44, 36)} fill={c.soft} />
    <path d={sq(160, 124, 132, 64)} fill={c.mark} />
    <g fill={c.paper}>
      <circle cx={126} cy={112} r={9} />
      <path d="M112,140 Q114,120 126,118 Q138,120 140,140 Z" />
      <rect x={156} y={110} width={60} height={7} rx={3.5} />
      <rect x={156} y={124} width={38} height={5} rx={2.5} opacity={0.55} />
    </g>
  </>
);

/** One mouth, three carriers — the same shape at three weights. */
const Dubbing = ({ c }: { c: Palette }) => (
  <>
    <path d={sq(84, 90, 72, 84)} fill={c.mark} />
    <g fill={c.paper}>
      <circle cx={84} cy={74} r={13} />
      <path d="M62,118 Q65,92 84,90 Q103,92 106,118 Z" />
    </g>
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d={`M140,${52 + i * 38 + 14} q40,${-16 + i * 5} 100,0`}
        fill="none"
        stroke={c.mark}
        opacity={[1, 0.6, 0.32][i]}
        strokeWidth={10}
        strokeLinecap="round"
      />
    ))}
  </>
);

const SYMBOLS: Record<string, (p: { c: Palette }) => React.ReactElement> = {
  'script-to-motion': ScriptToMotion,
  'script-to-image': ScriptToImage,
  'character-standardization': CharacterCanvas,
  'growth-show-thumbnail-generation': ThumbnailWall,
  'video-dubbing-localization': Dubbing,
};

export default function WorkflowPoster({
  project,
  className = '',
}: {
  project: AutomationProject;
  className?: string;
}) {
  // A future workflow with no symbol yet gets the grid rather than an empty box.
  const Symbol = SYMBOLS[project.slug] ?? ScriptToImage;
  const base = RAMP[project.slug] ?? 64;

  /*
   * Gradient ids must be unique per instance. Five tiles on the Systems index
   * means five copies of this SVG in one document, and duplicate ids mean
   * every tile paints with whichever gradient the browser resolved first —
   * all five come out the same colour, which looks like a data bug and isn't.
   */
  const uid = `wp-${project.slug}`;
  /*
   * With the ground gone, every one of these has to work harder.
   *
   * `mark` is pushed past the raw accent toward ink so it holds a paper
   * knockout at symbol size. `faint` is much stronger than it looks like it
   * should be: on a mid tint the supporting shapes had a coloured ground to
   * sit against, and on paper they have nothing, so the same value that read
   * as "quiet" there reads as "missing" here — most visibly on the coverage
   * ring, which vanished entirely at card size before this was raised.
   */
  const c: Palette = {
    mark: deeper(16),
    soft: lighter(52),
    faint: lighter(74),
    paper: PAPER,
  };

  return (
    <svg
      className={`n3-poster ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={project.title}
    >
      <defs>
        {/* Light to deep on the diagonal, all three stops derived from the
            room's single accent. */}
        {/* Straight down rather than diagonal: a diagonal wants a light
            source, and there is no longer enough colour here to carry one. */}
        <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PAPER} />
          <stop offset="1" stopColor={lighter(base)} />
        </linearGradient>
        {/* No specular, no vignette. The dark version carried both; a paper
            highlight on a paper ground is nothing, and a vignette at this
            weight reads as dirt rather than as falloff. */}
      </defs>

      <rect width={W} height={H} fill={`url(#${uid}-g)`} />

      <Symbol c={c} />

      {/* The only thing separating the tile from the card. */}
      <rect
        x={0.5} y={0.5} width={W - 1} height={H - 1}
        fill="none" stroke={lighter(70)} strokeWidth={1}
      />
    </svg>
  );
}
