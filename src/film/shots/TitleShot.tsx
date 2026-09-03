import { useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import PressureName from '../PressureName';
import ShinyText from '@/reactbits/ShinyText';
import Magnet from '@/reactbits/Magnet';
import Counter from './Counter';
import { useFilm } from '../FilmContext';
import { profile, stats } from '@/data/content';


/**
 * SC 00 — main title.
 *
 * The name is TextPressure: it thickens and stretches toward the cursor, so
 * the very first thing a visitor touches reacts to them. Everything is inside
 * a fixed-size stage frame, so that reaction can never nudge the layout.
 */
export default function TitleShot({ local }: { local: number }) {
  const { goToChapter, rolling } = useFilm();

  /**
   * The title card is the first thing on screen, so its entrance is driven by
   * mount rather than scroll — a scroll-driven one sits at opacity 0 until the
   * visitor moves, which reads as a broken page. Only the exit follows scroll.
   */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  const enter = ready ? 1 : 0;
  const leave = Math.max(0, (local - 0.55) / 0.45);

  return (
    <div className="relative flex h-full flex-col justify-between pb-28 pt-24">
      {/*
        No local backdrop.

        There was a stack of blurred panels here acting as a key light, and
        before that a turning solid. Both were added on top of the background
        the visitor actually chose in the picker, and both ended up competing
        with it — a second light source in a frame that already has one reads
        as haze, not as depth. The background preset is the background.
      */}
      <div className="nova-shell flex items-start justify-between gap-8">
        <p
          className="max-w-[24rem] font-mono text-[11px] font-medium uppercase leading-[2.1] tracking-[0.18em] text-white/85 transition-all duration-[900ms] ease-out"
          style={{ opacity: enter * (1 - leave), transform: `translateY(${(1 - enter) * 22}px)` }}
        >
          {profile.tagline}
        </p>
        <p
          className="hidden max-w-[19rem] text-right font-mono text-[10px] uppercase leading-[2.1] tracking-[0.18em] text-white/45 transition-all delay-100 duration-[900ms] ease-out sm:block"
          style={{ opacity: enter * (1 - leave), transform: `translateY(${(1 - enter) * 22}px)` }}
        >
          A film in nine scenes
        </p>
      </div>

      {/*
        The production report.

        These three figures are the first thing a recruiter looks for, so they
        get the hero's empty middle band rather than a box parked in a corner.
        No card, no fill, no border around the group — just the numbers set very
        large with hairline rules between them, the way a title sequence would
        set a statistic. The count-up is what makes them land: a number that
        arrives at its value reads as a measurement, one that fades in reads as
        decoration.
      */}
      <div className="-translate-y-[9vh]">
        <div
          className="nova-shell transition-all delay-100 duration-[1100ms] ease-out"
          style={{
            opacity: enter * (1 - leave),
            transform: `translateY(${(1 - enter) * 26 + leave * -30}px)`,
          }}
        >
        {/*
          Top-aligned, not bottom-aligned. The labels run to one or two lines,
          so hanging the columns from their baselines left the figures sitting
          at three different heights. Aligned from the top, the numbers share a
          cap line and the labels start together underneath.

          Sized well below the name on purpose: these support the title, they
          don't compete with it.
        */}
        {/*
          The columns size from their content here and are overridden for
          phones in the stylesheet — see `.nova-report` in cursor.css. The two
          frames have opposite problems (a desktop needs the group to stay tight
          on the left, a phone needs it to divide the width), and expressing
          that as responsive flex utilities put a shorthand and a longhand for
          the same property in two breakpoints, where which one wins depends on
          the order the utilities happen to be emitted in. One media query is
          the version that can't quietly stop working.
        */}
        <dl className="nova-report flex items-start">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex min-w-[8rem] flex-col pr-[clamp(0.55rem,3.4vw,3rem)] ${
                i ? 'ml-[clamp(0.55rem,3.4vw,3rem)] border-l border-white/15 pl-[clamp(0.55rem,3.4vw,3rem)]' : ''
              }`}
            >
              <dt className="flex items-baseline text-[clamp(1.6rem,3.2vw,2.6rem)] font-light leading-[1] tracking-[-0.04em] text-white tabular-nums">
                <Counter to={s.value} start={rolling} delay={450 + i * 160} />
                <span className="text-white/55">{s.suffix}</span>
              </dt>
              <dd className="mt-2.5 font-mono text-[9px] uppercase leading-[1.75] tracking-[0.16em] text-white/45 sm:max-w-[9rem] sm:text-[9.5px] sm:tracking-[0.2em]">
                {s.label}
              </dd>
            </div>
            ))}
          </dl>
        </div>
      </div>

      {/* The name — interactive, and sized by its own box so it can't reflow */}
      <div
        className="nova-shell transition-all delay-150 duration-[1100ms] ease-out"
        style={{
          opacity: enter * (1 - leave),
          transform: `scale(${0.97 + enter * 0.03}) translateY(${leave * -40}px)`,
        }}
      >
        <h1 className="m-0 text-[clamp(2.75rem,10.5vw,9rem)] font-normal leading-[0.95] tracking-[-0.035em] text-white"
            style={{ textShadow: '0 14px 44px rgba(0,0,0,0.6)' }}>
          <PressureName text={profile.name} radius={240} />
        </h1>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border-t border-white/12 pt-5">
          <ShinyText
            text={profile.role}
            speed={4.5}
            color="rgba(255,255,255,0.42)"
            shineColor="#ffffff"
            spread={150}
            className="font-mono text-[11px] font-medium uppercase tracking-[0.16em]"
          />

          <Magnet padding={70} magnetStrength={4}>
            <button
              type="button"
              onClick={() => goToChapter(1)}
              className="cursor-target group flex items-center gap-3 rounded-full border border-white/25 bg-white/10 py-2.5 pl-5 pr-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/20"
            >
              Roll film
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-black">
                <ArrowDown
                  size={13}
                  className="transition-transform duration-500 group-hover:translate-y-0.5"
                />
              </span>
            </button>
          </Magnet>
        </div>
      </div>
    </div>
  );
}
