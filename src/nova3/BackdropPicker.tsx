import { useEffect, useRef, useState } from 'react';
import { Check, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import {
  BACKDROPS, CLICKS, CURSORS, INTENSITY, PAPERNESS, SOUNDS, TEXTURES,
  type BackdropId, type ClickId, type CursorId, type SoundId, type TextureId,
} from './theme';

/**
 * THE THEME CENTRE.
 *
 * This exists to be used hard for an afternoon and then deleted. It is a tool
 * for DECIDING between options, not a feature of the finished site — so it
 * applies everything instantly with no preview step and no confirm, because
 * choosing between nine grounds means seeing each one on the real page with
 * the real type over it, which no swatch can show you.
 *
 * Four tabs rather than one long column: a panel you have to scroll to compare
 * two options is a panel that makes comparison hard, which is the one job it
 * has. Each tab fits without scrolling.
 */

type Tab = 'ground' | 'sound' | 'cursor';

export interface ThemeState {
  backdrop: BackdropId;
  texture: TextureId;
  sound: SoundId;
  click: ClickId;
  cursor: CursorId;
  intensity: number;
  paperness: number;
}

export default function BackdropPicker({
  state, onChange, onReset,
}: {
  state: ThemeState;
  onChange: (patch: Partial<ThemeState>) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('ground');
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

  const list = <T extends string>(
    items: readonly { id: T; label: string; note: string }[],
    current: T,
    pick: (id: T) => void,
  ) => (
    <ul>
      {items.map((o) => (
        <li key={o.id}>
          <button type="button" className={current === o.id ? 'is-on' : ''} onClick={() => pick(o.id)}>
            <span>
              <strong>{o.label}</strong>
              <em>{o.note}</em>
            </span>
            {current === o.id && <Check size={13} />}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="n3-pick" ref={box}>
      <button
        type="button"
        className={`n3-pick-btn ${open ? 'is-on' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Theme options"
        title="Theme options"
      >
        {open ? <X size={14} /> : <SlidersHorizontal size={14} />}
      </button>

      {open && (
        <div className="n3-pick-panel" role="dialog" aria-label="Theme options">
          <div className="n3-pick-tabs" role="tablist">
            {(['ground', 'sound', 'cursor'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                className={tab === t ? 'is-on' : ''}
                onClick={() => setTab(t)}
              >
                {t === 'ground' ? 'Background' : t === 'sound' ? 'Sound' : 'Cursor'}
              </button>
            ))}
          </div>

          <div className="n3-pick-body">
            {tab === 'ground' && (
              <>
                {/*
                  The two sliders come FIRST, above the list. They apply to
                  whichever ground is selected, so putting them underneath
                  would read as belonging to the last item in the list.
                */}
                <label className="n3-slider">
                  <span>Intensity<em>{state.intensity}%</em></span>
                  <input
                    type="range"
                    min={INTENSITY.min} max={INTENSITY.max} step={INTENSITY.step}
                    value={state.intensity}
                    onChange={(e) => onChange({ intensity: Number(e.target.value) })}
                  />
                </label>
                <label className="n3-slider">
                  <span>Paper<em>{state.paperness ? `+${state.paperness}% white` : 'warm stock'}</em></span>
                  <input
                    type="range"
                    min={PAPERNESS.min} max={PAPERNESS.max} step={PAPERNESS.step}
                    value={state.paperness}
                    onChange={(e) => onChange({ paperness: Number(e.target.value) })}
                  />
                </label>

                <p className="n3-pick-head">Ground</p>
                {list(BACKDROPS, state.backdrop, (backdrop) => onChange({ backdrop }))}

                <p className="n3-pick-head">Texture</p>
                {list(TEXTURES, state.texture, (texture) => onChange({ texture }))}
              </>
            )}

            {tab === 'sound' && (
              <>
                {/* The click comes first: it is the cue you hear most, and
                    every option in this list is audible the moment you pick
                    it, because picking it is a click. */}
                <p className="n3-pick-head">Click</p>
                {list(CLICKS, state.click, (click) => onChange({ click }))}

                <p className="n3-pick-head">Everything else</p>
                {list(SOUNDS, state.sound, (sound) => onChange({ sound }))}
                <p className="n3-pick-note">
                  Nothing plays until you first click the page — every browser
                  blocks audio before that.
                </p>
              </>
            )}

            {tab === 'cursor' && (
              <>
                <p className="n3-pick-head">Cursor</p>
                {list(CURSORS, state.cursor, (cursor) => onChange({ cursor }))}
                <p className="n3-pick-note">
                  Custom cursors apply on a mouse only. Touch keeps the system one.
                </p>
              </>
            )}
          </div>

          <div className="n3-pick-foot">
            <span>Saved on this device.</span>
            <button type="button" onClick={onReset}>
              <RotateCcw size={11} /> Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
