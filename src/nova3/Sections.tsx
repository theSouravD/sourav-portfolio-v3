import { useState } from 'react';
import {
  ArrowDown, ArrowUpRight, ChevronDown, Download, ExternalLink, FileText, Mail, Play,
  Volume2, VolumeX,
} from 'lucide-react';
import SpotlightCard from '@/reactbits/SpotlightCard';
import ShinyText from '@/reactbits/ShinyText';
import Magnet from '@/reactbits/Magnet';
import LogoLoop from '@/reactbits/LogoLoop';
import PressureName from '@/film/PressureName';
import Counter from '@/film/shots/Counter';
import Poster from '@/components/Poster';
import Lightbox from '@/components/Lightbox';
import ToolOrbit from './ToolOrbit';
import { playTitle, readSound, saveSound } from './titleSound';
import { profile, stats, about, coreSkills, tools, experience } from '@/data/content';
import { automationProjects, portfolioWork } from '@/data/work';
import type { MediaItem } from '@/data/work';
import { setupOf, type SectionId } from './scenes';

/**
 * The room's gel, as an rgba you can put in a spotlight.
 *
 * A white spotlight on a dark card is a light being switched on. The same
 * white on paper is nothing at all — you cannot get brighter than the page.
 * So on light the hover glow is the room's own colour instead, which reads as
 * a gel sliding across rather than as a lamp.
 */
