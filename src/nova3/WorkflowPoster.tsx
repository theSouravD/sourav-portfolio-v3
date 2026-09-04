import type { AutomationProject } from '@/data/work';

/**
 * A drawn poster per workflow — and this is the second attempt.
 *
 * WHAT WAS WRONG WITH THE FIRST ONE
 * It drew every workflow the same way: nodes on a line, sized by stage count.
 * That is a picture of "a pipeline exists", which is true of all five and
 * therefore says nothing about any of them. Generated from the data, defensibly
 * consistent, and completely uninformative — five diagrams you could shuffle
 * without anyone noticing.
 *
 * WHAT THESE DO INSTEAD
 * Each draws the TRANSFORMATION its workflow performs, in the vocabulary of
 * that transformation:
 *
 *   Script to Motion   lines of script becoming frames on a timeline
 *   Script to Image    a script becoming the scene grid it generates
 *   Character Canvas   one character holding across four different shots
 *   Thumbnail Gen      one show's canon becoming a wall of covers
 *   Dubbing            one waveform fanning into three languages
 *
 * You should be able to tell which is which with the titles covered. That is
 * the whole test, and the old ones failed it.
 *
 * THEY STILL READ AS A SET because the grammar is shared and enforced here
 * rather than by each drawing remembering to comply: one canvas, one grid
 * ground, one arrow, one script block, everything inheriting `--accent` so a
 * poster is graded with its room for free. The variation is in the subject,
 * which is where variation belongs.
 *
 * ONE CANVAS FOR BOTH SIZES. These are 16:9 and composed to fill the frame, so
 * the same drawing serves a 124px card and a 940px hero. The previous version
 * needed two variants only because its marks were sized in absolute units
 * instead of composed.
 */

const W = 160;
const H = 90;

/* ---- shared furniture ---------------------------------------------- */

function Ground({ slug }: { slug: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`pg-${slug}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.15" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#pg-${slug})`} />
      <g stroke="var(--accent)" strokeOpacity="0.10" strokeWidth="0.4">
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`h${i}`} x1="0" x2={W} y1={(H / 4) * i} y2={(H / 4) * i} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`v${i}`} y1="0" y2={H} x1={(W / 8) * i} x2={(W / 8) * i} />
        ))}
      </g>
    </>
  );
}

/**
 * A stack of ruled lines standing in for a script. Every poster whose input is
 * writing opens with this same block, so "it starts from a script" is one
 * visual idea reused rather than four similar ones drawn slightly differently.
 */
function Script({ x, y, w = 28, rows = 5 }: { x: number; y: number; w?: number; rows?: number }) {
  return (
    <g>
      <rect
        x={x} y={y - 5} width={w} height={rows * 5 + 7} rx="2.5"
        fill="#FFFDF9" stroke="var(--accent)" strokeOpacity="0.42" strokeWidth="0.9"
      />
      {Array.from({ length: rows }, (_, i) => (
        <rect
          key={i}
          x={x + 4} y={y + i * 5} width={(w - 8) * (i % 3 === 2 ? 0.55 : 1)} height="1.6" rx="0.8"
          fill="var(--accent)" fillOpacity={0.55 - i * 0.05}
        />
      ))}
    </g>
  );
}

/** The transformation arrow. One shape, everywhere. */
function Arrow({ x, y, len = 14 }: { x: number; y: number; len?: number }) {
  return (
    <g stroke="var(--accent)" strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round">
      <line x1={x} y1={y} x2={x + len} y2={y} />
      <path d={`M ${x + len - 3.5} ${y - 3} L ${x + len} ${y} L ${x + len - 3.5} ${y + 3}`} fill="none" />
    </g>
  );
}

/* ---- the five ------------------------------------------------------- */

