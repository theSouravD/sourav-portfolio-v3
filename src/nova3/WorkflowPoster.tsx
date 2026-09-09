import type { AutomationProject } from '@/data/work';
import { SETUPS, type SectionId } from './scenes';
import { tint, shade } from './util';

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
 * THE COLOUR IS THE SITE'S, NOT IOS'S.
 * Each tile takes one of the six room accents straight from scenes.ts and
 * derives its entire gradient from that single value. Re-grade a room and its
 * tile follows, with no second place to edit — and the Systems grid ends up
 * previewing the palette of the whole site.
 *
 * ONE CANVAS FOR BOTH SIZES. 16:9, composed to fill the frame, so the same
 * drawing serves a 118px card and a 940px hero.
 */

const W = 320;
const H = 180;

/**
 * Which room lends each workflow its colour.
 *
 * Deliberately five DIFFERENT rooms rather than five tints of Systems teal.
 * One hue in five tints is quieter and more obviously a family, but the tiles
 * stop being individually memorable — and on a page whose entire job is making
 * five workflows distinguishable at a glance, memorable wins.
 */
const ROOM_OF: Record<string, SectionId> = {
  'script-to-motion': 'systems',
  'script-to-image': 'work',
  'character-standardization': 'toolkit',
  'growth-show-thumbnail-generation': 'home',
  'video-dubbing-localization': 'career',
};

const accentOf = (slug: string) => {
  const room = ROOM_OF[slug] ?? 'systems';
  return SETUPS.find((s) => s.id === room)?.accent ?? '#0B6A57';
};

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

/** Symbols are the site's paper, not pure white — warm against warm accents. */
const P = (o: number) => `rgba(247, 243, 236, ${o})`;

/* ==================================================================
 * THE SYMBOLS
 *
 * One idea each, at a weight that survives 118px. Anything that read as an
 * interface control was cut in review — an ellipsis under the grid, dots
 * beside the waveforms, a funnel on the thumbnail tile. A tile should look
 * like an object, not like a screenshot of a panel.
 * ================================================================== */

/** A page, and the frame it becomes. */
const ScriptToMotion = ({ deep }: { deep: string }) => (
  <>
    <path d={sq(92, 90, 64, 84)} fill={P(0.95)} />
    {[0, 1, 2, 3].map((i) => (
      <rect
        key={i} x={70} y={64 + i * 14} width={44 - (i % 2 ? 14 : 0)} height={5}
        rx={2.5} fill={deep} opacity={0.55}
      />
    ))}
    <g fill={P(0.92)}>
      <rect x={140} y={86} width={26} height={8} rx={4} />
      <path d="M164 78 l18 12 -18 12 z" />
    </g>
    <path d={sq(240, 90, 72, 84)} fill={P(0.22)} stroke={P(0.6)} strokeWidth={1.6} />
    <path d="M228 74 l26 16 -26 16 z" fill={P(0.95)} />
  </>
);

/** Nine panes, one chosen, drawn out as a slice. */
const ScriptToImage = () => (
  <>
    {[0, 1, 2].map((r) =>
      [0, 1, 2].map((c) => {
        const sel = r === 1 && c === 1;
        return (
          <path
            key={`${r}-${c}`}
            d={sq(112 + c * 48, 46 + r * 44, 40, 36)}
            fill={P(sel ? 0.96 : 0.3)}
            stroke={sel ? undefined : P(0.5)}
            strokeWidth={sel ? undefined : 1.4}
          />
        );
      }),
    )}
    <path d={sq(160, 90, 52, 48)} fill="none" stroke={P(0.95)} strokeWidth={2.6} />
    <path d={sq(252, 90, 44, 48)} fill={P(0.96)} />
    <path d="M196,90 h30" stroke={P(0.75)} strokeWidth={2.4} strokeLinecap="round" />
  </>
);

