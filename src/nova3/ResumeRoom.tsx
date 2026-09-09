import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Reveal } from './parts';
import { Rich } from './Sections';
import {
  profile, contact, coreSkills, tools, experience, education,
} from '@/data/content';

/**
 * THE RESUME, AS A PAGE.
 *
 * The Resume button used to hand over a PDF: a download, opened in whatever
 * viewer the visitor happened to have, laid out to a different grid, set in
 * different type and coloured to a palette the site does not use. Every step
 * of that is a place where the impression the site just made gets dropped.
 *
 * So the resume is a room now, built from the same `content.ts` the rest of
 * the site is built from and painted with the same tokens. It inherits the
 * room's accent, the paper, the grain and the type ramp automatically — there
 * is no second theme to keep in sync, because there is no second theme.
 *
 * ONE SOURCE, NOT TWO
 * The old PDF and the site were separate artefacts describing the same career,
 * which is a guarantee that they will disagree: a bullet edited here would not
 * reach the file a recruiter actually opens. Now the page is generated from
 * the data, and the downloadable PDF is printed FROM this page — so a change
 * to a bullet lands in both, and neither can drift.
 *
 * WHY THE PDF STAYS AVAILABLE
 * Reading it here is better for anyone browsing. It is useless to someone who
 * has to attach a file to an ATS or forward it to a hiring manager, and that
 * is most of what a resume is for. Viewing is the default; the file is one
 * click away rather than the only option.
 */
export default function ResumeRoom({ onBack }: { onBack: () => void }) {
  return (
    <div className="n3-room n3-resume-room">
      <Reveal delay={0.02}>
        <button type="button" className="n3-back n3-noprint" onClick={onBack}>
          <ArrowLeft size={13} /> Back
        </button>
      </Reveal>

      <Reveal delay={0.06}>
        {/*
          `n3-sheet` is the only place on the site that draws a page edge, and
          it does it on purpose: a resume is a document, and letting it read as
          one — a sheet lying on the ground rather than more of the ground —
          is what tells the visitor at a glance what they are looking at.
        */}
        <article className="n3-sheet">
          <header className="n3-sheet-head">
            <div>
              <h2 className="n3-sheet-name">{profile.name}</h2>
              <p className="n3-sheet-role">{profile.role}</p>
            </div>
            {/*
              Contact comes from the same list the Connect room uses, so there
              is exactly one place a phone number or a handle is written down.
              A resume with a stale email is worse than no resume.
            */}
            <ul className="n3-sheet-contact">
              {contact.items.map((c) => (
                <li key={c.label}>
                  {c.href
                    ? <a href={c.href}>{c.value}</a>
                    : <span>{c.value}</span>}
                </li>
              ))}
            </ul>
          </header>

          <p className="n3-sheet-summary">{profile.intro}</p>

          <div className="n3-sheet-body">
            <main className="n3-sheet-main">
              <h3 className="n3-sheet-h">Experience</h3>
              {/*
                Every role, every bullet, open. The Career room collapses these
                behind an accordion because it is a page you browse; a resume
                is a page you read straight through, and one that hides most of
                itself is not a resume.
              */}
              {experience.map((j) => (
                <section className="n3-sheet-job" key={`${j.company}-${j.period}`}>
                  <div className="n3-sheet-job-head">
                    <h4>{j.title}</h4>
                    <span className="n3-sheet-when">{j.period}</span>
                  </div>
                  <p className="n3-sheet-where">{j.company} · {j.place}</p>
                  <ul className="n3-sheet-bullets">
                    {j.bullets.map((b) => (
                      <li key={b}><Rich text={b} /></li>
                    ))}
                  </ul>
                </section>
              ))}
            </main>

            <aside className="n3-sheet-side">
              <section>
                <h3 className="n3-sheet-h">Core skills</h3>
                <ul className="n3-sheet-list">
                  {coreSkills.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </section>

              <section>
                <h3 className="n3-sheet-h">Tools</h3>
                <ul className="n3-sheet-list">
                  {tools.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </section>

              <section>
                <h3 className="n3-sheet-h">Education</h3>
                {education.map((e) => (
                  <div className="n3-sheet-edu" key={e.school}>
                    <p className="n3-sheet-edu-school">{e.school}</p>
                    <p>{e.course}</p>
                    <p className="n3-sheet-when">{e.period}</p>
                  </div>
                ))}
              </section>
            </aside>
          </div>
        </article>
      </Reveal>

      {/*
        Both actions are hidden from the printed output — a sheet of paper with
        a "Print" button on it is the oldest tell that a page was never meant
        to be printed.
      */}
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
