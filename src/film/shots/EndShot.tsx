import { ArrowUpRight } from 'lucide-react';
import Panned from '../Panned';
import Magnet from '@/reactbits/Magnet';
import { useFilm } from '../FilmContext';
import { contact, profile } from '@/data/content';

const ease = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);

/** SC 09 — end card. Credits roll, then the way out. */
export default function EndShot({ local }: { local: number }) {
  const { seek } = useFilm();
  const head = ease(local / 0.24);

  return (
    <Panned local={local} className="pb-28 pt-24">
      <div className="nova-shell">
        <div
          className="mb-8 border-b border-white/12 pb-4"
          style={{ opacity: head, transform: `translateY(${(1 - head) * 18}px)` }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
            SC 09 · End Card
          </span>
        </div>

        <h2
          className="max-w-[20ch] text-[clamp(1.8rem,4.4vw,3.4rem)] font-normal leading-[1.1] tracking-[-0.03em] text-white"
          style={{
            opacity: ease((local - 0.05) / 0.26),
            transform: `translateY(${(1 - ease((local - 0.05) / 0.26)) * 26}px)`,
            textShadow: '0 10px 30px rgba(0,0,0,0.6)',
          }}
        >
          {contact.heading}
        </h2>

        <p
          className="mt-5 max-w-[52ch] text-sm leading-relaxed text-white/70"
          style={{ opacity: ease((local - 0.12) / 0.26) }}
        >
          {contact.body}
        </p>

        {/* Credits block */}
        <div className="mt-10 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          {contact.items.map((item, i) => {
            const step = ease((local - 0.16 - i * 0.05) / 0.26);
            return (
              <div
                key={item.label}
                className="border-t border-white/12 pt-3"
                style={{ opacity: step, transform: `translateY(${(1 - step) * 16}px)` }}
              >
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                  {item.label}
                </div>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-white transition-colors duration-300 hover:text-white/65"
                  >
                    {item.value}
                    <ArrowUpRight size={12} className="opacity-50" />
                  </a>
                ) : (
                  <p className="mt-1.5 text-sm text-white">{item.value}</p>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="mt-10 flex flex-wrap items-center gap-3"
          style={{ opacity: ease((local - 0.34) / 0.24) }}
        >
          <Magnet padding={60} magnetStrength={5}>
            <a
              href="mailto:souravdey2105@gmail.com"
              className="cursor-target inline-flex min-h-[44px] items-center rounded-full bg-white px-6 text-[13px] font-medium text-black transition-colors duration-300 hover:bg-white/85"
            >
              Start a conversation
            </a>
          </Magnet>
          {/*
            In-film this opens the PDF rather than downloading it — the sticky
            bar already carries Download, so this is the "look at it now" route.
          */}
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="cursor-target group inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 text-[13px] font-medium text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/20"
          >
            View Resume
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
          <button
            type="button"
            onClick={() => seek(0)}
            className="inline-flex min-h-[44px] items-center px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 transition-colors duration-300 hover:text-white"
          >
            Replay from titles
          </button>
        </div>
      </div>
    </Panned>
  );
}
