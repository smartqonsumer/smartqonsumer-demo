/**
 * Rotation (deg, clockwise, cumulative) that brings segment `index` under the pointer at
 * the top. Segments are drawn clockwise from the top, segment i spanning
 * [i·size, (i+1)·size]. `turns` full turns are added for the spin effect.
 */
export function wheelRotationFor(current: number, index: number, count: number, turns = 6): number {
  const size = 360 / count;
  const target = (360 - (index + 0.5) * size) % 360;
  const base = current - (((current % 360) + 360) % 360);
  let next = base + turns * 360 + target;
  if (next <= current) next += 360;
  return next;
}