/** SCRIPT → MOTION. Script becomes frames on a duration-aligned timeline. */
function ScriptToMotion() {
  return (
    <>
      <Script x={11} y={32} rows={5} />
      <Arrow x={43} y={45} />

      {/*
        A filmstrip, not a row of cards. The sprocket perforations are the one
        detail that makes three rectangles read as film — without them this is
        indistinguishable from the scene grid two posters over.
      */}
      <g>
        <rect x={62} y={24} width={88} height={30} rx="2" fill="#FFFDF9"
              stroke="var(--accent)" strokeOpacity="0.4" strokeWidth="0.9" />
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i} fill="var(--accent)" fillOpacity="0.3">
            <rect x={65.5 + i * 7.6} y={26} width="3" height="2" rx="0.6" />
            <rect x={65.5 + i * 7.6} y={50} width="3" height="2" rx="0.6" />
          </g>
        ))}
        {[0, 1, 2].map((f) => (
          <rect
            key={f}
            x={66 + f * 28} y={30.5} width={24} height={15} rx="1.2"
            fill="var(--accent)" fillOpacity={0.16 + f * 0.1}
          />
        ))}
      </g>

      {/*
        The timeline underneath, with segments of different lengths and a
        playhead. "Duration-aligned" is what this workflow is FOR, so the
        drawing has to show durations rather than just frames.
      */}
      <g>
        <line x1={62} y1={68} x2={150} y2={68} stroke="var(--accent)" strokeOpacity="0.25" strokeWidth="0.8" />
        {([[62, 24], [88, 30], [120, 30]] as const).map(([x, w], i) => (
          <rect key={i} x={x} y={64.5} width={w} height={7} rx="1.6"
                fill="var(--accent)" fillOpacity={0.3 + i * 0.13} />
        ))}
        <line x1={104} y1={59} x2={104} y2={77} stroke="var(--accent)" strokeWidth="1.1" />
        <circle cx={104} cy={59} r="2" fill="var(--accent)" />
      </g>
    </>
  );
}

/** SCRIPT → IMAGE. Script becomes the scene grid it generates. */
function ScriptToImage() {
  return (
    <>
      <Script x={11} y={32} rows={5} />
      <Arrow x={43} y={45} />

      <g>
        {Array.from({ length: 9 }, (_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <rect
              key={i}
              x={66 + col * 29} y={16 + row * 21} width={26} height={18} rx="1.4"
              fill="var(--accent)"
              fillOpacity={0.12 + ((i * 5) % 7) * 0.045}
              stroke="var(--accent)" strokeOpacity="0.28" strokeWidth="0.6"
            />
          );
        })}
        {/* One cell framed: picking the grid is the step a person performs
            inside this workflow, so the drawing shows a choice being made. */}
        <rect
          x={93} y={35} width={32} height={24} rx="2.4"
          fill="none" stroke="var(--accent)" strokeOpacity="0.9" strokeWidth="1.5"
        />
      </g>
    </>
  );
}

/** CHARACTER CANVAS. One character, unchanged across four different shots. */
function CharacterCanvas() {
  return (
    <>
      {/*
        Four frames with four different backdrops and the SAME figure drawn at
        the same coordinates in each. The invariant is the entire product of
        this workflow, so the figure is repeated exactly rather than varied —
        and the dashed rules across all four are what make the sameness
        legible rather than merely true.
      */}
      {[0, 1, 2, 3].map((s) => {
        const x = 11 + s * 35.5;
        return (
          <g key={s}>
            <rect
              x={x} y={20} width={31} height={50} rx="2.4"
              fill="#FFFDF9" stroke="var(--accent)"
              strokeOpacity={s === 0 ? 0.85 : 0.35}
              strokeWidth={s === 0 ? 1.4 : 0.9}
            />
            <rect x={x + 2} y={22 + s * 3} width={27} height={9 + s * 2.5} rx="1.2"
                  fill="var(--accent)" fillOpacity="0.14" />
            <circle cx={x + 15.5} cy={45} r="5.2" fill="var(--accent)" fillOpacity="0.75" />
            <path d={`M ${x + 6} 68 a 9.5 11 0 0 1 19 0 z`} fill="var(--accent)" fillOpacity="0.55" />
          </g>
        );
      })}
      <g stroke="var(--accent)" strokeOpacity="0.42" strokeWidth="0.6" strokeDasharray="2 2.5">
        <line x1="5" y1="45" x2="155" y2="45" />
        <line x1="5" y1="68" x2="155" y2="68" />
      </g>
    </>
  );
}

