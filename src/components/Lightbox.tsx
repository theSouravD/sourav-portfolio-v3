import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { MediaItem } from '@/data/work';
import { getLenis } from '@/lib/scroll';

/**
 * Single modal player for all three media kinds.
 *
 * v1 mounted a bare autoplaying iframe inline, which is the reason playback
 * looked broken: YouTube refuses unmuted autoplay in a freshly-injected frame,
 * and an uploader can disable embedding per-video with no error surfaced to the
 * page. So the player opens deliberately, in a modal we own.
 *
 * Work stays on this page. There is no link out to the source, the YouTube
 * chrome is stripped down as far as the embed API allows, and the native
 * <video> path drops the download control and the context menu.
 *
 * Worth being straight about the limit of that: a browser cannot be stopped
 * from reaching a file it has already fetched, and these clips are public on
 * their host anyway. This raises the effort and removes the invitation; it is
 * not copy protection, and nothing available on the web would be.
 */

function embedUrl(item: MediaItem) {
  if (item.type === 'youtube') {
    // nocookie host, no related videos, no title bar, no keyboard shortcuts,
    // and modestbranding — the least YouTube this embed can be made to show.
    const p = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
      controls: '1',
      disablekb: '1',
      iv_load_policy: '3',
      fs: '1',
    });
    return `https://www.youtube-nocookie.com/embed/${item.id}?${p.toString()}`;
  }
  if (item.type === 'cloudinary' && item.embedUrl) {
    return `${item.embedUrl}&autoplay=true`;
  }
  return null;
}

export default function Lightbox({
  item,
  onClose,
}: {
  item: MediaItem | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;

    const lenis = getLenis();
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [item, onClose]);

  if (!item) return null;

  const src = embedUrl(item);
  const isPortrait = item.thumbnailPresentation === 'portrait';

  return createPortal(
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-black/85 p-4 backdrop-blur-xl sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-medium tracking-tight text-white">
              {item.title}
            </h3>
            <p className="nova-label mt-1 truncate">{item.meta}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close player"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/25"
          >
            <X size={17} />
          </button>
        </div>

        <div
          className={`relative w-full overflow-hidden rounded-2xl border border-white/15 bg-black ${
            isPortrait ? 'mx-auto aspect-[9/16] max-w-sm' : 'aspect-video'
          }`}
        >
          {item.type === 'native' && item.videoUrl ? (
            <video
              className="h-full w-full"
              src={item.videoUrl}
              poster={item.posterUrl}
              controls
              autoPlay
              playsInline
              // No download button in the control bar, no "save video as" on
              // right-click, and no picture-in-picture window to pull it out of.
              controlsList="nodownload noplaybackrate"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : src ? (
            <iframe
              className="absolute inset-0 h-full w-full border-0"
              src={src}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-white/60">
              No player available for this item.
            </div>
          )}
        </div>

        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
          Press Esc to close
        </p>
      </div>
    </div>,
    document.body
  );
}
