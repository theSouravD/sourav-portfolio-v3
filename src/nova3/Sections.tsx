import { useRef, useState } from 'react';
import {
  ArrowDown, ArrowUpRight, ChevronDown, Download, ExternalLink, FileText, Mail, Play,
  Volume2, VolumeX,
} from 'lucide-react';
import SpotlightCard from '@/reactbits/SpotlightCard';
import ShinyText from '@/reactbits/ShinyText';
import Magnet from '@/reactbits/Magnet';
import PressureName from '@/film/PressureName';
import Counter from '@/film/shots/Counter';
import Poster from '@/components/Poster';
import Lightbox from '@/components/Lightbox';
import ToolOrbit from './ToolOrbit';
import WorkflowPoster from './WorkflowPoster';
import { playTitle, readSound, saveSound } from './titleSound';
import { Reveal } from './parts';
import { glow, label, step } from './util';
import { profile, stats, about, coreSkills, experience, automationContribution } from '@/data/content';
import { automationProjects, portfolioWork } from '@/data/work';
import type { MediaItem } from '@/data/work';
import { setupOf, type SectionId } from './scenes';

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

  /*
   * Which input pressed the name, so a tap and a click can mean different
   * things.
   *
   * They have to. Replaying the sequence REMOUNTS the component, and a
   * remount resets every character's spring and starts the entrance over —
   * so on a touchscreen, where the same tap is both the press and the only
   * way to reach a glyph, the bounce was being wiped by the thing it
   * triggered. A finger gets the bounce; the sound button sitting right
   * beside it is still there to replay, and is the more honest place for a
   * replay anyway, because it is the control that makes the sound.
   */
  const pressedWith = useRef('');

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
            onPointerDown={(e) => { pressedWith.current = e.pointerType; }}
            onClick={() => {
              /* Cleared as it is read, so a keyboard activation after a tap
                 -- which fires no pointerdown at all -- still replays. */
              const via = pressedWith.current;
              pressedWith.current = '';
              if (via === 'touch') return;
              replay();
            }}
            title="Replay"
            aria-label={`${profile.name} — replay the title`}
          >
            {/*
              A 260px radius covered the whole name, so the cursor thickened
              all ten glyphs at once and the effect read as the headline
              breathing. 72 is a little over two character widths at this
              size: the letter under the pointer takes the whole lift, the
              two beside it come along for about a tenth of it, and the rest
              hold still — which is what makes it read as THAT character
              answering you rather than as a wave passing through.
            */}
            <PressureName
              key={run}
              text={profile.name}
              bounce
              radius={72}
              baseOpacity={1}
              baseWeight={700}
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
          {/* The label is a span so the phone rules can drop it and leave the
              icon. Two full pills do not fit one row at 320px, and the pair
              wrapping to two ragged rows was worse than one of them being
              a symbol everybody already reads. */}
          <button
            type="button"
            className="n3-btn"
            onClick={() => onGo('contact')}
            title="Get in touch"
            aria-label="Get in touch"
          >
            <Mail size={14} /> <span className="n3-btn-label">Get in touch</span>
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
              <WorkflowPoster project={featured} />
            </span>
            <span className="n3-featured-foot">
              <span className="n3-featured-kick n3-accent">
                <FileText size={10} /> Latest workflow · {label(featured)}
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
        title="Gallery"
        note={`${pieces.length} pieces of campaign and trailer work, AI ad creatives, motion and video.`}
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
        wide
        />

      {/*
        WHAT HE ACTUALLY DID, ON THE INDEX RATHER THAN BURIED.
        This copy already existed in the data and nothing rendered it. It is
        the most credible line on the page precisely because it draws the
        boundary — POCs, research and evaluation his, production build the
        tech team's — and a claim that names its own limits is worth more
        than five cards that do not.
      */}
      <Reveal delay={0.16}>
        <aside className="n3-credit">
          <p className="n3-credit-head n3-accent">{automationContribution.heading}</p>
          <p>{automationContribution.body}</p>
        </aside>
      </Reveal>

      <div className="n3-cases">
        {automationProjects.map((p, i) => (
          <Reveal key={p.slug} delay={step(0.08, i, 0.06)}>
            <SpotlightCard className="n3-case" spotlightColor={glow(setupOf('systems').accent, 0.16)}>
              <button type="button" onClick={() => onGo('systems', p.slug)}>
                <span className="n3-case-thumb"><WorkflowPoster project={p} /></span>
                <span className="n3-case-body">
                  <span className="n3-case-tool n3-accent">
                    <FileText size={10} /> {label(p)}
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
export function Rich({ text }: { text: string }) {
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
/**
 * ABOUT — formerly "Toolkit".
 *
 * The belt of tool chips is gone. It listed exactly the same sixteen tools as
 * the orbit beside it, so the room said everything twice — and the strip's own
 * edge fade left a hard square where it met the panel corner. One list, and
 * the orbit is the better one: it is readable, it is clickable, and it names
 * whatever you select in the middle.
 */
function Toolkit() {
  return (
    <div className="n3-room n3-toolkit">
      <div className="n3-toolkit-col">
        <Head kicker="How the work gets made" title="About" note={about.body} />
        <Reveal delay={0.14}>
          <ul className="n3-skills">
            {coreSkills.map((sk) => <li key={sk}>{sk}</li>)}
          </ul>
        </Reveal>
      </div>

      <Reveal delay={0.24} className="n3-toolkit-orbit">
        <ToolOrbit />
      </Reveal>
    </div>
  );
}

/* ================================================================
 * CONTACT
 * ================================================================ */
/*
 * The LinkedIn mark, drawn here rather than imported.
 *
 * Lucide dropped brand logos from the core set, and this button collapses to
 * its icon on a phone — where a generic arrow says "a link" and nothing about
 * which one. Solid rather than stroked, deliberately: at 13px an outlined
 * "in" inside an outlined square is mud, and a logo that is not instantly
 * legible is not doing the job a logo is for.
 */
function LinkedInMark({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

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
          {/* Linkedin's own mark rather than a generic arrow, because on a
              phone this collapses to the icon alone and an arrow on its own
              says "a link", not "this link". */}
          <a
            className="n3-btn"
            href="https://linkedin.com/in/souravdey2105"
            target="_blank"
            rel="noreferrer"
            title="LinkedIn"
            aria-label="LinkedIn"
          >
            <LinkedInMark /> <span className="n3-btn-label">LinkedIn</span>
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
          <a className="n3-btn n3-btn-icon" href={profile.resumeUrl} download title="Download resume" aria-label="Download resume">
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
/**
 * `wide` lifts the note's reading measure for a room whose intro is a single
 * short sentence that should not break. It is opt-in rather than the default
 * because the other rooms carry real paragraphs — About's is several lines —
 * and a 56ch measure is there to keep those readable.
 */
function Head({
  kicker, title, note, wide = false,
}: { kicker: string; title: string; note: string; wide?: boolean }) {
  return (
    <header className="n3-head">
      <Reveal delay={0.02}>
        <p className="n3-eyebrow n3-accent">{kicker}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="n3-title">{title}</h2>
      </Reveal>
      <Reveal delay={0.14}>
        <p className={`n3-note ${wide ? 'is-wide' : ''}`}>{note}</p>
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
