import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Reveal } from './parts';
import { Rich } from './Sections';
import {
  profile, contact, coreSkills, resumeAside, experience, education, type Job,
} from '@/data/content';

/**
 * THE RESUME, AS A PAGE.
 *
 * The Resume button used to hand over a PDF: a download, opened in another
 * application, laid out to another grid, set in other type and coloured to a
 * palette this site does not use. Every step of that drops the impression the
 * site just spent a minute making.
 *
 * So the resume is a room, built from the same `content.ts` as everything else
 * and painted with the same tokens — and the downloadable PDF is printed FROM
 * this page. One source: a bullet edited once lands in both, and they cannot
 * drift apart.
 *
 * THE STRUCTURE IS THE ONE THAT WAS ALREADY WORKING
 * The first version of this page was a plain two-column document, and it was
 * a clear step down from the PDF it replaced. That PDF was properly designed —
 * a full-bleed masthead, a tinted sidebar running the height of the page,
 * numbered company blocks, a date pill per employer — and matching the site's
 * COLOURS while throwing away its LAYOUT is not a trade worth making.
 *
 * So this rebuilds that structure in the site's own materials: the masthead
 * band is `--ink`, the same solid the primary buttons use; the sidebar is a
 * wash of it; the numbers and the section rules take the room's accent. Same
 * document, same palette as the page it lives on.
 */

/** One employer, with every consecutive role held there. */
interface Firm {
  company: string;
  place: string;
  roles: Job[];
}

/**
 * Consecutive roles at the same employer are one block.
 *
 * Listing six roles flat makes three separate Pocket FM headings and reads as
 * three jobs at three companies. Grouping them says the true thing — one
 * employer, promoted through it — which is the single most valuable fact a
 * career section can carry, and it costs a reduce.
 *
 * Only CONSECUTIVE runs merge: he returned to Pocket FM after Ginger Monkey,
 * and collapsing those into one block would invent continuity that isn't
 * there.
 */
function groupByFirm(jobs: Job[]): Firm[] {
  return jobs.reduce<Firm[]>((acc, job) => {
    const last = acc[acc.length - 1];
    if (last && last.company === job.company) last.roles.push(job);
    else acc.push({ company: job.company, place: job.place, roles: [job] });
    return acc;
  }, []);
}

/**
 * The span across a block: the earliest role's start to the latest role's end.
 *
 * Periods are written "Feb 2026 - Present", so the halves come off the dash.
 * The list runs newest first, so the block's END is the FIRST role's end and
 * its START is the LAST role's start — the reversal is the whole subtlety
 * here, and getting it backwards produces a plausible-looking date range that
 * is wrong in both directions.
 */
function span(roles: Job[]): string {
  const parts = (p: string) => p.split(/\s*[-–—]\s*/);
  const end = parts(roles[0].period)[1] ?? roles[0].period;
  const startRole = roles[roles.length - 1].period;
  const start = parts(startRole)[0] ?? startRole;
  return `${start} — ${end}`;
}

/** "Bengaluru, Karnataka | Remote" → the city, and the arrangement, apart. */
function splitPlace(place: string) {
  const [where, ...rest] = place.split('|').map((s) => s.trim());
  return { where, mode: rest.join(' · ') };
}

function Aside({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="n3-cv-block">
      <h3 className="n3-cv-h">{title}</h3>
      <ul className="n3-cv-list">
        {items.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </section>
  );
}

export default function ResumeRoom({ onBack }: { onBack: () => void }) {
  const firms = groupByFirm(experience);

  return (
    <div className="n3-room n3-resume-room">
      <Reveal delay={0.02}>
        <button type="button" className="n3-back n3-noprint" onClick={onBack}>
          <ArrowLeft size={13} /> Back
        </button>
      </Reveal>

      <Reveal delay={0.06}>
        {/* The one place on the site that draws a page edge, on purpose: a
            resume is a document, and letting it read as a sheet lying on the
            ground says what it is before a word is read. */}
        <article className="n3-sheet">
          <header className="n3-cv-band">
            <div>
              <h2 className="n3-cv-name">{profile.name}</h2>
              <p className="n3-cv-role">{profile.role}</p>
              <p className="n3-cv-summary">{profile.intro}</p>
            </div>
            {/* Straight from the list the Connect room uses, so a phone number
                or a handle is written down in exactly one place. A resume with
                a stale email is worse than no resume. */}
            <ul className="n3-cv-contact">
              {contact.items.map((c) => (
                <li key={c.label}>
                  {c.href ? <a href={c.href}>{c.value}</a> : <span>{c.value}</span>}
                </li>
              ))}
            </ul>
          </header>

          <div className="n3-cv-body">
            {/*
              The sidebar comes FIRST in the DOM as well as on the left, so it
              reads in that order to a screen reader and, on a phone, stacks
              above the experience rather than below all of it.

              It is also deliberately long. A sidebar that ends halfway down
              page one leaves the second page of the printed CV with an empty
              column beside the text — the exact fault the old PDF avoided by
              carrying different sections onto page two.
            */}
            <aside className="n3-cv-side">
              <Aside title="Core skills" items={coreSkills} />
              <Aside title="AI tools" items={resumeAside.aiTools} />
              <Aside title="Traditional software" items={resumeAside.traditional} />

              <section className="n3-cv-block">
                <h3 className="n3-cv-h">Education</h3>
                {education.map((e) => (
                  <div className="n3-cv-edu" key={e.school}>
                    <p className="n3-cv-edu-school">{e.school}</p>
                    <p>{e.course}</p>
                    <p className="n3-cv-when">{e.period}</p>
                  </div>
                ))}
              </section>

              <Aside title="Focus" items={resumeAside.focus} />
            </aside>

            <main className="n3-cv-main">
              <h3 className="n3-cv-h">Experience</h3>

              {firms.map((f, i) => {
                const { where, mode } = splitPlace(f.place);
                return (
                  <section className="n3-firm" key={`${f.company}-${i}`}>
                    <span className="n3-firm-no">{String(i + 1).padStart(2, '0')}</span>
                    <div className="n3-firm-body">
                      <div className="n3-firm-head">
                        <h4 className="n3-firm-name">
                          {f.company}
                          <span className="n3-firm-place">
                            {where}{mode ? ` · ${mode}` : ''}
                          </span>
                        </h4>
                        <span className="n3-firm-span">{span(f.roles)}</span>
                      </div>

                      {f.roles.map((r) => (
                        <div className="n3-role" key={r.title + r.period}>
                          <p className="n3-role-name">{r.title}</p>
                          {/* Just the dates. "Remote" belongs once, on the
                              employer, not restated under every role held
                              there. */}
                          <p className="n3-cv-when">{r.period}</p>
                          <ul className="n3-cv-bullets">
                            {r.bullets.map((b) => (
                              <li key={b}><Rich text={b} /></li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </main>
          </div>
        </article>
      </Reveal>

      {/* Hidden from print — a sheet of paper with a "Print" button on it is
          the oldest tell that a page was never meant to be printed. */}
      <Reveal delay={0.14}>
        <div className="n3-sheet-actions n3-noprint">
          <button type="button" className="n3-btn" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </button>
          <a className="n3-btn" href={profile.resumeUrl} download>
            <Download size={14} /> Download PDF
          </a>
        </div>
      </Reveal>
    </div>
  );
}
