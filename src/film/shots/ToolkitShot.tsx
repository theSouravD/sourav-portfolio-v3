import LogoLoop from '@/reactbits/LogoLoop';
import CardSwap, { Card } from '@/reactbits/CardSwap';
import { about, coreSkills, tools } from '@/data/content';

const ease = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);

/** SC 08 — the toolkit. Skills stagger in on scroll; tools run as a strip. */
export default function ToolkitShot({ local }: { local: number }) {
  const head = ease(local / 0.2);
  const out = Math.max(0, (local - 0.82) / 0.18);

  const toolItems = tools.map((t) => ({
    node: (
      <span className="whitespace-nowrap rounded-full border border-white/15 bg-white/8 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/85 backdrop-blur-md">
        {t}
      </span>
    ),
    title: t,
  }));

  return (
    <div className="flex h-full flex-col justify-center pb-28 pt-24">
      <div className="nova-shell" style={{ opacity: 1 - out }}>
        <div
          className="mb-8 border-b border-white/12 pb-4"
          style={{ opacity: head, transform: `translateY(${(1 - head) * 18}px)` }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
            SC 08 · Toolkit
          </span>
          <h2 className="mt-3 text-[clamp(2rem,4.6vw,3.6rem)] font-normal leading-[1.05] tracking-[-0.03em] text-white">
            {about.heading}
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-14">
          <p
            className="max-w-[48ch] text-[clamp(0.9rem,1.15vw,1.05rem)] leading-[1.75] text-white/78"
            style={{ opacity: ease((local - 0.08) / 0.24), transform: `translateY(${(1 - ease((local - 0.08) / 0.24)) * 20}px)` }}
          >
            {about.body}
          </p>

          {/* Three cards cycling in 3D — the disciplines, dealt like slides */}
          <div
            className="relative h-[220px]"
            style={{ opacity: ease((local - 0.14) / 0.26) }}
          >
            <CardSwap width={320} height={190} cardDistance={44} verticalDistance={52} delay={3200} skewAmount={4} pauseOnHover>
              <Card customClass="!bg-[#0d0d0d] !border-white/20 p-5">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">Discipline 01</span>
                <strong className="mt-2 block text-[15px] font-medium text-white">{about.aside.title}</strong>
                <span className="mt-2 block text-[12px] leading-relaxed text-white/65">{about.aside.body}</span>
              </Card>
              <Card customClass="!bg-[#0d0d0d] !border-white/20 p-5">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">Discipline 02</span>
                <strong className="mt-2 block text-[15px] font-medium text-white">Research → production</strong>
                <span className="mt-2 block text-[12px] leading-relaxed text-white/65">
                  Model testing, RCA, prompt engineering and validation, turned into workflows a team can run.
                </span>
              </Card>
              <Card customClass="!bg-[#0d0d0d] !border-white/20 p-5">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">Discipline 03</span>
                <strong className="mt-2 block text-[15px] font-medium text-white">Scale without drift</strong>
                <span className="mt-2 block text-[12px] leading-relaxed text-white/65">
                  Creative quality and consistency held steady across high-volume output.
                </span>
              </Card>
            </CardSwap>
          </div>
        </div>

        <ul className="mt-9 flex flex-wrap gap-2.5">
          {coreSkills.map((s, i) => {
            const step = ease((local - 0.18 - i * 0.014) / 0.26);
            return (
              <li
                key={s}
                className="rounded-full border border-white/15 bg-white/8 px-3.5 py-2 text-xs text-white/85 backdrop-blur-md transition-colors duration-300 hover:border-white/35 hover:bg-white/18 hover:text-white"
                style={{ opacity: step, transform: `translateY(${(1 - step) * 14}px)` }}
              >
                {s}
              </li>
            );
          })}
        </ul>

        <div
          className="mt-8 overflow-hidden rounded-2xl border border-white/15 bg-white/8 px-6 py-6 backdrop-blur-xl"
          style={{ opacity: ease((local - 0.32) / 0.24) }}
        >
          <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
            Tools
          </span>
          <div className="[mask-image:linear-gradient(90deg,transparent,black_7%,black_93%,transparent)]">
            <LogoLoop
              logos={toolItems}
              speed={42}
              direction="left"
              logoHeight={36}
              gap={12}
              pauseOnHover
              hoverSpeed={10}
              fadeOut={false}
              ariaLabel="Tools and platforms"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
