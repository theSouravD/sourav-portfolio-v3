import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import AnimatedContent from '@/reactbits/AnimatedContent';
import Magnet from '@/reactbits/Magnet';
import Poster from '@/components/Poster';
import AutomationCase from '@/components/AutomationCase';
import { automationProjects } from '@/data/work';

/*
 * `container` on every entrance below is load-bearing, not decoration.
 * AnimatedContent's trigger watches the window unless it is told which
 * element actually scrolls — and here that is `.n3-stage`. Watching a
 * scroller that never moves means every module below the fold stays at
 * opacity 0 for good: the case studies rendered their title and hero and
 * then nothing, which read as "the data is missing" when in fact it was
 * all there and simply never faded in.
 */

/**
 * The case study.
 *
 * The first pass linked each system to `#case-{slug}` and nothing was listening
 * — the anchors went nowhere, which is why the case studies looked missing.
 * They were never missing from the data; they had no room to open in.
 *
 * This is that room. It is a full section like any other, with its own URL, so
 * a written breakdown can be linked to and sent on its own — which for
 * workflow work is the whole point, since the case is the evidence and the
 * thumbnail is only the poster.
 */
export default function CaseRoom({ slug, onBack }: { slug: string; onBack: () => void }) {
  const i = automationProjects.findIndex((p) => p.slug === slug);
  const project = automationProjects[i];

  if (!project) {
    return (
      <div className="n3-room">
        <h2 className="n3-title">Not found</h2>
        <p className="n3-note">That case study doesn't exist.</p>
        <button type="button" className="n3-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Systems
        </button>
      </div>
    );
  }

  // Cases are read in sequence more often than picked from a list, so the foot
  // of one offers the next rather than sending you back to the index first.
  const next = automationProjects[(i + 1) % automationProjects.length];

  return (
    <div className="n3-room n3-case-room">
      <AnimatedContent container=".n3-stage" distance={22} duration={0.6} ease="power3.out" threshold={0} delay={0.02}>
        <button type="button" className="n3-back" onClick={onBack}>
          <ArrowLeft size={13} /> Systems
        </button>
      </AnimatedContent>

      <header className="n3-case-head">
        <AnimatedContent container=".n3-stage" distance={26} duration={0.7} ease="power3.out" threshold={0} delay={0.06}>
          <p className="n3-eyebrow n3-accent">
            <FileText size={11} /> {project.tool} · {project.category}
          </p>
        </AnimatedContent>
        <AnimatedContent container=".n3-stage" distance={26} duration={0.7} ease="power3.out" threshold={0} delay={0.12}>
          <h2 className="n3-title">{project.title}</h2>
        </AnimatedContent>
        <AnimatedContent container=".n3-stage" distance={20} duration={0.7} ease="power3.out" threshold={0} delay={0.18}>
          <p className="n3-note">{project.summary}</p>
        </AnimatedContent>
      </header>

      <AnimatedContent container=".n3-stage" distance={30} duration={0.8} ease="power3.out" threshold={0} delay={0.24}>
        <div className="n3-case-hero">
          <Poster src={project.thumbnail} caption={project.tool} />
        </div>
      </AnimatedContent>

      {/* The modules — overview, process, outputs — rendered by the component
          that already knew how, now that it has somewhere to live. */}
      <AnimatedContent container=".n3-stage" distance={24} duration={0.8} ease="power3.out" threshold={0} delay={0.3}>
        <div className="n3-case-modules">
          <AutomationCase project={project} />
        </div>
      </AnimatedContent>

      <div className="n3-case-next">
        <span className="n3-eyebrow">Next case</span>
        <Magnet padding={70} magnetStrength={5}>
          <a className="n3-btn n3-btn-solid" href={`#case/${next.slug}`}>
            {next.title}
            <span><ArrowRight size={14} /></span>
          </a>
        </Magnet>
      </div>
    </div>
  );
}
