import { useState } from 'react';
import { ArrowDown, ArrowUpRight, Download, FileText, Mail, Play } from 'lucide-react';
import AnimatedContent from '@/reactbits/AnimatedContent';
import SpotlightCard from '@/reactbits/SpotlightCard';
import ShinyText from '@/reactbits/ShinyText';
import Magnet from '@/reactbits/Magnet';
import LogoLoop from '@/reactbits/LogoLoop';
import PressureName from '@/film/PressureName';
import Counter from '@/film/shots/Counter';
import Poster from '@/components/Poster';
import Lightbox from '@/components/Lightbox';
import { profile, stats, about, coreSkills, tools, experience } from '@/data/content';
import { automationProjects, portfolioWork } from '@/data/work';
import type { MediaItem } from '@/data/work';
import type { SectionId } from './scenes';

/**
 * The six rooms.
 *
 * Each one is a single screen of content with a directed entrance: nothing
 * relies on scrolling to be discovered, and nothing animates in from
 * invisible. A section that starts at opacity zero waiting for an observer is
 * a section a visitor can arrive at and see nothing in — the entrances here
 * are on a timer from mount, so the room is always lit by the time you look.
 */

const rise = (delay: number) => ({
  distance: 26,
  direction: 'vertical' as const,
  duration: 0.7,
  ease: 'power3.out',
  initialOpacity: 0,
  animateOpacity: true,
  threshold: 0,
  delay,
});

/* ================================================================
 * HOME
 * ================================================================ */
function Home({ onGo, accent }: { onGo: (id: SectionId) => void; accent: string }) {
  return (
    <div className="n3-room n3-home">
      <AnimatedContent {...rise(0.05)}>
        <p className="n3-eyebrow">{profile.tagline}</p>
      </AnimatedContent>

      <AnimatedContent {...rise(0.12)}>
        <h1 className="n3-name">
          <PressureName text={profile.name} radius={260} />
        </h1>
      </AnimatedContent>

      <AnimatedContent {...rise(0.2)}>
        <div className="n3-role">
          <ShinyText
            text={profile.role}
            speed={5}
            color="rgba(255,255,255,0.5)"
            shineColor="#ffffff"
            spread={160}
          />
        </div>
      </AnimatedContent>

      {/*
        The three figures a recruiter looks for, counted up rather than stated.
        A number that arrives reads as a measurement; a number that fades in
        reads as decoration.
      */}
      <AnimatedContent {...rise(0.3)}>
        <dl className="n3-stats">
          {stats.map((s, i) => (
            <div key={s.label}>
              <dt style={{ color: accent }}>
                <Counter to={s.value} start delay={520 + i * 150} />
                <span>{s.suffix}</span>
              </dt>
              <dd>{s.label}</dd>
            </div>
          ))}
        </dl>
      </AnimatedContent>

      <AnimatedContent {...rise(0.4)}>
        <div className="n3-cta">
          <Magnet padding={80} magnetStrength={5}>
            <button type="button" className="n3-btn n3-btn-solid" onClick={() => onGo('work')}>
              See the work
              <span><ArrowDown size={14} /></span>
            </button>
          </Magnet>
          <button type="button" className="n3-btn" onClick={() => onGo('contact')}>
            <Mail size={14} /> Get in touch
          </button>
        </div>
      </AnimatedContent>
    </div>
  );
}

/* ================================================================
 * WORK
 * ================================================================ */
function Work({ accent }: { accent: string }) {
  const [active, setActive] = useState<MediaItem | null>(null);
  const pieces = [
    ...(portfolioWork.direction as MediaItem[]),
    ...(portfolioWork.ai as MediaItem[]),
  ];

  return (
    <div className="n3-room">
      <Head
        kicker="Selected work"
        title="Work"
        note={`${pieces.length} pieces — campaign and trailer work, AI ad creatives, motion and video.`}
        accent={accent}
      />

      {/*
        A plain grid, clicked. No horizontal travel anywhere on this site —
        that axis switch is the single thing that made Nova I confusing, and
        a grid of thumbnails is what everyone already knows how to read.
      */}
      <div className="n3-grid">
        {pieces.slice(0, 12).map((m, i) => (
          <AnimatedContent key={m.id} {...rise(0.06 + i * 0.03)}>
            <SpotlightCard
              className="n3-tile"
              spotlightColor="rgba(255, 255, 255, 0.16)"
            >
              <button type="button" onClick={() => setActive(m)} aria-label={`Play ${m.title}`}>
                <span className="n3-thumb">
                  <Poster item={m} />
                  <span className="n3-play"><Play size={14} /></span>
                </span>
                <span className="n3-tile-title">{m.title}</span>
                <span className="n3-tile-meta">{m.meta}</span>
              </button>
            </SpotlightCard>
          </AnimatedContent>
        ))}
      </div>

      <Lightbox item={active} onClose={() => setActive(null)} />
    </div>
  );
}

/* ================================================================
 * SYSTEMS
 * ================================================================ */
