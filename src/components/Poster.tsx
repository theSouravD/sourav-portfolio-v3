import { useEffect, useMemo, useState } from 'react';
import { Film } from 'lucide-react';
import type { MediaItem } from '@/data/work';

/**
 * Thumbnail with a real fallback chain.
 *
 * Only the 22 "AI Ads & Motion" clips ship a local still named after the video
 * id; the six Creative Direction entries never had one, so a bare
 * `/assets/{id}.jpg` 404s and renders a broken-image icon. The original site
 * handled this by walking YouTube's CDN — that chain was lost in the port and
 * is restored here, ending in a styled placeholder rather than a broken glyph.
 *
 *   posterUrl → /assets/{id}.jpg → i.ytimg maxres → i.ytimg hq → placeholder
 */
export default function Poster({
  item,
  src: directSrc,
  caption,
  className = '',
  fit,
}: {
  item?: MediaItem;
  /** Use instead of `item` for a plain image that still needs a safe failure. */
  src?: string;
  caption?: string;
  className?: string;
  /**
   * How the still sits in its frame. Left unset it follows the shape the data
   * declares: landscape fills the frame, square and portrait are letterboxed
   * rather than cropped.
   */
  fit?: 'cover' | 'contain';
}) {
  const chain = useMemo(() => {
    if (directSrc) return [directSrc];
    const out: string[] = [];
    if (!item) return out;
    if (item.posterUrl) out.push(item.posterUrl);
    if (item.type === 'youtube') {
      out.push(`/assets/${item.id}.jpg`);
      out.push(`https://i.ytimg.com/vi/${item.id}/maxresdefault.jpg`);
      out.push(`https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`);
    }
    return out;
  }, [item, directSrc]);

  const [step, setStep] = useState(0);
  useEffect(() => setStep(0), [chain]);

  const src = chain[step];

  /*
   * Every source failed — show something composed instead of a broken icon.
   *
   * The marks are white because this was built for a dark room. Nova III is
   * paper, where white on white is nothing at all, so each one carries a
   * `poster-empty` hook that the light theme repaints from its own stylesheet.
   * The utilities stay as the default, which leaves Nova I untouched.
   */
  if (!src) {
    return (
      <div
        className={`poster-empty grid h-full w-full place-items-center bg-gradient-to-br from-white/10 to-white/[0.03] ${className}`}
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <Film size={20} className="poster-empty-ico text-white/35" />
          <span className="poster-empty-cap font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
            {caption ?? item?.meta ?? 'No preview'}
          </span>
        </div>
      </div>
    );
  }

  /*
   * `thumbnailPresentation` was carried into the data but never read by the
   * grid, so every still was filled and centre-cropped. On a square or portrait
   * thumbnail that takes equal bites out of the top and bottom — and the top is
   * where these have their titles and faces.
   *
   * The frame still fills edge to edge (letterboxing left a dead band across
   * the top that looked worse than the crop), but non-landscape stills are
   * anchored to their top edge, so what gets lost is the floor rather than the
   * subject.
   */
  const shape = item?.thumbnailPresentation;
  const anchorTop = !fit && shape && shape !== 'landscape';

  return (
    <img
      key={src}
      src={src}
      alt=""
      loading="lazy"
      onError={() => setStep((s) => s + 1)}
      style={anchorTop ? { objectPosition: 'center top' } : undefined}
      className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
    />
  );
}
