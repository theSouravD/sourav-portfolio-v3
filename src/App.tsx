import Handheld from '@/nova/Handheld';
import '@/nova/handheld.css';

/**
 * NOVA II.
 *
 * One object on one screen. Nova I — the film, the nine chapters, the edit
 * timeline — is preserved on the `v1-reel` tag; this branch replaces the shell
 * entirely rather than adding to it, because the two are opposite shapes: a
 * corridor you travel through, and a room you return to.
 */
export default function App() {
  return (
    <main className="nova2-page">
      <Handheld />
    </main>
  );
}
