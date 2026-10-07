/**
 * Turns the race result decided by the server into an animation plan. Pure and
 * deterministic: the browser never decides anything, it only replays the outcome.
 *
 * Positions are fractions of the track (0 = start, 1 = finish line), times are
 * fractions of the race duration.
 */
import type { DogRaceOutcome } from '@/lib/api/types';

export type Keyframe = { offset: number; x: number; y: number; rotate: number };

export type DogPlan = { id: string; finishOffset: number; keyframes: Keyframe[] };

export const RACE_DURATION_MS = 4600;
const HOP = 0.035; // half-duration of a hop over a hurdle
const STUMBLE = 0.14; // time lost by the dog tripping on a hurdle

export function obstaclePositions(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i + 1) / (count + 1));
}

/** Piecewise-linear schedule [time, position] → time at which a position is reached. */
function timeAt(schedule: [number, number][], x: number): number {
  for (let i = 1; i < schedule.length; i++) {
    const [t0, x0] = schedule[i - 1]!;
    const [t1, x1] = schedule[i]!;
    if (x <= x1 && x1 > x0) return t0 + ((x - x0) / (x1 - x0)) * (t1 - t0);
  }
  return schedule[schedule.length - 1]![0];
}

function positionAt(schedule: [number, number][], t: number): number {
  for (let i = 1; i < schedule.length; i++) {
    const [t0, x0] = schedule[i - 1]!;
    const [t1, x1] = schedule[i]!;
    if (t <= t1) return t1 === t0 ? x1 : x0 + ((t - t0) / (t1 - t0)) * (x1 - x0);
  }
  return schedule[schedule.length - 1]![1];
}

function scheduleFor(isWinner: boolean, stumbleAt: number | undefined): [number, number][] {
  if (isWinner) {
    // Steady, slightly accelerating run; crosses the line at 84 % of the race.
    return [
      [0, 0],
      [0.3, 0.33],
      [0.6, 0.66],
      [0.84, 1],
      [1, 1],
    ];
  }
  if (stumbleAt === undefined) {
    return [
      [0, 0],
      [0.35, 0.36],
      [0.7, 0.7],
      [1, 0.93],
    ];
  }
  // Runs neck and neck, trips just before a hurdle, loses time, then chases.
  const before = stumbleAt - 0.04;
  const tTrip = 0.84 * before + 0.02;
  return [
    [0, 0],
    [tTrip, before],
    [tTrip + STUMBLE, before],
    [1, 0.9],
  ];
}

export function buildRacePlan(outcome: DogRaceOutcome, dogIds: string[]): DogPlan[] {
  const hurdles = obstaclePositions(outcome.obstacles);
  return dogIds.map((id) => {
    const isWinner = id === outcome.winner_dog;
    const stumbleIndex = isWinner ? undefined : outcome.stumbles[id];
    const stumbleX = stumbleIndex === undefined ? undefined : hurdles[stumbleIndex];
    const schedule = scheduleFor(isWinner, stumbleX);

    const frames = new Map<number, Keyframe>();
    const put = (offset: number, y = 0, rotate = 0) => {
      const o = Math.min(Math.max(Number(offset.toFixed(4)), 0), 1);
      frames.set(o, { offset: o, x: positionAt(schedule, o), y, rotate });
    };
    for (const [t] of schedule) put(t);

    hurdles.forEach((h, index) => {
      if (index === stumbleIndex) {
        const tTrip = schedule[1]![0];
        put(tTrip + 0.01, -0.15, -18);
        put(tTrip + STUMBLE * 0.5, 0, 8);
        put(tTrip + STUMBLE - 0.01, 0, 0);
        return;
      }
      const t = timeAt(schedule, h);
      if (t >= 1) return;
      put(t - HOP, 0, 0);
      put(t, -0.55, -8);
      put(t + HOP, 0, 0);
    });

    const keyframes = [...frames.values()].sort((a, b) => a.offset - b.offset);
    return { id, finishOffset: isWinner ? schedule[3]![0] : 1, keyframes };
  });
}
