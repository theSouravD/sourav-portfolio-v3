import { Hexagon } from 'lucide-react';
import Magnet from '@/reactbits/Magnet';
import { profile } from '@/data/content';

export function Footer() {
  return (
    <footer className="border-t border-white/15 py-12">
      <div className="nova-shell flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <strong className="flex items-center gap-2.5 text-lg font-medium tracking-tight text-white">
            <Hexagon size={20} strokeWidth={1.5} />
            {profile.name}
          </strong>
          <p className="nova-label mt-2">{profile.role}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Magnet padding={60} magnetStrength={5}>
            <a
              href="mailto:souravdey2105@gmail.com"
              className="nova-pill cursor-target bg-white text-black hover:bg-white/85"
            >
              Email
            </a>
          </Magnet>
          <a
            href="https://www.linkedin.com/in/souravdey2105/"
            target="_blank"
            rel="noreferrer"
            className="nova-pill cursor-target border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