/** One subject, ringed by its own coverage. */
const CharacterCanvas = ({ deep }: { deep: string }) => (
  <>
    <circle cx={160} cy={90} r={62} fill="none" stroke={P(0.32)} strokeWidth={1.4} />
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      return (
        <path
          key={i}
          d={sq(160 + Math.cos(a) * 62, 90 + Math.sin(a) * 62, 17, 20)}
          fill={P(0.42)}
        />
      );
    })}
    <path d={sq(160, 90, 62, 74)} fill={P(0.96)} />
    <g fill={deep}>
      <circle cx={160} cy={76} r={11} />
      <path d="M143,116 Q145,92 160,90 Q175,92 177,116 Z" />
    </g>
  </>
);

/** A field of candidates, and the one that shipped. */
const ThumbnailWall = ({ deep }: { deep: string }) => (
  <>
    {Array.from({ length: 12 }, (_, i) => (
      <path
        key={i}
        d={sq(66 + (i % 6) * 26, 40 + Math.floor(i / 6) * 24, 20, 16)}
        fill={P(0.26)}
      />
    ))}
    <path d={sq(238, 52, 44, 36)} fill={P(0.34)} />
    <path d={sq(160, 124, 132, 64)} fill={P(0.96)} />
    <g fill={deep}>
      <circle cx={126} cy={112} r={9} />
      <path d="M112,140 Q114,120 126,118 Q138,120 140,140 Z" />
      <rect x={156} y={110} width={60} height={7} rx={3.5} />
      <rect x={156} y={124} width={38} height={5} rx={2.5} opacity={0.5} />
    </g>
  </>
);

/** One mouth, three carriers — the same shape at three weights. */
const Dubbing = ({ deep }: { deep: string }) => (
  <>
    <path d={sq(84, 90, 72, 84)} fill={P(0.96)} />
    <g fill={deep}>
      <circle cx={84} cy={74} r={13} />
      <path d="M62,118 Q65,92 84,90 Q103,92 106,118 Z" />
    </g>
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d={`M140,${52 + i * 38 + 14} q40,${-16 + i * 5} 100,0`}
        fill="none"
        stroke={P([0.95, 0.68, 0.42][i])}
        strokeWidth={10}
        strokeLinecap="round"
      />
    ))}
  </>
);

const SYMBOLS: Record<string, (p: { deep: string }) => React.ReactElement> = {
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
  const accent = accentOf(project.slug);
  // A future workflow with no symbol yet gets the grid rather than an empty box.
  const Symbol = SYMBOLS[project.slug] ?? ScriptToImage;

  /*
   * Gradient ids must be unique per instance. Five tiles on the Systems index
   * means five copies of this SVG in one document, and duplicate ids mean
   * every tile paints with whichever gradient the browser resolved first —
   * all five come out the same colour, which looks like a data bug and isn't.
   */
  const uid = `wp-${project.slug}`;
  const deep = shade(accent, 0.16);

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
        <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0.32" y2="1">
          <stop offset="0" stopColor={tint(accent, 0.46)} />
          <stop offset="0.5" stopColor={tint(accent, 0.06)} />
          <stop offset="1" stopColor={shade(accent, 0.2)} />
        </linearGradient>
        {/* Corner falloff. Without it a flat gradient reads as printed colour
            rather than as a lit surface. */}
        <radialGradient id={`${uid}-v`} cx="0.62" cy="0.46" r="0.78">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id={`${uid}-s`} cx="0.24" cy="0.06" r="0.72">
          <stop offset="0" stopColor="#F7F3EC" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#F7F3EC" stopOpacity="0.1" />
          <stop offset="1" stopColor="#F7F3EC" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7F3EC" stopOpacity="0.3" />
          <stop offset="1" stopColor="#F7F3EC" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#${uid}-g)`} />
      <rect width={W} height={H} fill={`url(#${uid}-v)`} />
      <rect width={W} height={H} fill={`url(#${uid}-s)`} />
      {/* The specular band Apple puts across the upper third of every icon —
          a highlight that curves, not a straight sheen. */}
      <path
        d={`M0,0 H${W} V54 Q${W / 2},92 0,54 Z`}
        fill={`url(#${uid}-b)`}
        opacity={0.55}
      />

      <Symbol deep={deep} />

      <rect
        x={0.5} y={0.5} width={W - 1} height={H - 1}
        fill="none" stroke={P(0.22)} strokeWidth={1}
      />
    </svg>
  );
}
