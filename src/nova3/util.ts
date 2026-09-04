/**
 * Plain helpers, kept out of parts.tsx so that file exports only a component
 * and Fast Refresh can hot-swap it.
 */

/**
 * Staggered delay for the nth item, capped so long lists stay brisk. With
 * twenty-nine tiles a linear ramp leaves the last one waiting a second and a
 * half, which stops reading as choreography and starts reading as lag.
 */
export const step = (base: number, i: number, gap = 0.035, cap = 0.42) =>
  base + Math.min(i * gap, cap);

/**
 * How a workflow is billed.
 *
 * Every one is Pocket FM work; three ran on a named internal tool and two did
 * not. The first pass put whichever string existed into the same slot, so
 * three cards read "Mosaic 2.0" and two read "Pocket FM" — the client and the
 * tool wearing the same badge, which makes the set look mismatched even though
 * the data is fine. The client always comes first now, and the tool is
 * appended only when there is one.
 */
export function label(p: { client?: string; tool?: string }) {
  return [p.client, p.tool].filter(Boolean).join(' · ');
}

/**
 * The room's gel, as an rgba you can put in a spotlight.
 *
 * A white spotlight on a dark card is a light being switched on. The same
 * white on paper is nothing at all — you cannot get brighter than the page. So
 * on light the hover glow is the room's own colour instead, which reads as a
 * gel sliding across rather than as a lamp.
 */
export type Rgba = `rgba(${number}, ${number}, ${number}, ${number})`;
export const glow = (hex: string, a: number): Rgba => {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
