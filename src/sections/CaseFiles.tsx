import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import AnimatedContent from '@/reactbits/AnimatedContent';
import AutomationCase from '@/components/AutomationCase';
import { automationContribution } from '@/data/content';
import { automationProjects } from '@/data/work';

/**
 * Below the film: the long-form case studies the reel links into.
 * Normal document flow — this is the part people read, not watch.
 */
export default function CaseFiles() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="cases" className="nova-shell scroll-mt-24 py-24 md:py-32">
      <AnimatedContent distance={40} duration={0.8}>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
          Appendix · Case files
        </span>
        <h2 className="mt-3 text-[clamp(2rem,4.6vw,3.6rem)] font-normal leading-[1.05] tracking-[-0.03em] text-white">
          How the workflows were built
        </h2>
        <p className="mt-6 max-w-[64ch] text-sm leading-[1.75] text-white/72">
          {automationContribution.body}
        </p>
      </AnimatedContent>

      <div className="mt-12 grid gap-4">
        {automationProjects.map((p, i) => {
          const isOpen = open === p.slug;
          return (
            <AnimatedContent key={p.slug} distance={36} duration={0.8} delay={Math.min(i, 3) * 0.07}>
              <article
                id={`case-${p.slug}`}
                className="scroll-mt-24 overflow-hidden rounded-2xl border border-white/15 bg-white/8 backdrop-blur-xl"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : p.slug)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-5 px-6 py-6 text-left md:px-8"
                >
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                      {p.tool}
                    </span>
                    <strong className="mt-1 block text-[clamp(1.05rem,1.7vw,1.375rem)] font-medium tracking-tight text-white">
                      {p.title}
                    </strong>
                    <span className="mt-2 block max-w-[70ch] text-[13px] leading-relaxed text-white/62">
                      {p.summary}
                    </span>
                  </span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-white/45 transition-transform duration-500 ${isOpen ? 'rotate-180 text-white' : ''}`}
                  />
                </button>
                <div className={`grid transition-all duration-500 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="border-t border-white/12 px-6 pb-8 pt-6 md:px-8">
                      <AutomationCase project={p} />
                    </div>
                  </div>
                </div>
              </article>
            </AnimatedContent>
          );
        })}
      </div>
    </section>
  );
}
