import type { AutomationProject } from '@/data/work';

/**
 * A tile per workflow — the fourth attempt, and the first one that stopped
 * drawing the wrong subject.
 *
 * The first three all drew THE SYSTEM. Nodes on a line; then the
 * transformation as a labelled diagram; then a single pictogram in Apple's
 * icon language. Each was better made than the last and all three answered the
 * same question — "what does this pipeline do?" — which is the question the
 * case study already answers, in words, one click away.
 *
 * These answer the question a thumbnail is actually for: WHAT DOES IT MAKE.
 * Each tile is a specimen of the system's output — a run of frames held in
 * time, the nine-cell grid with one cell pulled, one character held across
 * four framings, a wall of covers and the one that shipped, a single frame in
 * three languages. A portfolio should show the work; when the work is a system,
 * you show what the system produced.
 *
 * DUOTONE, ON PAPER.
 * Every value is mixed from `--accent`, so a tile is graded with the room it
 * stands in and re-grades the moment the room does. Two earlier passes learned
 * this the hard way: a dark tile is a heavy object and five of them took the
 * page's air, and a tile carrying another room's hue reads as being from
 * another site.
 *
 * THEY MOVE, AND THE MOVEMENT IS THE ARGUMENT.
 * Each tile animates the thing its system actually does: the playhead sweeps
 * and the frames light as it crosses them; the grid populates cell by cell and
 * then one is pulled out of it; the coverage sheet fills in; the wall of
 * candidates resolves to a winner; the dubbing frame holds perfectly still
 * while only the language changes underneath it. A loop that is merely decor
 * would be worse than none — the point is that you can watch the workflow.
 *
 * Every animated property is transform or opacity, so the whole set composites
 * on the GPU and never triggers layout. That matters here specifically: there
 * is a live WebGL shader running behind these, and five tiles animating width
 * or geometry attributes would fight it for the main thread.
 *
 * They loop continuously, with the rest built into the keyframes — the motion
 * happens in the first half of the cycle and the second half holds the
 * finished frame. CSS has no per-iteration delay, so that pause has to be part
 * of the animation itself, and without it five tiles in perpetual motion make
 * the grid impossible to read past.
 *
 * The five are also phase-shifted against each other, so the row ripples
 * rather than pulsing in unison. See PHASE.
 *
 * COMPOSED FOR THE SMALL SIZE FIRST.
 * The cards render these at 118px. That is the constraint that killed the
 * diagram versions — captions and tick rules simply dissolve — so the marks
 * here are few and large, and each tile is identifiable by its ARRANGEMENT
 * before any detail resolves: a strip, a grid, a row of heads, a wall, a
 * stack. Detail is what the 940px hero adds, not what the card depends on.
 */

const W = 320;
const H = 180;

/**
 * A head start per workflow, in seconds.
 *
 * Five tiles looping on one duration land on the same beat, and a grid that
 * pulses together reads as a page-wide flash rather than as five things each
 * doing their own work. These offsets are deliberately not evenly spaced —
 * an even spread produces its own visible rhythm, a wave crossing the grid
 * left to right, which is just a slower version of the same problem.
 *
 * They are negative in effect: a positive delay on an infinite animation
 * simply shifts its phase forever, which is exactly what is wanted.
 */
const PHASE: Record<string, number> = {
  'script-to-motion': 0,
  'script-to-image': 1.3,
  'character-standardization': 0.55,
  'growth-show-thumbnail-generation': 2.1,
  'video-dubbing-localization': 1.75,
};

const PAPER = '#F7F3EC';
const INK = '#17140F';
/* Mixing happens in CSS because `--accent` is only known at paint time — it
   animates as the room's light changes, and a value read once during render
   would freeze the tile at whatever the accent was then. */
/** `pct` toward paper: 0 is the raw accent, 100 is paper. */
const L = (pct: number) => `color-mix(in srgb, var(--accent) ${100 - pct}%, ${PAPER})`;
/** `pct` toward ink. */
const D = (pct: number) => `color-mix(in srgb, var(--accent) ${100 - pct}%, ${INK})`;

/**
 * A superellipse — |x/a|ⁿ + |y/b|ⁿ = 1 — sampled as a path.
 *
 * A rounded rect joins a straight edge to a circular arc and the curvature
 * jumps at the join; a superellipse's curvature is continuous the whole way
 * round. Every frame in every tile uses it, which is most of why the set reads
 * as manufactured rather than drawn.
 */
