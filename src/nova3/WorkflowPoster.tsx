import type { AutomationProject } from '@/data/work';

/**
 * A drawn poster for each workflow.
 *
 * WHY NOT THE SCREENSHOT
 * The thumbnails were product screenshots of dark internal tools — a wall of
 * 4pt UI shrunk to 96px. At that size a screenshot carries no information at
 * all: you cannot read the labels, and every one of them is the same dark
 * rectangle, so five distinct systems looked like five copies of the same
 * thing. It was also the identical file the case study then showed full-size
 * two scrolls later, so the hero was a spoiler of the interface module.
 *
 * A workflow's real shape is its PIPELINE, and that is a diagram, not a
 * photograph. So each poster draws that workflow's own architecture: one node
 * per stage, sized by how many steps that stage carries, connected in order.
 * Everything is derived from the project data, so a poster cannot drift out of
 * date — add a stage to the architecture and the poster grows a node.
 *
 * They read as a set because they share a grammar, and they are individually
 * recognisable because no two workflows have the same stage shape. That is the
 * thing five screenshots could not do.
 */

/**
 * Deterministic jitter.
 *
 * Perfectly even nodes read as a chart. A little variation reads as a drawing.
 * It has to be derived from the slug rather than random so a poster looks the
 * same on every render and every reload — a thumbnail that reshuffles when you
 * navigate back to it looks broken.
 */
function seeded(slug: string) {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i += 1) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export default function WorkflowPoster({
  project,
  variant = 'thumb',
  className = '',
}: {
  project: AutomationProject;
  /**
   * ONE DRAWING CANNOT SERVE BOTH SIZES.
   *
   * Marks sized to read at 124px become dinner plates at 940 — the hero showed
   * four circles the size of a fist. SVG scales everything including the
   * mistake, so the two uses get their own proportions: `thumb` is chunky on a
   * small canvas, `hero` is finer on a large one and has the room to name each
   * stage, which turns the same diagram from a texture into something you can
   * actually read the pipeline off.
   */
  variant?: 'thumb' | 'hero';
  className?: string;
}) {
  const hero = variant === 'hero';
  const stages = project.modules.architecture ?? [];
  const n = Math.max(stages.length, 3);
  const rand = seeded(project.slug);

  /*
   * SIZED FOR THE THUMBNAIL, NOT THE HERO.
   *
   * The first version was drawn on a 320-wide canvas with 6px nodes and a
   * 1.6px stroke, which is fine at 940px and invisible at 96 — where the card
   * actually shows it, a 6px node renders under two pixels. SVG scales, so
   * the fix is proportional, not absolute: everything is sized as a fraction
   * of a much smaller canvas, which makes the marks heavy at thumbnail size
   * and still correct when the same drawing is blown up to the case hero.
   */
  /*
   * The hero canvas is 16:9 ON PURPOSE. `preserveAspectRatio="slice"` crops
   * whatever does not match the frame, and a 520x250 drawing in a 16:9 box
   * lost eighty pixels off each side — which is exactly where the first and
   * last stage labels sit, so the pipeline appeared to start and end
   * mid-word. Matching the frame means nothing is cropped at all.
   */
  const W = hero ? 520 : 160;
  const H = hero ? 293 : 90;
  const padX = hero ? 76 : 20;
  const gap = (W - padX * 2) / (n - 1);

  const nodes = Array.from({ length: n }, (_, i) => {
    const steps = stages[i]?.steps?.length ?? 2;
    return {
      x: padX + gap * i,
      // Vertical position wanders around the centre line, weighted so the
      // first and last nodes stay closer to it — a pipeline should read as
      // entering and leaving level.
      y: (hero ? H * 0.42 : H / 2)
        + (rand() - 0.5) * (hero ? 78 : 30) * (i === 0 || i === n - 1 ? 0.4 : 1),
      r: hero ? 8 + Math.min(steps, 5) * 2 : 4.6 + Math.min(steps, 5) * 1.5,
      steps,
      title: stages[i]?.title ?? '',
    };
  });

  const path = nodes
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = nodes[i - 1];
      const mx = (prev.x + p.x) / 2;
      // A cubic through the midpoint, so the line leaves and enters each node
      // horizontally. Straight segments between scattered points look like a
      // sales chart; this looks like routing.
      return `C ${mx} ${prev.y}, ${mx} ${p.y}, ${p.x} ${p.y}`;
    })
    .join(' ');

  return (
    <svg
      className={`n3-poster ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${project.title} — ${n} stage pipeline`}
    >
      <defs>
        <linearGradient id={`pg-${project.slug}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#pg-${project.slug})`} />

      {/* A faint grid, so the diagram sits on a drawing surface rather than
          floating on a tint. */}
      <g stroke="var(--accent)" strokeOpacity="0.11" strokeWidth={hero ? 0.8 : 0.5}>
        {Array.from({ length: hero ? 9 : 5 }, (_, i) => {
          const rows = hero ? 8 : 4;
          return <line key={`h${i}`} x1="0" x2={W} y1={(H / rows) * i} y2={(H / rows) * i} />;
        })}
        {Array.from({ length: hero ? 17 : 9 }, (_, i) => {
          const cols = hero ? 16 : 8;
          return <line key={`v${i}`} y1="0" y2={H} x1={(W / cols) * i} x2={(W / cols) * i} />;
        })}
      </g>

      <path
        d={path}
        fill="none"
        stroke="var(--accent)"
        strokeOpacity="0.62"
        strokeWidth={hero ? 2.4 : 2}
        strokeLinecap="round"
      />

      {nodes.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={p.r + (hero ? 6 : 3.4)} fill="var(--accent)" fillOpacity="0.12" />
          <circle
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill="#FFFDF9"
            stroke="var(--accent)"
            strokeOpacity="0.85"
            strokeWidth={hero ? 2.2 : 1.8}
          />
          {/* The last node is the output, so it is filled — the pipeline
              visibly resolves into something rather than just stopping. */}
          {i === n - 1 && (
            <circle cx={p.x} cy={p.y} r={Math.max(p.r - (hero ? 5 : 2.6), 2.4)} fill="var(--accent)" />
          )}

          {/* At hero size there is room to say what each stage IS, which turns
              the drawing from a texture into a diagram you can read the
              pipeline off. There is no such room at 124px, so the thumbnail
              stays wordless rather than carrying 3px type. */}
          {hero && p.title && (
            <>
              <text
                x={p.x}
                y={H - 42}
                textAnchor="middle"
                fill="var(--accent)"
                fillOpacity="0.85"
                style={{ font: '600 11px Inter, system-ui, sans-serif', letterSpacing: '0.06em' }}
              >
                {String(i + 1).padStart(2, '0')}
              </text>
              <text
                x={p.x}
                y={H - 26}
                textAnchor="middle"
                fill="var(--ink)"
                fillOpacity="0.62"
                style={{ font: '500 10.5px Inter, system-ui, sans-serif' }}
              >
                {p.title.length > 15 ? `${p.title.slice(0, 14)}…` : p.title}
              </text>
              <line
                x1={p.x} x2={p.x} y1={p.y + p.r + 5} y2={H - 54}
                stroke="var(--accent)" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 3"
              />
            </>
          )}
        </g>
      ))}
    </svg>
  );
}
