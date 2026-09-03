import { experience } from '@/data/content';
import type { Chapter } from '../chapters';

const ease = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);

/** Renders the source copy's **bold** spans. */
function RichText({ value }: { value: string }) {
  return (
    <>
      {value.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-medium text-white">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/**
 * One role, staged as a shot.
 *
 * Every element occupies a fixed slot in a grid that is the size of the stage;
 * the entrance only moves opacity and translate within those slots, so the
 * composition holds still no matter where in the chapter you stop.
 */
export default function RoleShot({
  chapter,
  local,
}: {
  chapter: Chapter;
  local: number;
}) {
  const job = experience[chapter.roleIndex ?? 0];

  const head = ease(local / 0.22);
  const body = ease((local - 0.1) / 0.3);
  const out = Math.max(0, (local - 0.78) / 0.22);

  const year = job.period.split(' - ')[0];

  return (
    <div className="flex h-full flex-col justify-center pb-28 pt-24">
      <div className="nova-shell">
        {/* Slate strip */}
        <div
          className="mb-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-white/12 pb-4"
          style={{ opacity: head * (1 - out), transform: `translateY(${(1 - head) * 18}px)` }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
            {chapter.scene}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
            {job.company}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
            {job.place}
          </span>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.22em] text-white/70">
            {job.period}
          </span>
        </div>

        <div className="grid gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-16">
          {/* Year + title */}
          <div>
            <div
              className="font-mono text-[clamp(3.5rem,9vw,7rem)] font-normal leading-[0.85] tracking-[-0.04em] text-white/12 tabular-nums"
              style={{
                opacity: head,
                transform: `translateX(${(1 - head) * -30}px) translateY(${out * -30}px)`,
              }}
            >
              {year.split(' ').pop()}
            </div>

            <h2
              className="mt-4 text-[clamp(1.6rem,3.6vw,2.9rem)] font-normal leading-[1.08] tracking-[-0.025em] text-white"
              style={{
                opacity: head * (1 - out),
                transform: `translateY(${(1 - head) * 30 + out * -30}px)`,
                textShadow: '0 10px 30px rgba(0,0,0,0.6)',
              }}
            >
              {job.title}
            </h2>

            <div
              className="mt-5 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-4 py-2 backdrop-blur-md"
              style={{ opacity: body * (1 - out) }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/80">
                {job.duration}
              </span>
            </div>
          </div>

          {/* Bullets, staggered by scroll rather than by timer */}
          <ul className="grid content-center gap-3.5">
            {job.bullets.map((b, i) => {
              const step = ease((local - 0.12 - i * 0.05) / 0.26);
              return (
                <li
                  key={i}
                  className="relative pl-5 text-[13.5px] leading-[1.75] text-white/74 before:absolute before:left-0 before:top-[0.7em] before:h-1 before:w-1 before:rounded-full before:bg-white/40"
                  style={{
                    opacity: step * (1 - out),
                    transform: `translateY(${(1 - step) * 16}px)`,
                  }}
                >
                  <RichText value={b} />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