function sq(cx: number, cy: number, w: number, h: number, n = 5, steps = 64) {
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

/** A cloaked figure, feet on the baseline. */
function Figure({
  x, base, h, fill, opacity = 1,
}: { x: number; base: number; h: number; fill: string; opacity?: number }) {
  const s = h / 220;
  return (
    <g transform={`translate(${x - 50 * s} ${base - 220 * s}) scale(${s})`} fill={fill} opacity={opacity}>
      <circle cx={50} cy={40} r={20} />
      <path d="M22,220 Q28,158 38,116 Q43,96 39,78 Q42,64 50,62 Q58,64 61,78 Q57,96 62,116 Q72,158 78,220 Z" />
    </g>
  );
}

/**
 * One frame of output.
 *
 * `v` varies the scene — horizon height, where the moon sits, one figure or
 * two, and every fifth frame is an interior instead of a landscape. A grid of
 * these has to read as a SEQUENCE rather than as one image repeated, and that
 * variation is the only thing separating "nine scenes from one script" from
 * "a swatch printed nine times".
 */
function Frame({
  id, x, y, w, h, v, sky = 86, land = 52, edge = 70, sw = 1,
}: {
  id: string; x: number; y: number; w: number; h: number; v: number;
  sky?: number; land?: number; edge?: number; sw?: number;
}) {
  const horizon = y + h * (0.62 + 0.1 * Math.sin(v * 1.7));
  const moonX = x + w * (0.24 + 0.5 * ((v * 0.37) % 1));
  const moonR = Math.max(2.2, w * 0.11);
  const two = v % 3 === 1;
  const interior = v % 5 === 4;
  const shape = sq(x + w / 2, y + h / 2, w, h);
  return (
    <>
      <defs><clipPath id={id}><path d={shape} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill={L(sky)} />
        {interior ? (
          <>
            <rect x={x + w * 0.18} y={y + h * 0.16} width={w * 0.64} height={h * 0.5} fill={L(66)} />
            <line
              x1={x + w * 0.5} y1={y + h * 0.16} x2={x + w * 0.5} y2={y + h * 0.66}
              stroke={L(86)} strokeWidth={Math.max(0.6, w * 0.02)}
            />
          </>
        ) : (
          <circle cx={moonX} cy={y + h * 0.3} r={moonR} fill={L(58)} />
        )}
        <path
          d={`M${x},${horizon} Q${x + w * 0.35},${horizon - h * 0.12} ${x + w * 0.68},${horizon + h * 0.03} T${x + w},${horizon - h * 0.04} L${x + w},${y + h} L${x},${y + h} Z`}
          fill={L(land)}
        />
        <Figure x={x + w * (two ? 0.38 : 0.5)} base={y + h * 0.94} h={h * 0.52} fill={D(18)} />
        {two && <Figure x={x + w * 0.62} base={y + h * 0.94} h={h * 0.44} fill={D(18)} opacity={0.82} />}
      </g>
      <path d={shape} fill="none" stroke={L(edge)} strokeWidth={sw} />
    </>
  );
}

/**
 * A portrait frame: one subject, four framings.
 *
 * An earlier version scaled the full-body figure up and clipped it, which
 * turns a cloak silhouette into an abstract blob — four vases, not one
 * character. A coverage sheet has to read as the SAME PERSON seen differently,
 * so this draws an explicit bust and varies two things only: how close the
 * crop is, and how far the head is turned off the shoulders.
 */
function Portrait({ id, x, y, w, h, i }: { id: string; x: number; y: number; w: number; h: number; i: number }) {
  // [head radius as a fraction of width, head centre as a fraction of height, turn]
  const [hr, hy, turn] = [[0.3, 0.46, 0], [0.2, 0.3, 0.16], [0.145, 0.22, -0.1], [0.2, 0.3, -0.3]][i];
  const cx = x + w * 0.5 + w * turn;
  const cy = y + h * hy;
  const r = w * hr;
  const shoulderY = cy + r * 1.55;
  const halfW = r * 2.5;
  const shape = sq(x + w / 2, y + h / 2, w, h);
  return (
    <>
      <defs><clipPath id={id}><path d={shape} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill={L(88)} />
        <circle cx={x + w * 0.5} cy={y + h * 0.42} r={w * 0.44} fill={L(72)} />
        <g fill={D(18)}>
          <path
            d={`M${cx - halfW},${y + h}
                C${cx - halfW},${shoulderY} ${cx - r * 1.25},${shoulderY - r * 0.5} ${cx - r * 0.72},${shoulderY - r * 0.72}
                L${cx + r * 0.72},${shoulderY - r * 0.72}
                C${cx + r * 1.25},${shoulderY - r * 0.5} ${cx + halfW},${shoulderY} ${cx + halfW},${y + h} Z`}
          />
          <circle cx={cx} cy={cy} r={r} />
        </g>
      </g>
      <path d={shape} fill="none" stroke={L(70)} strokeWidth={1} />
    </>
  );
}

/* ==================================================================
 * THE FIVE SPECIMENS
 * ================================================================== */

type Props = { uid: string; phase: number };

/*
 * The timeline's geometry, in one place.
 *
 * The playhead's travel and the fill's length are the same number by
 * construction. They were separate literals — 150 for the head, the bar's full
 * 272 for the fill — and a tile at rest showed a completed timeline with the
 * head parked halfway along it.
 */
const BAR_X = 24;
const BAR_W = 272;
/** How far into the run the tile settles: partway through the third frame. */
const PLAYED = 150;

/** A run of frames, and the bar that holds them in time. */
const ScriptToMotion = ({ uid, phase }: Props) => (
  <>
    {[0, 1, 2, 3].map((i) => (
      <g key={i} className="wp-lit" style={{ animationDelay: `${phase + 0.16 + i * 0.26}s` }}>
        <Frame id={`${uid}-f${i}`} x={24 + i * 70} y={34} w={62} h={82} v={i + 1} />
      </g>
    ))}
    <rect x={BAR_X} y={132} width={BAR_W} height={6} rx={3} fill={L(84)} />
    {/*
      The fill is drawn PLAYED-LENGTH, not full-length, and scaled from 0 to 1
      from its left edge. Drawing it the full width and scaling to 1 was the
      obvious version and it was wrong: the bar finished at 100% while the
      playhead stopped at 55%, so the tile came to rest showing a finished
      timeline with the head stranded in the middle of it. Both now end at
      PLAYED, so they cannot disagree.

      Scaled rather than width-animated because animating a width attribute is
      a layout write on every frame.
    */}
    <rect
      className="wp-fill" style={{ animationDelay: `${phase}s` }}
      x={BAR_X} y={132} width={PLAYED} height={6} rx={3} fill={D(18)}
    />
    {/* A tick at the head of every frame, and one closing the run — without
        the last one the timeline just stops rather than ending. */}
    {[0, 1, 2, 3, 4].map((i) => (
      <rect
        key={i} x={i === 4 ? BAR_X + BAR_W - 1.4 : BAR_X + i * 70}
        y={126} width={1.4} height={18} fill={L(56)}
      />
    ))}
    <g className="wp-head" style={{ animationDelay: `${phase}s` }}>
      <circle cx={BAR_X} cy={135} r={6} fill={D(18)} />
      <circle cx={BAR_X} cy={135} r={2.4} fill={PAPER} />
    </g>
  </>
);

/** The grid the system generates, with one cell pulled out of it. */
const ScriptToImage = ({ uid, phase }: Props) => (
  <>
    {[0, 1, 2].map((r) =>
      [0, 1, 2].map((c) => (
        <g key={`${r}-${c}`} className="wp-in" style={{ animationDelay: `${phase + (r * 3 + c) * 0.075}s` }}>
          <Frame
            id={`${uid}-g${r}${c}`}
            x={24 + c * 58} y={22 + r * 46} w={52} h={44} v={r * 3 + c + 1}
          />
        </g>
      )),
    )}
    {/*
      The placement lives on the OUTER group and the animation on the inner
      one. A CSS `transform` REPLACES an element's SVG transform attribute
      rather than composing with it, so animating this group directly threw
      away its translate and the pulled cell flew back to the tile's origin,
      landing on top of the first grid cell.
    */}
    <g transform="translate(196 44) rotate(-5 44 34)">
      <g className="wp-pull" style={{ animationDelay: `${phase}s` }}>
        <path d={sq(44, 34, 92, 74)} fill={L(94)} opacity={0.9} />
        <Frame id={`${uid}-pull`} x={2} y={0} w={84} h={68} v={5} sw={1.6} edge={52} />
      </g>
    </g>
  </>
);

/** One character, held across four framings. */
const CharacterCanvas = ({ uid, phase }: Props) => (
  <>
    {[0, 1, 2, 3].map((i) => (
      <g key={i} className="wp-in" style={{ animationDelay: `${phase + 0.1 + i * 0.19}s` }}>
        <Portrait id={`${uid}-p${i}`} x={22 + i * 74} y={26} w={66} h={84} i={i} />
      </g>
    ))}
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={22 + i * 74} y={124} width={66} height={3} rx={1.5} fill={L(84)} />
        <rect
          className="wp-meter" style={{ animationDelay: `${phase + 0.24 + i * 0.19}s` }}
          x={22 + i * 74} y={124} width={[18, 34, 50, 26][i]} height={3} rx={1.5}
          fill={D(18)} opacity={0.75}
        />
      </g>
    ))}
    <rect x={22} y={146} width={288} height={1} fill={L(86)} />
  </>
);

