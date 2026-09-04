import { useState } from 'react';
import { Play } from 'lucide-react';
import Lightbox from './Lightbox';
import Poster from './Poster';
import type { AutomationProject, MediaItem } from '@/data/work';
import { portfolioWork } from '@/data/work';

function Module({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ac-mod border-t border-white/12 pt-6">
      <div className="flex items-baseline gap-4">
        <span className="ac-idx nova-label shrink-0 !text-[11px]">{index}</span>
        <h4 className="ac-h text-base font-medium tracking-tight text-white">{title}</h4>
      </div>
      <div className="mt-4 pl-0 sm:pl-10">{children}</div>
    </section>
  );
}

/** Full case-study body for one automation workflow. */
export default function AutomationCase({ project }: { project: AutomationProject }) {
  const [active, setActive] = useState<MediaItem | null>(null);
  const m = project.modules;
  const outputs = (project as unknown as { outputGroup?: string }).outputGroup;
  const outputItems = outputs
    ? ((portfolioWork as Record<string, unknown>)[outputs] as MediaItem[] | undefined)
    : undefined;

  let n = 0;
  const next = () => String(++n).padStart(2, '0');

  return (
    <>
    <div className="grid gap-7">
      {/* Overview */}
      {m.overview && (
        <Module index={next()} title="Overview">
          <p className="ac-p max-w-[70ch] text-sm leading-[1.7] text-white/72">
            {m.overview.description}
          </p>
          {m.overview.inputs && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {m.overview.inputs.map((i: string) => (
                <li
                  key={i}
                  className="ac-chip rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-white/80 backdrop-blur-md"
                >
                  {i}
                </li>
              ))}
            </ul>
          )}
        </Module>
      )}

      {/* Interface still */}
      {m.interface && (
        <Module index={next()} title="Interface">
          <img
            src={m.interface.imageUrl}
            alt={m.interface.alt}
            loading="lazy"
            className="ac-img w-full rounded-xl border border-white/15"
          />
        </Module>
      )}

      {/*
        The workflow's output running in the live app.
        Only the Growth Show study carries this module, which is exactly why it
        was missed here — the renderer handled every key that appeared more than
        once and silently dropped the one that didn't.
      */}
      {m['app-example'] && (
        <Module index={next()} title="In the app">
          <img
            src={m['app-example'].imageUrl}
            alt={m['app-example'].alt}
            loading="lazy"
            className="ac-img w-full rounded-xl border border-white/15"
          />
        </Module>
      )}

      {/* Architecture stages */}
      {m.architecture && (
        <Module index={next()} title="Architecture">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {m.architecture.map((stage: { title: string; steps: string[] }, i: number) => (
              <div
                key={stage.title}
                className="ac-card rounded-xl border border-white/15 bg-white/8 p-4 backdrop-blur-md"
              >
                <div className="ac-lab nova-label mb-2.5">
                  {String(i + 1).padStart(2, '0')} · {stage.title}
                </div>
                <ul className="grid gap-1.5">
                  {stage.steps.map((s) => (
                    <li key={s} className="ac-li text-xs leading-relaxed text-white/70">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Module>
      )}

      {/* Scene grids */}
      {m.grids && (
        <Module index={next()} title="Scene grids">
          <div className="grid gap-3 sm:grid-cols-2">
            {m.grids.map((g: { label: string; columns: number; caption: string }) => (
              <div
                key={g.label}
                className="ac-card rounded-xl border border-white/15 bg-white/8 p-4 backdrop-blur-md"
              >
                <div
                  className="grid gap-1.5"
                  style={{ gridTemplateColumns: `repeat(${g.columns}, minmax(0,1fr))` }}
                >
                  {Array.from({ length: g.columns * g.columns }).map((_, i) => (
                    <span
                      key={i}
                      className="ac-sq aspect-square rounded-md bg-white/12"
                      style={{ opacity: 0.35 + ((i % 3) + 1) * 0.16 }}
                    />
                  ))}
                </div>
                <h5 className="ac-h5 mt-4 text-sm font-medium text-white">{g.label}</h5>
                <p className="ac-li mt-1 text-xs leading-relaxed text-white/65">{g.caption}</p>
              </div>
            ))}
          </div>
        </Module>
      )}

      {/* Coverage examples */}
      {m.coverage && (
        <Module index={next()} title="Coverage">
          <p className="ac-p max-w-[70ch] text-sm leading-[1.7] text-white/72">
            {m.coverage.description}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {m.coverage.examples.map(
              (ex: { label: string; imageUrl: string; alt: string; caption: string }) => (
                <div
                  key={ex.label}
                  className="ac-card overflow-hidden rounded-xl border border-white/15 bg-white/8 backdrop-blur-md"
                >
                  <img src={ex.imageUrl} alt={ex.alt} loading="lazy" className="w-full" />
                  <div className="p-4">
                    <h5 className="ac-h5 text-sm font-medium text-white">{ex.label}</h5>
                    <p className="ac-li mt-1 text-xs leading-relaxed text-white/65">{ex.caption}</p>
                  </div>
                </div>
              )
            )}
          </div>
        </Module>
      )}

      {/* CD feedback + error rates */}
      {m.feedback && (
        <Module index={next()} title="Creative Director feedback">
          <p className="ac-p max-w-[70ch] text-sm leading-[1.7] text-white/72">
            {m.feedback.description}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="ac-card rounded-xl border border-white/15 bg-white/8 p-4 backdrop-blur-md">
              <div className="ac-lab nova-label">{m.feedback.previousTool}</div>
              <div className="ac-num mt-1.5 text-xl font-normal tracking-tight text-white/70">
                {m.feedback.previousErrorRate}
              </div>
            </div>
            <div className="ac-card is-now rounded-xl border border-white/30 bg-white/15 p-4 backdrop-blur-md">
              <div className="ac-lab nova-label !text-white/70">{m.feedback.currentTool}</div>
              <div className="ac-num is-now mt-1.5 text-xl font-normal tracking-tight text-white">
                {m.feedback.currentErrorRate}
              </div>
            </div>
          </div>
          <div className="mt-3 grid gap-3">
            {m.feedback.items.map(
              (it: { title: string; bullets: string[]; errorRate?: string }) => (
                <div
                  key={it.title}
                  className="ac-card rounded-xl border border-white/15 bg-white/8 p-4 backdrop-blur-md"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h5 className="ac-h5 text-sm font-medium text-white">{it.title}</h5>
                    {it.errorRate && <span className="ac-lab nova-label">{it.errorRate}</span>}
                  </div>
                  <ul className="mt-2 grid gap-1.5">
                    {it.bullets.map((b) => (
                      <li
                        key={b}
                        className="ac-bul relative pl-4 text-xs leading-relaxed text-white/68 before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-white/35"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>
        </Module>
      )}

      {/* Show gallery */}
      {m.gallery && (
        <Module index={next()} title="Gallery">
          <p className="ac-p max-w-[70ch] text-sm leading-[1.7] text-white/72">
            {m.gallery.description}
          </p>
          <div className="ac-lab nova-label mt-2">{m.gallery.sourceLabel}</div>
          <div className="mt-4 grid gap-4">
            {m.gallery.shows.map((show: { name: string; urls: string[] }) => (
              <div
                key={show.name}
                className="ac-card rounded-xl border border-white/15 bg-white/8 p-4 backdrop-blur-md"
              >
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <h5 className="ac-h5 text-sm font-medium text-white">{show.name}</h5>
                  <span className="ac-lab nova-label">{show.urls.length} samples</span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
                  {show.urls.map((u, i) => (
                    <img
                      key={i}
                      src={u}
                      alt={`${show.name} thumbnail ${i + 1}`}
                      loading="lazy"
                      className="ac-gimg aspect-square w-full rounded-md border border-white/12 object-cover"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Module>
      )}

      {/* Rendered outputs */}
      {outputItems && outputItems.length > 0 && (
        <Module index={next()} title="Outputs">
          <div className="grid gap-4 sm:grid-cols-2">
            {outputItems.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setActive(o)}
                className="ac-out cursor-target group overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-left backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:bg-white/15"
              >
                <span className="ac-out-frame relative block aspect-video overflow-hidden bg-black/40">
                  <Poster item={o} className="transition-transform duration-700 group-hover:scale-105" />
                  <span className="ac-out-scrim absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="ac-out-play absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/15 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
                    <Play size={15} className="ml-0.5 fill-white text-white group-hover:fill-black group-hover:text-black" />
                  </span>
                </span>
                <span className="block px-4 py-3.5">
                  <span className="ac-h5 block truncate text-sm font-medium text-white">{o.title}</span>
                  <span className="ac-lab nova-label mt-1 block truncate">{o.meta}</span>
                </span>
              </button>
            ))}
          </div>
          {/* `outputs.description` was in the data from the start and nothing
              read it — three of the five studies carry one, so on those the
              Outputs module opened with no account of what was being looked
              at. */}
          {m.outputs?.description && (
            <p className="ac-p mt-4 max-w-[70ch] text-sm leading-[1.7] text-white/72">
              {m.outputs.description}
            </p>
          )}
          {m.outputs?.knownIssue && (
            <p className="ac-note mt-4 rounded-xl border border-white/15 bg-white/8 p-4 text-xs leading-relaxed text-white/65 backdrop-blur-md">
              {m.outputs.knownIssue}
            </p>
          )}
        </Module>
      )}
    </div>
    <Lightbox item={active} onClose={() => setActive(null)} />
    </>
  );
}