type Rgba = `rgba(${number}, ${number}, ${number}, ${number})`;
const glow = (hex: string, a: number): Rgba => {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/**
 * The six rooms.
 *
 * Each one is a single screen of content with a directed entrance: nothing
 * relies on scrolling to be discovered, and nothing animates in from
 * invisible. A section that starts at opacity zero waiting for an observer is
 * a section a visitor can arrive at and see nothing in — the entrances here
 * are on a timer from mount, so the room is always lit by the time you look.
 */

/**
 * THE ENTRANCE — and why it is no longer a scroll trigger.
 *
 * Three separate "the content is missing" bugs in this build all had the same
 * cause: AnimatedContent reveals on a ScrollTrigger, and a trigger measures
 * where an element sits ONCE, when it is created. That is a promise the layout
 * cannot keep. Point it at the wrong scroller and everything below the fold
 * stays at opacity 0 for good. Point it at the right one and it still breaks
 * the moment the page changes height underneath it — close the open role in
 * Career and five rows slide up into space the trigger already decided was
 * off-screen, so they simply never appear. A visitor closes an accordion,
 * concludes there is nothing else, and leaves.
 *
 * No reveal on this site is worth that. An entrance is decoration; being
 * visible is the product. So the reveal is now a CSS animation on a delay from
 * mount — it cannot be told a wrong position because it never asks for one,
 * it costs no observer and no library, and `both` fill holds the start frame
 * through the delay so nothing flashes before its turn.
 *
 * The stagger caps deliberately: with twenty-nine tiles a linear ramp would
 * leave the last one waiting a second and a half, which stops reading as
 * choreography and starts reading as lag.
 */
export function Reveal({
  delay = 0,
  className = '',
  as: Tag = 'div',
  children,
}: {
  delay?: number;
  className?: string;
  /**
   * The element to render as. A wrapper is not free: a <div> between an <ol>
   * and its <li> is invalid markup, and it silently breaks every `>` selector
   * written against the list. Lists pass `as="li"` so the reveal IS the row.
   */
  as?: 'div' | 'li';
  children: React.ReactNode;
}) {
  return (
    <Tag className={`n3-rise ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </Tag>
  );
}

/** Staggered delay for the nth item in a list, capped so long lists stay brisk. */
const step = (base: number, i: number, gap = 0.035, cap = 0.42) =>
  base + Math.min(i * gap, cap);

/* ================================================================
 * HOME
 * ================================================================ */
/**
 * HOME
 *
 * The first draft ran as one left-hand column and left the right half of a
 * wide screen empty, which does not read as restraint — it reads as a page
 * that has not finished loading. So the opening screen is a two-column setup:
 * the billing on the left, and on the right the two things a visitor is
 * actually trying to establish in the first five seconds — what he is doing
 * now, and whether the work is any good. The still is the top piece and it
 * opens where the Work grid opens it, so the right column is a door rather
 * than a decoration.
 */
function Home({ onGo }: { onGo: (id: SectionId, slug?: string | null) => void }) {
  const accent = setupOf('home').accent;
  const now = experience[0];
  /*
     The featured slot used to hold a video. A clip shows that he can cut;
     the systems are what the job title is actually about, and they are the
     harder thing to prove — so the newest workflow goes here instead, and
     the card opens its written case rather than a player.
  */
  const featured = automationProjects[0];

  const [sound, setSound] = useState(readSound);
  const glyphs = profile.name.replace(/\s/g, '').length;

  const replay = () => {
    /* A click IS the gesture the browser is waiting for, so this is also how
       sound gets unlocked the first time. Replaying the sequence means
       remounting it — the animation is CSS and CSS animations do not restart
       on request, only on a new element. */
    setRun((n) => n + 1);
    if (sound) playTitle(glyphs, 52, 260);
  };
  const [run, setRun] = useState(0);

  return (
    <div className="n3-room n3-home">
      <div className="n3-home-bill">
      <Reveal delay={0.05}>
        <p className="n3-eyebrow">{profile.tagline}</p>
      </Reveal>

      <Reveal delay={0.12}>
        <h1 className="n3-name">
          <button
            type="button"
            className="n3-name-seq"
            onClick={replay}
            title="Replay"
            aria-label={`${profile.name} — replay the title`}
          >
            <PressureName
              key={run}
              text={profile.name}
              radius={260}
              baseOpacity={1}
              baseWeight={500}
              intro={52}
              introDelay={260}
            />
            {/* The bar that resolves them. See .n3-name-seq > i. */}
            <i />
          </button>
          <button
            type="button"
            className={`n3-sound ${sound ? 'is-on' : ''}`}
            aria-pressed={sound}
            aria-label={sound ? 'Sound on' : 'Sound off'}
            title={sound ? 'Sound on' : 'Sound off'}
            onClick={() => {
              const next = !sound;
              setSound(next);
              saveSound(next);
              /* Play immediately on switching on: the click is the gesture
                 that unlocks audio, and hearing it confirms the switch did
                 something. */
              if (next) { setRun((n) => n + 1); playTitle(glyphs, 52, 260); }
            }}
          >
            {sound ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
        </h1>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="n3-role">
          {/*
            On black, a shine is white travelling through grey. On paper both
            of those are the wrong way round: the base has to be dark enough
            to read, and the "shine" is the room's accent passing through it —
            a highlight is whatever differs from the ground, not whatever is
            brightest.
          */}
          <ShinyText
            text={profile.role}
            speed={5}
            color="rgba(23,20,15,0.58)"
            shineColor={accent}
            spread={160}
          />
        </div>
      </Reveal>

      {/*
        The three figures a recruiter looks for, counted up rather than stated.
        A number that arrives reads as a measurement; a number that fades in
        reads as decoration.
      */}
      <Reveal delay={0.3}>
        <dl className="n3-stats">
          {stats.map((s, i) => (
            <div key={s.label}>
              <dt className="n3-accent">
                <Counter to={s.value} start delay={520 + i * 150} />
                <span>{s.suffix}</span>
              </dt>
              <dd>{s.label}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal delay={0.4}>
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
      </Reveal>
      </div>

      {/* ---- the right column ---- */}
      <div className="n3-home-side">
        <Reveal delay={0.34}>
          <button
            type="button"
            className="n3-featured"
            onClick={() => onGo('systems', featured.slug)}
            aria-label={`Read the case study: ${featured.title}`}
          >
            <span className="n3-featured-frame">
              <Poster src={featured.thumbnail} caption={featured.tool} />
            </span>
            <span className="n3-featured-foot">
              <span className="n3-featured-kick n3-accent">
                <FileText size={10} /> Latest workflow · {featured.tool}
              </span>
              <span className="n3-featured-title">{featured.title}</span>
              <span className="n3-featured-meta">Read the case <ArrowUpRight size={11} /></span>
            </span>
          </button>
        </Reveal>

        {/*
          "Available" is the one fact a visitor most often came for and the one
          most portfolios bury on a contact page. It costs a line.
        */}
        <Reveal delay={0.44}>
          <dl className="n3-now">
            <div>
              <dt>Now</dt>
              <dd>{now.title}<br /><span>{now.company}</span></dd>
            </div>
            <div>
              <dt>Based</dt>
              <dd>Kolkata, WB<br /><span>Remote worldwide</span></dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd className="n3-now-live"><i />Open to work<br /><span>Available for full-time roles</span></dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </div>
  );
}

/* ================================================================
 * WORK
 * ================================================================ */
const PAGE = 12;

function Work() {
  const [active, setActive] = useState<MediaItem | null>(null);
  const [shown, setShown] = useState(PAGE);
  const pieces = [
    ...(portfolioWork.direction as MediaItem[]),
    ...(portfolioWork.ai as MediaItem[]),
  ];
  const visible = pieces.slice(0, shown);
  const left = pieces.length - shown;

  return (
    <div className="n3-room">
      <Head
        kicker="Selected work"
        title="Work"
        note={`${pieces.length} pieces — campaign and trailer work, AI ad creatives, motion and video.`}
        />

      {/*
        A plain grid, clicked. No horizontal travel anywhere on this site —
        that axis switch is the single thing that made Nova I confusing, and
        a grid of thumbnails is what everyone already knows how to read.
      */}
      <div className="n3-grid">
        {visible.map((m, i) => (
          <Reveal key={m.id} delay={step(0.06, i)}>
            <SpotlightCard
              className="n3-tile"
              spotlightColor={glow(setupOf('work').accent, 0.14)}
            >
              <button type="button" onClick={() => setActive(m)} aria-label={`Play ${m.title}`}>
                <span className="n3-thumb">
                  <Poster item={m} />
                  <span className="n3-idx">{String(i + 1).padStart(2, '0')}</span>
                  <span className="n3-play"><Play size={14} /></span>
                </span>
                <span className="n3-tile-foot">
                  <span className="n3-tile-title">{m.title}</span>
                  <span className="n3-tile-meta">{m.meta}</span>
                  <i className="n3-tile-rule" />
                </span>
              </button>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>

      {/*
        Seventeen of the twenty-nine pieces were unreachable — the grid was
        capped at twelve and nothing said so, which for a portfolio means most
        of the work simply did not exist to a visitor.
        A button rather than infinite scroll: it states the number that is
        left, so a visitor knows the size of what they have not seen, and it
        never fires on its own while somebody is reading. The count only ever
        goes up, so nothing they have already looked at moves.
      */}
      {left > 0 && (
        <div className="n3-more">
          <button type="button" className="n3-btn" onClick={() => setShown((n) => n + PAGE)}>
            Show {Math.min(left, PAGE)} more
            <em>{shown} of {pieces.length}</em>
          </button>
        </div>
      )}

      <Lightbox item={active} onClose={() => setActive(null)} />
    </div>
  );
}

/* ================================================================
 * SYSTEMS
 * ================================================================ */
function Systems({ onGo }: { onGo: (id: SectionId, slug?: string | null) => void }) {
  return (
    <div className="n3-room">
      <Head
        kicker="Automation workflows"
        title="Systems"
        note="Systems, not clips. Each one is a production pipeline a team runs without me."
        />
      <div className="n3-cases">
        {automationProjects.map((p, i) => (
          <Reveal key={p.slug} delay={step(0.08, i, 0.06)}>
            <SpotlightCard className="n3-case" spotlightColor={glow(setupOf('systems').accent, 0.16)}>
              <button type="button" onClick={() => onGo('systems', p.slug)}>
                <span className="n3-case-thumb"><Poster src={p.thumbnail} caption={p.tool} /></span>
                <span className="n3-case-body">
                  <span className="n3-case-tool n3-accent">
                    <FileText size={10} /> {p.tool}
                  </span>
                  <strong>{p.title}</strong>
                  <span className="n3-case-sum">{p.summary}</span>
                  <span className="n3-case-more">Read the case <ArrowUpRight size={12} /></span>
                </span>
              </button>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
 * CAREER
 * ================================================================ */
/**
 * Emphasis inside a bullet.
 *
 * The copy carries `**bold**` because it was written as markdown, and a role
 * bullet's whole point is the one measurable phrase inside it — "2x or more",
 * "AI Dubbing Studio POC". Rendered raw, the asterisks are noise; stripped,
 * the sentence flattens. So the marks are read and set as emphasis.
 */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 ? <b key={i}>{part}</b> : <span key={i}>{part}</span>
      )}
    </>
  );
}

/**
 * CAREER
 *
 * The first pass showed six titles and dates and dropped every bullet, which
 * turned a record into a list of job labels — the achievements are the part
 * anyone is actually reading for. They are back, but folded: six roles times
 * nine bullets is a wall that nobody finishes, so each role opens on click and
 * the current one starts open. The count sits on the row so there is never any
 * doubt that something is in there.
 */
function Career() {
  const [open, setOpen] = useState(0);
  return (
    <div className="n3-room">
      <Head
        kicker="2019 — 2026"
        title="Career"
        note="Graphics designer to Gen AI Production Lead, in order. Open a role to read what the job actually involved."
        />
      <ol className="n3-roles">
        {experience.map((j, i) => (
          <Reveal
            key={j.title + j.period}
            as="li"
            delay={step(0.08, i, 0.05)}
            className={open === i ? 'n3-role-item is-open' : 'n3-role-item'}
          >
              <button
                type="button"
                className="n3-role-row"
                aria-expanded={open === i}
                onClick={() => setOpen((c) => (c === i ? -1 : i))}
              >
                <span className="n3-role-when n3-accent">{j.period}</span>
                <span className="n3-role-what">
                  <strong>{j.title}</strong>
                  <span className="n3-role-co">{j.company} · {j.place}</span>
                </span>
                <span className="n3-role-toggle">
                  <em>{j.bullets.length}</em>
                  <ChevronDown size={14} />
                </span>
              </button>
              {open === i && (
                <ul className="n3-role-bullets">
                  {j.bullets.map((b) => (
                    <li key={b}><Rich text={b} /></li>
                  ))}
                </ul>
              )}
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

/* ================================================================
 * TOOLKIT
 * ================================================================ */
function Toolkit() {
  const logos = tools.map((t) => ({
    node: <span className="n3-tool">{t}</span>,
    title: t,
  }));
  return (
    <div className="n3-room n3-toolkit">
      <div className="n3-toolkit-col">
        <Head kicker="How the work gets made" title="Toolkit" note={about.body} />
        <Reveal delay={0.14}>
          <ul className="n3-skills">
            {coreSkills.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </Reveal>
        {/*
          The belt needs its fade on. Without it the strip is guillotined at
          both ends and the first and last chips read as broken words — and the
          fade has to take the CARD's colour rather than the page's, because it
          sits inside the panel and paper over near-white is a visible seam.

          It stays even though the orbit shows the same tools: the belt is
          readable and hoverable, the orbit is atmosphere. Below 1100px the
          orbit goes and the belt is the whole answer.
        */}
        <Reveal delay={0.24}>
          <div className="n3-loop" data-noswipe>
            <span className="n3-loop-label">Tools</span>
            <LogoLoop
              logos={logos}
              speed={40}
              direction="left"
              logoHeight={34}
              gap={12}
              pauseOnHover
              hoverSpeed={8}
              fadeOut
              fadeOutColor="#FCFAF6"
              ariaLabel="Tools and platforms"
            />
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.3} className="n3-toolkit-orbit">
        <ToolOrbit />
      </Reveal>
    </div>
  );
}

/* ================================================================
 * CONTACT
 * ================================================================ */
function Contact() {
  return (
    <div className="n3-room n3-contact">
      <Reveal delay={0.05}>
        <p className="n3-eyebrow">Kolkata, WB · Remote</p>
      </Reveal>
      <Reveal delay={0.12}>
        <h2 className="n3-big">Let's make something<br />worth watching.</h2>
      </Reveal>
      <Reveal delay={0.22}>
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
          {/*
            A tab, not a panel. An iframe hands the PDF a few hundred pixels
            in the middle of the page and the browser's viewer spends most of
            that on its own toolbar — which is a worse read than the file
            deserves. A new tab gives it the whole window, with the viewer's
            real zoom, search and print, and leaves the site where it was.
          */}
          <a className="n3-btn" href={profile.resumeUrl} target="_blank" rel="noreferrer">
            <FileText size={13} /> View resume <ExternalLink size={11} />
          </a>
          <a className="n3-btn n3-btn-quiet" href={profile.resumeUrl} download aria-label="Download resume">
            <Download size={13} />
          </a>
        </div>
      </Reveal>
      <Reveal delay={0.32}>
        <p className="n3-foot">{profile.note}</p>
      </Reveal>
    </div>
  );
}

/* ---- the shared room header ---- */
function Head({ kicker, title, note }: { kicker: string; title: string; note: string }) {
  return (
    <header className="n3-head">
      <Reveal delay={0.02}>
        <p className="n3-eyebrow n3-accent">{kicker}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="n3-title">{title}</h2>
      </Reveal>
      <Reveal delay={0.14}>
        <p className="n3-note">{note}</p>
      </Reveal>
    </header>
  );
}

export function Room({ id, onGo }: {
  id: SectionId;
  onGo: (id: SectionId, slug?: string | null) => void;
}) {
  switch (id) {
    case 'work': return <Work />;
    case 'systems': return <Systems onGo={onGo} />;
    case 'career': return <Career />;
    case 'toolkit': return <Toolkit />;
    case 'contact': return <Contact />;
    default: return <Home onGo={onGo} />;
  }
}