/** The wall it generates, and the one that ships. */
const ThumbnailWall = ({ uid, phase }: Props) => (
  <>
    {Array.from({ length: 8 }, (_, i) => {
      const x = 20 + (i % 4) * 44;
      const y = 24 + Math.floor(i / 4) * 54;
      return (
        <g key={i} className="wp-flick" style={{ animationDelay: `${phase + i * 0.11}s` }}>
          <Frame id={`${uid}-w${i}`} x={x} y={y} w={38} h={46} v={i + 2} sky={90} land={66} edge={82} />
          <rect x={x + 4} y={y + 34} width={30} height={4} rx={2} fill={L(52)} />
        </g>
      );
    })}
    {/* Same split as the pulled cell above: placement outside, animation in. */}
    <g transform="translate(196 26)">
      <g className="wp-win" style={{ animationDelay: `${phase}s` }}>
        <path d={sq(52, 64, 110, 124)} fill={L(96)} />
        <Frame id={`${uid}-win`} x={2} y={4} w={100} h={116} v={3} sky={84} land={44} sw={1.6} edge={48} />
        <rect
          className="wp-title" style={{ animationDelay: `${phase + 0.8}s` }}
          x={12} y={92} width={80} height={8} rx={4} fill={D(18)}
        />
        <rect
          className="wp-title" style={{ animationDelay: `${phase + 1.06}s` }}
          x={26} y={106} width={52} height={4} rx={2} fill={L(56)}
        />
      </g>
    </g>
  </>
);

