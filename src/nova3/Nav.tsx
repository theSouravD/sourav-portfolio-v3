import { SETUPS, type SectionId } from './scenes';
import { profile } from '@/data/content';

/**
 * The navigation.
 *
 * This is the dummy-proofing, and it is deliberately the least clever thing on
 * the site: six words in a bar, always on screen, one click each. No timeline
 * to interpret, no gesture to learn, no scrubber to notice. Everything the
 * visitor might want is one tap away from wherever they are.
 *
 * Nova I put the navigation inside the experience — a beautiful edit timeline
 * that you had to work out before you could use. That is the single thing that
 * made it hard, and the fix is not a better timeline, it is an ordinary bar
 * next to an extraordinary page. Spend the invention on the rooms; keep the
 * door handles standard.
 *
 * DESKTOP puts it at the top, where a nav belongs.
 * PHONES put it at the bottom, where a thumb is — same six words, same order,
 * same result. Nothing is hidden behind a hamburger, because a menu you have
 * to open is a menu somebody doesn't.
 */
export default function Nav({
  active,
  onGo,
  themeControl,
}: {
  active: SectionId;
  onGo: (id: SectionId) => void;
  /** The theme centre, rendered inside the bar beside Resume. */
  themeControl?: React.ReactNode;
}) {
  return (
    <nav className="n3-nav" aria-label="Sections">
      <button
        type="button"
        className="n3-brand"
        onClick={() => onGo('home')}
        aria-label={`${profile.name} — home`}
      >
        <span className="n3-brand-dot" />
        {profile.brand}
      </button>

      <ul className="n3-links">
        {SETUPS.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className={`n3-link ${active === s.id ? 'is-on' : ''}`}
              aria-current={active === s.id ? 'page' : undefined}
              title={s.note}
              onClick={() => onGo(s.id)}
            >
              {s.label}
              {/* The underline is the active state and the hover state at once,
                  and it takes the room's accent — so the nav is graded with
                  everything else rather than sitting outside the lighting. */}
              <i />
            </button>
          </li>
        ))}
      </ul>

      <div className="n3-nav-end">
        <a className="n3-cv" href={profile.resumeUrl} download>
          Resume
        </a>
        {themeControl}
      </div>
    </nav>
  );
}
