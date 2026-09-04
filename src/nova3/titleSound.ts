/**
 * Sound for the title sequence.
 *
 * SYNTHESISED, NOT A FILE
 * A hosted audio file would be a request, a cache entry and a licence to
 * worry about, for something under a second long. This is a handful of
 * oscillators and a noise burst — a few hundred bytes of code, no asset, and
 * it can be re-tuned by changing a number instead of re-rendering a wav.
 *
 * THE AUTOPLAY PROBLEM, HANDLED HONESTLY
 * Every browser blocks audio until the user has interacted with the page, and
 * an AudioContext created before that starts suspended. Trying to defeat that
 * is both futile and rude, so this does not try: the first load is silent,
 * the context is only created after a real gesture, and the sound is there
 * from then on. Sound is off by default for the same reason — a portfolio
 * that makes noise at a stranger unprompted is a portfolio they close.
 *
 * WHAT IT SOUNDS LIKE
 * Per glyph, a very short filtered noise tick — the mechanical part, like a
 * shutter or a title card landing. Under the whole sequence, one low sine
 * that swells and falls: the weight. Neither is a musical note, because a
 * pitched tone under a name reads as a jingle.
 */

let ctx: AudioContext | null = null;

/** Only ever called from inside a user gesture. */
function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try { ctx = new Ctor(); } catch { return null; }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** A short band-passed noise burst. The "tick" of a glyph landing. */
function tick(ac: AudioContext, at: number, gain: number) {
  const len = Math.floor(ac.sampleRate * 0.05);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i += 1) {
    // Decay the noise as it is written, so the burst has a shape rather than
    // being a flat block of hiss with an envelope stuck on the front.
    data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  }

  const src = ac.createBufferSource();
  src.buffer = buf;

  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  // Slight jitter per tick. Sixteen identical ticks read as a machine gun;
  // a few percent of variation reads as a mechanism.
  bp.frequency.value = 1900 + Math.random() * 900;
  bp.Q.value = 1.1;

  const g = ac.createGain();
  g.gain.setValueAtTime(gain, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.06);

  src.connect(bp).connect(g).connect(ac.destination);
  src.start(at);
  src.stop(at + 0.07);
}

/** The low swell under the whole sequence. */
function swell(ac: AudioContext, at: number, seconds: number) {
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(52, at);
  osc.frequency.exponentialRampToValueAtTime(38, at + seconds);

  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(0.09, at + seconds * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, at + seconds);

  osc.connect(g).connect(ac.destination);
  osc.start(at);
  osc.stop(at + seconds + 0.05);
}

/**
 * Play the sequence. `glyphs` is how many ticks, `stagger` the gap between
 * them in ms — passed in so the audio and the animation are driven by the
 * same two numbers and cannot drift apart when either is re-tuned.
 */
export function playTitle(glyphs: number, stagger: number, delay = 0) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay / 1000;
  const span = (glyphs * stagger) / 1000;

  swell(ac, t0, span + 0.9);
  for (let i = 0; i < glyphs; i += 1) {
    // Quieter as it goes: the first letters land hardest, which is what stops
    // sixteen equal ticks reading as a typewriter.
    tick(ac, t0 + (i * stagger) / 1000, 0.075 * (1 - i / (glyphs * 1.7)));
  }
}

const KEY = 'nova3.sound';

export function readSound(): boolean {
  try { return localStorage.getItem(KEY) === 'on'; } catch { return false; }
}
export function saveSound(on: boolean) {
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* ignore */ }
}
