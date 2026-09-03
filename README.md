# Sourav Dey — **The Reel** (v3)

Your career as a film you scrub through. A different structure from v1 and v2,
not a re-skin: the navigation is an edit timeline, the sections are scenes, and
the loader is a slate.

Sits beside `nova-react/` (v1) and `nova-react-v2/` (v2). Nothing is shared —
run all three, keep whichever earns it.

Stack: React 19 · TypeScript · Vite · Tailwind v4 · GSAP · Lenis · React Bits.
Every word of copy still comes verbatim from the original `index.html`.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

Node 20.19+ or 22.12+. To run alongside the others: `npm run dev -- --port 5175`.

---

## The idea

Nine scenes, in order:

```
SC 00  Titles      your name, interactive
SC 01  2019        Graphics Designer · ProjectPie
SC 02  2021        Web Designer · Zolute
SC 03  2022        Sr. Motion Graphics & GEN-AI Expert · Pocket FM
SC 04  2025        Sr. Motion Graphics Designer · Ginger Monkey
SC 05  2025        Creative Director, Scaling Romantasy US · Pocket FM
SC 06  2026        Gen AI Production Lead, E&R · Pocket FM
SC 07  The Reel    34 work samples running as a strip
SC 08  Toolkit     skills, tools, disciplines
SC 09  End Card    credits and contact
```

The six role chapters run oldest to newest — the actual arc, designer to
creative director to Gen AI lead — so the story tells itself in sequence rather
than needing narration.

## The signature interaction

The bottom bar is an **edit timeline**, not a nav bar. Chapter segments are
proportional to their real scroll length, the playhead tracks position, the
timecode runs at 24fps against a 4:12 runtime, and the whole bar is draggable.

That single control serves both modes you asked for: scroll and it plays as a
guided film; grab the playhead or click a chapter label and you're free-roaming.
Arrow keys step chapters when the bar has focus.

## The loader

A clapperboard. Production, roll, scene, take, director, format stamp in one at
a time, the stick snaps, the frame flashes white and cuts into the film. Around
1.6s, any click or key cuts early, and a session flag skips it on the next visit.

---

## Why it can't break its own layout

You asked for interactions that don't disturb the page. This is architectural,
not careful CSS.

The **entire film is one track with one sticky stage**. Chapters are `absolute
inset-0` frames inside that stage, cross-fading on global progress. They are
never in document flow, so nothing they do — a card swapping, a strip
translating, a player opening, a chapter mounting — can change the geometry of
anything else. The stage is exactly one viewport, always.

Verified: the timeline bar position, stage height and document height are
byte-identical before hovering, after hovering, with the player open, and after
closing it.

This also fixes what went wrong in v2, where each section pinned itself and the
handoffs left blank viewports and colliding text.

```
src/film/
  chapters.ts      the nine scenes, lengths, timecode maths
  FilmContext.tsx  owns scroll position; seek() and goToChapter()
  Film.tsx         the track + the single sticky stage
  Timeline.tsx     the scrubbable edit bar
  Slate.tsx        the clapperboard
  PressureName.tsx per-character proximity type
  shots/           TitleShot, RoleShot, ReelShot, ToolkitShot, EndShot
```

---

## The cursor

There isn't one. Two custom cursors were built and both were wrong — a
crosshair, then a labelled lens iris. The native pointer is what people expect
and it never gets in the way of the work. Removed rather than iterated on again.

## Backgrounds

Nine looks, swappable live from the layers button in the timeline bar. The
choice persists in `localStorage`, and each preset is lazy-loaded, so only the
selected one ever runs a WebGL context.

| Preset | Feel |
|---|---|
| Projector | Warm beams from above with drifting bokeh (the original) |
| Film stock | Slow warm gradient under live grain — the most filmic |
| Nightfall | Deep amber aurora, slow and wide |
| Ribbons | Aurora bands, cooler and more graphic |
| **Strands** | Fine gold lines that part around the cursor — flows with the type |
| Ferrofluid | Heavy liquid metal, the most dramatic |
| Contour | Topographic lines, quiet and architectural |
| Chrome | Slow reflective flow |
| Off | Flat black — lets the type carry it alone |

Each preset declares its own `scrim` — the amount of black laid over it. One
shared value doesn't work: the busy looks need taming so type stays readable,
and the already-dark ones get crushed to nothing by the same amount.

Once you've picked, set the default in `App.tsx`'s `savedPreset` fallback and
delete `BackgroundPicker.tsx` — it's a chooser, not a permanent feature.

## React Bits in use

`CardSwap` — three discipline cards dealing in 3D in the toolkit.
`LightRays` + `Particles` — the projector-beam background. `Magnet` — buttons
that lean toward the cursor. `ShinyText`, `LogoLoop`, `AnimatedContent`,
`SpotlightCard`, `GradualBlur`.

### Thumbnails

Only the 22 AI Ads & Motion clips ship a local still named after the video id.
The six Creative Direction entries never had one, so `/assets/{id}.jpg` 404s and
Chrome paints a broken-image glyph. Your original site walked YouTube's CDN when
that happened; the chain was lost in the port and is restored in `Poster.tsx`:

```
posterUrl → /assets/{id}.jpg → i.ytimg maxres → i.ytimg hq → composed placeholder
```

Nothing can render a broken icon now — the last step is a styled card, not a
failure. Case-study thumbnails go through the same component.

### One deliberate substitution

The title uses a local `PressureName`, not React Bits' `TextPressure`.
TextPressure sizes glyphs from the metrics of a remote variable font and lays
them edge-to-edge; when that font is slow, blocked, or swapped for a wider
fallback, the headline overflows its box. I hit exactly that while building.
`PressureName` keeps the effect — characters thicken and stretch toward the
cursor — using the already-loaded Inter and pure transforms, so it can't reflow
and can't overflow. Same interaction, no dependency on a network race.

Unused components were removed rather than left in the tree; re-add any of the
171 from `reactbits.dev` freely.

---

## Known limits

- The film assumes a real viewport height; very short windows compress scenes.
- `prefers-reduced-motion` disables Lenis and the film falls back to native scroll.
- The reel is a horizontal strip, not the 3D `FlyingPosters` carousel — that one
  needs WebGL textures per poster and was a bigger risk than it was worth on a
  first pass. Say the word and I'll swap it in.
- YouTube wasn't reachable from the build sandbox. If a clip won't play, the
  lightbox's **Open original** link tells you whether that upload has embedding
  disabled.
