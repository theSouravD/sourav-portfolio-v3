import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

/**
 * React Bits' SplitText, vendored — with two changes, both deliberate.
 *
 * 1. `trigger`. Upstream only ever plays on scroll: the tween is handed a
 *    ScrollTrigger and fires when the element comes into view. That is right
 *    for text down a page and wrong for anything that is on screen at load,
 *    because a trigger measures its element's position once and a fixed
 *    overlay has no scroll position to come into. This project has already
 *    lost three separate blocks of content to exactly that (the gallery grid,
 *    the case modules, the career accordion), so `trigger="mount"` skips
 *    ScrollTrigger entirely and plays immediately. The default is still
 *    "scroll", so the component behaves as upstream everywhere else.
 *
 * 2. `mask`. GSAP's own SplitText can wrap each part in an overflow-hidden
 *    box, which is what lets letters rise from behind a hard edge instead of
 *    fading in over the page. It is the difference between type that ARRIVES
 *    and type that merely appears, and it costs one prop.
 *
 * Vendoring rather than installing is React Bits' intended model — the
 * components are published to be copied and tuned.
 */
export interface SplitTextProps {
  text: string;
  className?: string;
  /** Stagger between parts, in milliseconds. */
  delay?: number;
  /** Duration of one part's tween, in seconds. */
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  /** Wrap each part in an overflow-hidden box so it can rise from behind an edge. */
  mask?: 'chars' | 'words' | 'lines';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  /** "mount" plays at once; "scroll" waits to come into view (upstream default). */
  trigger?: 'scroll' | 'mount';
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: React.CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  mask,
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  trigger = 'scroll',
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete,
}) => {
  const ref = useRef<HTMLElement>(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  /* Initialised during render rather than from the effect below: when the font
     is already cached this is true on the first pass, so the split happens in
     the same render instead of after an extra one. */
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(
    () => typeof document !== 'undefined' && document.fonts?.status === 'loaded',
  );

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  /*
   * Splitting before the real font has loaded measures the fallback's metrics,
   * so every character box is wrong and the word re-flows mid-animation.
   *
   * The timeout is the part upstream does not have, and it matters here: this
   * component gates a loading sequence, so a `fonts.ready` that never settles
   * — a blocked font host, an offline stylesheet — would leave the site on a
   * blank screen forever. After 1.2s the fallback metrics are simply accepted.
   * Slightly wrong letter spacing beats a page that never arrives.
   */
  useEffect(() => {
    if (fontsLoaded) return;
    let live = true;
    document.fonts.ready.then(() => { if (live) setFontsLoaded(true); });
    const t = window.setTimeout(() => { if (live) setFontsLoaded(true); }, 1200);
    return () => { live = false; clearTimeout(t); };
  }, [fontsLoaded]);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;
      if (animationCompletedRef.current) return;

      const el = ref.current as HTMLElement & { _rbsplitInstance?: GSAPSplitText };

      if (el._rbsplitInstance) {
        try { el._rbsplitInstance.revert(); } catch { /* already gone */ }
        el._rbsplitInstance = undefined;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      let targets: Element[] = [];
      const assignTargets = (self: GSAPSplitText) => {
        if (splitType.includes('chars') && self.chars.length) targets = self.chars;
        if (!targets.length && splitType.includes('words') && self.words.length) targets = self.words;
        if (!targets.length && splitType.includes('lines') && self.lines.length) targets = self.lines;
        if (!targets.length) targets = self.chars || self.words || self.lines;
      };

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        mask,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: (self: GSAPSplitText) => {
          assignTargets(self);
          return gsap.fromTo(
            targets,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              ...(trigger === 'mount'
                ? {}
                : { scrollTrigger: { trigger: el, start, once: true, fastScrollEnd: true, anticipatePin: 0.4 } }),
              onComplete: () => {
                animationCompletedRef.current = true;
                onCompleteRef.current?.();
              },
              willChange: 'transform, opacity',
              force3D: true,
            },
          );
        },
      });

      el._rbsplitInstance = splitInstance;

      return () => {
        ScrollTrigger.getAll().forEach((st) => { if (st.trigger === el) st.kill(); });
        try { splitInstance.revert(); } catch { /* already gone */ }
        el._rbsplitInstance = undefined;
      };
    },
    {
      dependencies: [
        text, delay, duration, ease, splitType, mask, trigger,
        JSON.stringify(from), JSON.stringify(to), threshold, rootMargin, fontsLoaded,
      ],
      scope: ref,
    },
  );

  const style: React.CSSProperties = {
    textAlign,
    display: 'inline-block',
    whiteSpace: 'nowrap',
    willChange: 'transform, opacity',
  };
  const Tag = (tag || 'p') as React.ElementType;

  return (
    <Tag ref={ref} style={style} className={`split-parent ${className}`}>
      {text}
    </Tag>
  );
};

export default SplitText;