/** One frame, three languages — the frame is what stays identical. */
const Dubbing = ({ uid, phase }: Props) => (
  <>
    {[0, 1, 2].map((i) => {
      const y = 20 + i * 52;
      return (
        <g key={i}>
          {/* The same `v` every time: holding the picture and replacing only
              the voice is the entire workflow. */}
          {/* No animation on the frame. Its stillness across all three rows
              is the claim the workflow makes. */}
          <Frame id={`${uid}-d${i}`} x={22} y={y} w={84} h={44} v={2} sky={88} land={54} />
          <rect
            className="wp-say" style={{ animationDelay: `${phase + 0.2 + i * 0.34}s` }}
            x={118} y={y + 8} width={[176, 152, 164][i]} height={9} rx={4.5}
            fill={D(18)} opacity={[1, 0.66, 0.42][i]}
          />
          <rect
            className="wp-say" style={{ animationDelay: `${phase + 0.34 + i * 0.34}s` }}
            x={118} y={y + 23} width={[120, 96, 138][i]} height={9} rx={4.5}
            fill={L(60)} opacity={[1, 0.7, 0.5][i]}
          />
        </g>
      );
    })}
  </>
);

const SPECIMENS: Record<string, (p: Props) => React.ReactElement> = {
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
  // A future workflow with no specimen yet gets the grid rather than a blank.
  const Specimen = SPECIMENS[project.slug] ?? ScriptToImage;

  /*
   * Ids are namespaced per slug because five copies of this SVG share one
   * document. Duplicate clipPath ids mean every frame clips to whichever path
   * the browser resolved first — the tiles come out cropped to each other's
   * shapes, which looks like a layout bug and is really an id collision.
   */
  const uid = `wp-${project.slug}`;

  return (
    <svg
      className={`n3-poster ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={project.title}
    >
      <rect width={W} height={H} fill={PAPER} />
      <Specimen uid={uid} phase={PHASE[project.slug] ?? 0} />
      {/*
        NO OUTLINE ON THE ARTWORK.
        This carried a 1px inset stroke to stop a paper tile dissolving into a
        paper card. It was the wrong place to solve that. The SVG is drawn at
        320 wide and displayed at ~350, so the stroke scaled to a fractional
        width and landed off the pixel grid — a soft, uneven line sitting just
        inside the container's own border, which reads as a rendering fault
        rather than as an edge.

        Separation is the CONTAINER's job: `.n3-case-thumb` carries one crisp
        rule at the boundary it shares with the copy, on the pixel grid,
        drawn once.
      */}
    </svg>
  );
}
