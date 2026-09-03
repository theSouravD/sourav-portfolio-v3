import { useEffect, useRef, useState } from 'react';
import { Check, Layers, X } from 'lucide-react';
import { PRESETS } from './backgrounds';

const KEY = 'nova.bg';

/** Reads the saved choice; falls back to the first preset. */
export function savedPreset() {
  try {
    const v = localStorage.getItem(KEY);
    if (v && PRESETS.some((p) => p.id === v)) return v;
  } catch {
    /* storage unavailable — use the default */
  }
  return PRESETS[0].id;
}

/**
 * Live background switcher.
 *
 * Nine looks, swappable while the film is running, so the choice can be made by
 * eye rather than described. The pick persists in localStorage. Once you've
 * settled, set the default in `App.tsx` and delete this component — it's a
 * chooser, not a permanent feature of a portfolio.
 */
export default function BackgroundPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onClick);
    };
  }, [open]);

  const pick = (id: string) => {
    onChange(id);
    try {
      localStorage.setItem(KEY, id);
    } catch {
      /* not persisted — fine */
    }
  };

  const current = PRESETS.find((p) => p.id === value) ?? PRESETS[0];

  return (
    <div ref={panelRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Change background"
        title={`Background: ${current.name}`}
        className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors duration-300 hover:bg-white/20"
      >
        {open ? <X size={15} /> : <Layers size={15} />}
      </button>

      <div
        className={`absolute bottom-12 right-0 w-[17rem] origin-bottom-right rounded-2xl border border-white/15 bg-[#0a0a0a]/95 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-300 ${
          open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <div className="px-3 pb-2 pt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
          Background
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {PRESETS.map((p) => {
            const on = p.id === value;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => pick(p.id)}
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 ${
                  on ? 'bg-white/12' : 'hover:bg-white/6'
                }`}
              >
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center">
                  {on && <Check size={13} className="text-white" />}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-[13px] font-medium ${on ? 'text-white' : 'text-white/80'}`}
                  >
                    {p.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-white/45">
                    {p.note}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
