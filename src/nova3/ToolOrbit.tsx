import { tools } from '@/data/content';

/**
 * The tools, on two counter-rotating rings.
 *
 * WHY INITIALS AND NOT LOGOS
 * There are no logo files in this project, and scraping brand marks off the
 * web for a personal site is a licensing problem dressed up as a design
 * decision. Setting each tool as its own monogram has the better side effect
 * anyway: it looks like one designed system instead of sixteen companies'
 * brand guidelines fighting each other in a circle, and it never breaks when
 * one of them redraws its mark.
 *
 * WHY NOT THE FULL NAMES
 * The first version put the whole name on each chip and they overlapped into
 * an unreadable knot — sixteen chips averaging 110px around an 880px circle
 * does not fit, and no amount of tuning makes it fit. The names are already
 * on the belt below this, set horizontally and hoverable, which is the right
 * place to READ them. The ring's job is to say "there are sixteen of these
 * and they are in motion", and a monogram says that in a twentieth of the
 * width.
 *
 * THE MECHANISM
 * Each badge is rotated out to the radius and then rotated back by the same
 * angle, so it travels the circle while staying upright — a badge that tumbles
 * with the ring is unreadable for most of its trip. The ring carries one
 * animated transform for all of its children, so a ring costs one composited
 * layer rather than one per badge, and each badge runs the same animation in
 * reverse to cancel the spin.
 */

/**
 * A monogram that is unique across the set.
 *
 * Initials of every word: "Adobe Premiere Pro" is APP and "Adobe Photoshop"
 * is AP, which keeps the four Adobe products apart — a plain two-letter rule
 * made all of them "AD". Single words take their first two letters instead,
 * since one initial is not a mark.
 */
function monogram(name: string) {
  const words = name.split(/[\s-]+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.map((w) => w[0]).join('').slice(0, 3).toUpperCase();
}

function Ring({ items, radius, seconds, reverse }: {
  items: string[];
  radius: number;
  seconds: number;
  reverse?: boolean;
}) {
  return (
    <div
      className="n3-orbit"
      style={{
        animationDuration: `${seconds}s`,
        animationDirection: reverse ? 'reverse' : 'normal',
        width: radius * 2,
        height: radius * 2,
      }}
    >
      {items.map((t, i) => {
        const angle = (360 / items.length) * i;
        return (
          <i
            key={t}
            className="n3-orbit-chip"
            title={t}
            style={{
              transform: `rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`,
            }}
          >
            <b
              style={{
                animationDuration: `${seconds}s`,
                animationDirection: reverse ? 'normal' : 'reverse',
              }}
            >
              {monogram(t)}
            </b>
          </i>
        );
      })}
    </div>
  );
}

export default function ToolOrbit() {
  // The outer ring carries more, which is what keeps the spacing even instead
  // of crowding the smaller circle.
  const cut = Math.ceil(tools.length * 0.62);
  return (
    <div className="n3-orbit-wrap" aria-hidden>
      <span className="n3-orbit-track" style={{ width: 292, height: 292 }} />
      <span className="n3-orbit-track" style={{ width: 180, height: 180 }} />
      <div className="n3-orbit-core">
        <span>{tools.length}</span>
        <em>tools</em>
      </div>
      <Ring items={tools.slice(0, cut)} radius={146} seconds={52} />
      <Ring items={tools.slice(cut)} radius={90} seconds={38} reverse />
    </div>
  );
}
