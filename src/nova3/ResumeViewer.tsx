import { useEffect } from 'react';
import { Download, ExternalLink, X } from 'lucide-react';
import { profile } from '@/data/content';

/**
 * The CV, read in place.
 *
 * A download link asks somebody to commit before they know whether the thing
 * is worth having — they have to accept a file onto their machine, find it,
 * and open it in another app, and a recruiter skimming ten portfolios will
 * simply not do that. Reading it here costs one click and nothing else, and
 * the download is still there for the one person who wants the file.
 *
 * The PDF renders in an <iframe>, which uses the browser's own viewer: it
 * already has zoom, page navigation, text selection, search and print, all of
 * it better than anything worth rebuilding. Where a browser refuses to render
 * PDFs inline — some mobile browsers do — the two buttons below are the whole
 * fallback, so the panel is never a dead end.
 */
export default function ResumeViewer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    // Capture, so Escape closes the viewer rather than reaching the Stage's
    // own handler and changing room out from under it.
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="n3-cv-wrap" role="dialog" aria-modal="true" aria-label="Resume">
      <button type="button" className="n3-cv-scrim" onClick={onClose} aria-label="Close resume" />
      <div className="n3-cv-panel">
        <header className="n3-cv-bar">
          <span className="n3-eyebrow n3-accent">{profile.name} — CV</span>
          <div className="n3-cv-acts">
            <a className="n3-btn" href={profile.resumeUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={13} /> New tab
            </a>
            <a className="n3-btn" href={profile.resumeUrl} download>
              <Download size={13} /> Download
            </a>
            <button type="button" className="n3-btn n3-cv-x" onClick={onClose} aria-label="Close">
              <X size={14} />
            </button>
          </div>
        </header>
        <iframe className="n3-cv-frame" src={`${profile.resumeUrl}#view=FitH`} title="Resume" />
      </div>
    </div>
  );
}
