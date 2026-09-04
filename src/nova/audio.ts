/**
 * Sound, generated live.
 *
 * No audio files: the loop and every effect are oscillators, so there is
 * nothing to download and nothing to wait for. The whole module is about 4kB
 * where a single bar of recorded music would be forty times that.
 *
 * IT STARTS SILENT AND STAYS SILENT UNTIL ASKED.
 * Every browser blocks audio that begins on its own, so an autoplaying page
 * is not merely rude — it is broken. The visitor presses SELECT, and the
 * choice is remembered for their next visit.
 */

const KEY = 'nova2-sound';

/*
 * An original riff. Deliberately not the 1985 melody it is standing next to:
 * the same key of cheerful, a different tune. Nulls are rests. Eighth notes
 * at roughly 111bpm.
 */
const LEAD = [
  659, null, 784, 880, null, 784, 659, 587,
  659, null, 880, 988, null, 880, 784, 659,
  587, null, 698, 880, null, 784, 698, 587,
  523, null, 659, 784, 880, 784, 659, 523,
];
const BASS = [
  131, null, 131, null, 165, null, 165, null,
  147, null, 147, null, 196, null, 196, null,
  131, null, 131, null, 175, null, 175, null,
  110, null, 110, null, 196, null, 196, null,
];

const STEP = 0.135;   // seconds per eighth note
const LOOKAHEAD = 0.12;

class Sound {
  private ctx: AudioContext | null = null;
  private bus: GainNode | null = null;
  private timer = 0;
  private step = 0;
  private next = 0;
  on = false;

  /** Whether the visitor turned it on last time. Read once, at mount. */
  static remembered() {
    try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
  }

  private boot() {
    if (this.ctx) return;
    const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
    this.ctx = new Ctor();
    this.bus = this.ctx.createGain();
    this.bus.gain.value = 0.18;
    this.bus.connect(this.ctx.destination);
  }

  private voice(freq: number, at: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
    if (!this.ctx || !this.bus) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, at);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, at + dur);
    g.gain.setValueAtTime(vol, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g);
    g.connect(this.bus);
    o.start(at);
    o.stop(at + dur + 0.02);
  }

  private blip(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
    if (!this.on || !this.ctx) return;
    this.voice(freq, this.ctx.currentTime, dur, type, vol, slideTo);
  }

  jump() { this.blip(340, 0.12, 'square', 0.15, 700); }
  land() { this.blip(180, 0.06, 'triangle', 0.10, 120); }
  bump() { this.blip(160, 0.09, 'square', 0.20, 90); }
  coin() {
    this.blip(988, 0.06, 'square', 0.16);
    window.setTimeout(() => this.blip(1319, 0.15, 'square', 0.14), 58);
  }
  open() {
    [523, 659, 784, 1047].forEach((f, i) =>
      window.setTimeout(() => this.blip(f, 0.1, 'triangle', 0.16), i * 52));
  }

  /**
   * A lookahead scheduler rather than a note-per-timeout.
   *
   * setTimeout drifts by several milliseconds a call, which over a bar is
   * audible as the beat wandering. This queues every note a tenth of a second
   * ahead against the audio clock, which does not drift, and only uses the
   * timer to decide when to queue more.
   */
  start() {
    this.boot();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    this.on = true;
    try { localStorage.setItem(KEY, '1'); } catch { /* private mode */ }
    this.next = this.ctx.currentTime;
    const tick = () => {
      if (!this.on || !this.ctx) return;
      while (this.next < this.ctx.currentTime + LOOKAHEAD) {
        const i = this.step % LEAD.length;
        if (LEAD[i]) this.voice(LEAD[i]!, this.next, 0.15, 'square', 0.09);
        if (BASS[i]) this.voice(BASS[i]!, this.next, 0.2, 'triangle', 0.14);
        this.next += STEP;
        this.step += 1;
      }
      this.timer = window.setTimeout(tick, 40);
    };
    tick();
  }

  stop() {
    this.on = false;
    window.clearTimeout(this.timer);
    try { localStorage.setItem(KEY, '0'); } catch { /* private mode */ }
  }

  toggle() { this.on ? this.stop() : this.start(); return this.on; }
}

export const sound = new Sound();
export const soundRemembered = Sound.remembered;
