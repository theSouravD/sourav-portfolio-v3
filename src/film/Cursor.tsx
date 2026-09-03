import { useEffect, useState } from 'react';
import TargetCursor from '@/reactbits/TargetCursor';
import './cursor.css';

/**
 * The target cursor, gated.
 *
 * TargetCursor hides the system pointer and draws its own, which is the right
 * gesture on a site that frames itself as a camera — but it is exactly wrong on
 * a touch screen (no pointer to replace, and the corners would sit frozen in a
 * corner of the viewport) and for anyone who has asked for less motion. So it
 * mounts only for a real mouse, and only when motion is welcome.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const decide = () => setEnabled(fine.matches && !still.matches);
    decide();
    fine.addEventListener('change', decide);
    still.addEventListener('change', decide);
    return () => {
      fine.removeEventListener('change', decide);
      still.removeEventListener('change', decide);
    };
  }, []);

  if (!enabled) return null;

  return (
    <TargetCursor
      targetSelector=".cursor-target"
      spinDuration={2}
      hideDefaultCursor
      parallaxOn
      cursorColor="#ffffff"
    />
  );
}
