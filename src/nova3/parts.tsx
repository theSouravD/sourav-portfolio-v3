/**
 * Shared bits that are not rooms.
 *
 * These lived in Sections.tsx and are used from CaseRoom too, which made that
 * file export both components and helpers — the arrangement Fast Refresh
 * cannot follow, so editing a room reloaded the module instead of hot-swapping
 * the component. Splitting them out is the fix, and it also stops CaseRoom
 * importing the entire set of rooms to get one function.
 */

/**
 * THE ENTRANCE — and why it is not a scroll trigger.
 *
 * Three separate "the content is missing" bugs in this build had one cause:
 * AnimatedContent reveals on a ScrollTrigger, and a trigger measures where an
 * element sits ONCE, when it is created. That is a promise the layout cannot
 * keep. Point it at the wrong scroller and everything below the fold stays at
 * opacity 0 for good. Point it at the right one and it still breaks the moment
 * the page changes height underneath it — close the open role in Career and
 * five rows slide up into space the trigger already decided was off-screen, so
 * they never appear. A visitor concludes there is nothing else and leaves.
 *
 * No reveal is worth that. An entrance is decoration; being visible is the
 * product. So it is a CSS animation on a delay from mount: it cannot be told a
 * wrong position because it never asks for one, and `both` fill holds the
 * start frame through the delay so nothing flashes before its turn.
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