function Systems({ accent }: { accent: string }) {
  return (
    <div className="n3-room">
      <Head
        kicker="Automation workflows"
        title="Systems"
        note="Systems, not clips. Each one is a production pipeline a team runs without me."
        accent={accent}
      />
      <div className="n3-cases">
        {automationProjects.map((p, i) => (
          <AnimatedContent key={p.slug} {...rise(0.08 + i * 0.06)}>
            <SpotlightCard className="n3-case" spotlightColor="rgba(79, 214, 196, 0.20)">
              <a href={`#case-${p.slug}`}>
                <span className="n3-case-thumb"><Poster src={p.thumbnail} caption={p.tool} /></span>
                <span className="n3-case-body">
                  <span className="n3-case-tool" style={{ color: accent }}>
                    <FileText size={10} /> {p.tool}
                  </span>
                  <strong>{p.title}</strong>
                  <span className="n3-case-sum">{p.summary}</span>
                  <span className="n3-case-more">Read the case <ArrowUpRight size={12} /></span>
                </span>
              </a>
            </SpotlightCard>
          </AnimatedContent>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
 * CAREER
 * ================================================================ */
function Career({ accent }: { accent: string }) {
  return (
    <div className="n3-room">
      <Head
        kicker="2019 — 2026"
        title="Career"
        note="Graphics designer to Gen AI Production Lead, in order."
        accent={accent}
      />
      <ol className="n3-roles">
        {experience.map((j, i) => (
          <AnimatedContent key={j.title + j.period} {...rise(0.08 + i * 0.05)}>
            <li>
              <span className="n3-role-when" style={{ color: accent }}>{j.period}</span>
              <span className="n3-role-what">
                <strong>{j.title}</strong>
                <span className="n3-role-co">{j.company} · {j.place}</span>
              </span>
            </li>
          </AnimatedContent>
        ))}
      </ol>
    </div>
  );
}

/* ================================================================
 * TOOLKIT
 * ================================================================ */
function Toolkit({ accent }: { accent: string }) {
  const logos = tools.map((t) => ({
    node: <span className="n3-tool">{t}</span>,
    title: t,
  }));
  return (
    <div className="n3-room">
      <Head kicker="How the work gets made" title="Toolkit" note={about.body} accent={accent} />
      <AnimatedContent {...rise(0.14)}>
        <ul className="n3-skills">
          {coreSkills.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </AnimatedContent>
      <AnimatedContent {...rise(0.24)}>
        <div className="n3-loop">
          <span className="n3-loop-label">Tools</span>
          <LogoLoop
            logos={logos}
            speed={40}
            direction="left"
            logoHeight={34}
            gap={12}
            pauseOnHover
            hoverSpeed={8}
            fadeOut={false}
            ariaLabel="Tools and platforms"
          />
        </div>
      </AnimatedContent>
    </div>
  );
}

/* ================================================================
 * CONTACT
 * ================================================================ */
function Contact({ accent }: { accent: string }) {
  return (
    <div className="n3-room n3-contact">
      <AnimatedContent {...rise(0.05)}>
        <p className="n3-eyebrow">Kolkata, WB · Remote</p>
      </AnimatedContent>
      <AnimatedContent {...rise(0.12)}>
        <h2 className="n3-big">Let's make something<br />worth watching.</h2>
      </AnimatedContent>
      <AnimatedContent {...rise(0.22)}>
        <div className="n3-cta">
          <Magnet padding={80} magnetStrength={5}>
            <a className="n3-btn n3-btn-solid" href="mailto:souravdey2105@gmail.com">
              souravdey2105@gmail.com
              <span><Mail size={14} /></span>
            </a>
          </Magnet>
          <a className="n3-btn" href="https://linkedin.com/in/souravdey2105" target="_blank" rel="noreferrer">
            LinkedIn <ArrowUpRight size={13} />
          </a>
          <a className="n3-btn" href={profile.resumeUrl} download>
            <Download size={13} /> Resume
          </a>
        </div>
      </AnimatedContent>
      <AnimatedContent {...rise(0.32)}>
        <p className="n3-foot" style={{ borderColor: accent }}>{profile.note}</p>
      </AnimatedContent>
    </div>
  );
}

/* ---- the shared room header ---- */
function Head({ kicker, title, note, accent }: {
  kicker: string; title: string; note: string; accent: string;
}) {
  return (
    <header className="n3-head">
      <AnimatedContent {...rise(0.02)}>
        <p className="n3-eyebrow" style={{ color: accent }}>{kicker}</p>
      </AnimatedContent>
      <AnimatedContent {...rise(0.08)}>
        <h2 className="n3-title">{title}</h2>
      </AnimatedContent>
      <AnimatedContent {...rise(0.14)}>
        <p className="n3-note">{note}</p>
      </AnimatedContent>
    </header>
  );
}

export function Room({ id, onGo, accent }: {
  id: SectionId; onGo: (id: SectionId) => void; accent: string;
}) {
  switch (id) {
    case 'work': return <Work accent={accent} />;
    case 'systems': return <Systems accent={accent} />;
    case 'career': return <Career accent={accent} />;
    case 'toolkit': return <Toolkit accent={accent} />;
    case 'contact': return <Contact accent={accent} />;
    default: return <Home onGo={onGo} accent={accent} />;
  }
}