/** THUMBNAILS AT SCALE. One show's canon becomes a wall of covers. */
function ThumbnailWall() {
  return (
    <>
      <Script x={9} y={34} w={24} rows={4} />
      <Arrow x={37} y={45} len={11} />

      {/*
        A wall, not a tidy grid. The claim this workflow makes is volume, and
        volume reads as many small things. The finished cover in front is
        lifted and complete with its title lines — what comes out is a
        deliverable, not a batch.
      */}
      <g>
        {Array.from({ length: 12 }, (_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          return (
            <rect
              key={i}
              x={55 + col * 25} y={13 + row * 23} width={22} height={20} rx="1.6"
              fill="var(--accent)"
              fillOpacity={0.1 + ((i * 3) % 5) * 0.05}
              stroke="var(--accent)" strokeOpacity="0.22" strokeWidth="0.5"
            />
          );
        })}
        <g>
          <rect x={95} y={28} width={38} height={36} rx="2.6"
                fill="#FFFDF9" stroke="var(--accent)" strokeOpacity="0.85" strokeWidth="1.3" />
          <rect x={98.5} y={31.5} width={31} height={19} rx="1.4"
                fill="var(--accent)" fillOpacity="0.42" />
          <rect x={98.5} y={54} width={22} height="2.6" rx="1.3"
                fill="var(--accent)" fillOpacity="0.5" />
          <rect x={98.5} y={59} width={14} height="2.2" rx="1.1"
                fill="var(--accent)" fillOpacity="0.32" />
        </g>
      </g>
    </>
  );
}

/** DUBBING. One English master fanning into three languages. */
function Dubbing() {
  /*
   * One shared bar pattern for the master and every output, so the three
   * results are visibly the SAME performance re-voiced rather than three
   * unrelated clips. Drawing three different waveforms would say the opposite
   * of what the workflow does.
   */
  const heights = Array.from({ length: 14 }, (_, i) => 3 + Math.abs(Math.sin(i * 1.15)) * 12);

  return (
    <>
      <g>
        {heights.map((h, i) => (
          <rect
            key={i}
            x={11 + i * 2.7} y={45 - h / 2} width="1.6" height={h} rx="0.8"
            fill="var(--accent)" fillOpacity="0.72"
          />
        ))}
        <text
          x={11} y={63}
          fill="var(--accent)" fillOpacity="0.8"
          style={{ font: '700 6px Inter, system-ui, sans-serif', letterSpacing: '0.14em' }}
        >
          EN
        </text>
      </g>

      <Arrow x={52} y={45} len={12} />

      {[0, 1, 2].map((o) => {
        const y = 19 + o * 26;
        return (
          <g key={o}>
            <path
              d={`M 66 45 C 78 45, 80 ${y}, 92 ${y}`}
              fill="none" stroke="var(--accent)" strokeOpacity="0.32" strokeWidth="0.9"
            />
            <circle cx={92} cy={y} r="1.9" fill="var(--accent)" fillOpacity="0.6" />
            {heights.slice(0, 11).map((h, i) => (
              <rect
                key={i}
                x={97 + i * 2.5} y={y - h / 3} width="1.4" height={h / 1.5} rx="0.7"
                fill="var(--accent)" fillOpacity={0.52 - o * 0.08}
              />
            ))}
            <text
              x={128} y={y + 2}
              fill="var(--accent)" fillOpacity="0.75"
              style={{ font: '700 6px Inter, system-ui, sans-serif', letterSpacing: '0.14em' }}
            >
              {['HI', 'ES', 'PT'][o]}
            </text>
          </g>
        );
      })}
    </>
  );
}

/* ---- dispatch ------------------------------------------------------- */

const DRAWINGS: Record<string, () => React.ReactElement> = {
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
  // A future workflow with no drawing yet gets the script-and-grid opening
  // rather than an empty box.
  const Drawing = DRAWINGS[project.slug] ?? ScriptToImage;

  return (
    <svg
      className={`n3-poster ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={project.title}
    >
      <Ground slug={project.slug} />
      <Drawing />
    </svg>
  );
}
