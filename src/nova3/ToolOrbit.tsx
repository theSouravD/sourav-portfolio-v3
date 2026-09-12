import { useState } from 'react';
import { tools } from '@/data/content';
import { markFor } from './marks';

/**
 * The tools, on two rings.
 *
 * WHY WORDMARKS AND NOT A GRID OF LOGOS
 * simple-icons carries 3,400 brand marks and none of the ones this list needs
 * most: Adobe pulled its whole set, and so did OpenAI. Half the ring would
 * have a mark and half would not, which looks broken in a way that no amount
 * of styling fixes. So every chip is the tool's NAME — the wordmark — and the
 * marks that DO exist ride alongside as a small glyph in the brand's own
 * colour. Same chip shape either way, so the ring reads as one system, and a
 * tool without an icon is not visibly second class.
 *
 * Abbreviations are gone entirely. "AAE" told a reader nothing.
 *
 * SORTED BY LENGTH
 * Shortest names on the tightest circle — an arc has less room the further
 * in it sits. The ring geometry is explained where the radii are set.
 *
 * CLICKING
 * A chip selects its tool: the ring stops, the chip lights, and the centre
 * names it. Stopping matters — chasing a moving target with a cursor is a
 * game, not an interface — and the centre is where the eye already is.
 */

function Chip({ tool, active, onPick, spin, reverse }: {
  tool: string;
  active: boolean;
  onPick: () => void;
  spin: number;
  reverse: boolean;
}) {
  const mark = markFor(tool);
  return (
    <button
      type="button"
      className={`n3-orbit-chip ${active ? 'is-on' : ''}`}
      onClick={onPick}
      /* The chip counter-rotates at the ring's own period, so it rides the
         circle while staying upright. A chip that tumbles with the ring is
         unreadable for most of its trip. */
      style={{
        animationDuration: `${spin}s`,
        animationDirection: reverse ? 'normal' : 'reverse',
      }}
    >
      {mark ? (
        <svg viewBox="0 0 24 24" aria-hidden style={{ fill: `#${mark.hex}` }}>
          <path d={mark.path} />
        </svg>
      ) : (
        <i style={{ background: 'currentColor' }} />
      )}
      {tool}
    </button>
  );
}

function Ring({ items, radius, seconds, reverse, active, onPick }: {
  items: string[];
  radius: number;
  seconds: number;
  reverse?: boolean;
  active: string | null;
  onPick: (t: string) => void;
}) {
  return (
    /*
     * Pausing is left entirely to CSS (`:hover` and `:has(.is-on)` in
     * nova3.css). Setting animation-play-state inline here as well looked
     * harmless and was not: an inline `running` outranks any stylesheet rule,
     * so the hover pause silently never applied and the chips stayed
     * unclickable — which is how the automated click found it.
     */
    <div
      className="n3-orbit"
      style={{
        animationDuration: `${seconds}s`,
        animationDirection: reverse ? 'reverse' : 'normal',
      }}
    >
      {items.map((t, i) => {
        const angle = (360 / items.length) * i;
        return (
          <span
            key={t}
            className="n3-orbit-slot"
            style={{ transform: `rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)` }}
          >
            <Chip
              tool={t}
              active={active === t}
              onPick={() => onPick(t)}
              spin={seconds}
              reverse={!!reverse}
            />
          </span>
        );
      })}
    </div>
  );
}

/**
 * The same tools, as a list.
 *
 * The orbit is 486px square and its geometry is the point of it — two rings
 * 95px apart so a wide chip on the inner one cannot reach into the outer
 * band. There is no version of that which survives a 354px phone, so below
 * the breakpoint the orbit is hidden.
 *
 * It used to be hidden into nothing. A belt of tool chips ran under the copy
 * and was deleted as duplication, which it was on a desktop — and which left
 * the sixteen tools appearing NOWHERE on any screen under 1280px wide. Half
 * of what the About room is for, missing on every phone and most laptops,
 * because the surviving copy was the one that needs a metre of space.
 *
 * So the list is back, as the narrow-screen form of the same content rather
 * than as a second copy of it: same chips, same brand marks, no ring. Static
 * rather than clickable, because selecting a chip exists to stop the ring
 * and name the tool in the middle, and a list that holds still has already
 * done both.
 */
export function ToolList() {
  return (
    <div className="n3-toollist">
      {/* Labelled, unlike the core-skills row above it. Two unlabelled rows
          of pills in one room read as one long row of the same kind of
          thing, and these are not the same kind of thing. */}
      <p className="n3-eyebrow">AI toolkit</p>
      <ul>
        {tools.map((t) => {
          const mark = markFor(t);
          return (
            <li key={t}>
              {mark ? (
                <svg viewBox="0 0 24 24" aria-hidden style={{ fill: `#${mark.hex}` }}>
                  <path d={mark.path} />
                </svg>
              ) : (
                <i style={{ background: 'currentColor' }} />
              )}
              {t}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function ToolOrbit() {
  const [active, setActive] = useState<string | null>(null);

  /*
   * TWO rings, not three, and the gap between them is the constraint.
   *
   * A chip is a horizontal pill up to ~130px wide but only 24px tall, so what
   * decides whether two rings collide is not the vertical clearance — it is
   * whether a wide chip on the inner ring reaches sideways into the outer
   * ring's band. Three rings gave a 55px radial gap and chips crossed it
   * constantly. Two rings 95px apart cannot.
   *
   * Shortest names inside: an arc has less room the further in it sits.
   */
  const sorted = [...tools].sort((a, b) => a.length - b.length);
  const inner = sorted.slice(0, 6);
  const outer = sorted.slice(6);

  const pick = (t: string) => setActive((c) => (c === t ? null : t));

  return (
    <div className="n3-orbit-wrap">
      <span className="n3-orbit-track" style={{ width: 424, height: 424 }} />
      <span className="n3-orbit-track" style={{ width: 234, height: 234 }} />

      <div className={`n3-orbit-core ${active ? 'is-on' : ''}`} aria-live="polite">
        {active ? <strong>{active}</strong> : <><span>AI</span><em>toolkit</em></>}
      </div>

      <Ring items={outer} radius={212} seconds={62} active={active} onPick={pick} />
      <Ring items={inner} radius={117} seconds={40} reverse active={active} onPick={pick} />
    </div>
  );
}
