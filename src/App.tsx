import { useEffect, useState } from 'react';
import Background from '@/components/Background';
import Slate from '@/film/Slate';
import Cursor from '@/film/Cursor';
import { FilmProvider } from '@/film/FilmContext';
import Film from '@/film/Film';
import Timeline from '@/film/Timeline';
import ScrollFeedback from '@/film/ScrollFeedback';
import CaseFiles from '@/sections/CaseFiles';
import { savedPreset } from '@/film/BackgroundPicker';
import { Footer } from '@/components/Contact';
import { initSmoothScroll, destroySmoothScroll, getLenis } from '@/lib/scroll';

export default function App() {
  // The slate is the opening title, so it plays on every load — no session skip.
  const [rolling, setRolling] = useState(false);
  const [preset, setPreset] = useState(savedPreset);

  useEffect(() => {
    if (!rolling) return;
    const lenis = initSmoothScroll();
    lenis?.scrollTo(0, { immediate: true });
    return destroySmoothScroll;
  }, [rolling]);

  useEffect(() => {
    if (rolling) return;
    getLenis()?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [rolling]);

  return (
    <FilmProvider rolling={rolling}>
      <div className="relative">
        <Cursor />
        <Background preset={preset} />

        {!rolling && <Slate onCut={() => setRolling(true)} />}

        {/*
          Opacity and blur only, no transform. Scaling this wrapper scales a
          20,000px document, which changes its height and briefly pushes a
          horizontal scrollbar onto the page.
        */}
        <div
          className={`relative z-10 transition-[opacity,filter] duration-700 ${
            rolling ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
          }`}
        >
          <Film />
          <CaseFiles />
          <Footer />
        </div>

        <ScrollFeedback />
        {rolling && <Timeline preset={preset} onPreset={setPreset} />}
      </div>
    </FilmProvider>
  );
}
