import { useEffect, useRef, useState } from 'react';
import { Check, Palette, X } from 'lucide-react';
import {
  BACKDROPS, TEXTURES,
  type BackdropId, type TextureId,
} from './backdrops';

/**
 * The background picker.
 *
 * This exists to be USED and then mostly ignored — it is how a background gets
 * chosen, not a feature of the site. So it sits in the corner as one small
 * button, opens a plain list of named options with a line of description each,
 * and applies instantly with no preview step. Deciding between five grounds
 * means seeing them on the real page with the real type over them, which a
 * thumbnail cannot show you.
 *
 * It closes on Escape and on a click outside, because a panel you have to hunt
 * for the close button on is a panel that stays open.
 */
export default function BackdropPicker({
  backdrop, texture, onBackdrop, onTexture,
}: {
  backdrop: BackdropId;
  texture: TextureId;
  onBackdrop: (id: BackdropId) => void;
  onTexture: (id: TextureId) => void;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Capture, so Escape closes this rather than reaching the Stage and
      // changing room out from under the panel.
      e.stopPropagation();
      setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <div className="n3-pick" ref={box}>
      <button
        type="button"
        className={`n3-pick-btn ${open ? 'is-on' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Background options"
        title="Background options"
      >
        {open ? <X size={14} /> : <Palette size={14} />}
      </button>

      {open && (
        <div className="n3-pick-panel" role="dialog" aria-label="Background options">
          <p className="n3-pick-head">Background</p>
          <ul>
            {BACKDROPS.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  className={backdrop === b.id ? 'is-on' : ''}
                  onClick={() => onBackdrop(b.id)}
                >
                  <span>
                    <strong>{b.label}</strong>
                    <em>{b.note}</em>
                  </span>
                  {backdrop === b.id && <Check size={13} />}
                </button>
              </li>
            ))}
          </ul>

          <p className="n3-pick-head">Texture</p>
          <ul>
            {TEXTURES.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={texture === t.id ? 'is-on' : ''}
                  onClick={() => onTexture(t.id)}
                >
                  <span>
                    <strong>{t.label}</strong>
                    <em>{t.note}</em>
                  </span>
                  {texture === t.id && <Check size={13} />}
                </button>
              </li>
            ))}
          </ul>
          <p className="n3-pick-foot">Saved on this device.</p>
        </div>
      )}
    </div>
  );
}
