import { describe, expect, it } from 'vitest';
import { buildRacePlan, obstaclePositions } from '@/components/games/dog-race/plan';
import { wheelRotationFor } from '@/components/games/roulette/wheel';

const outcome = { chosen_dog: 'filou', winner_dog: 'filou', stumbles: { praline: 1 }, obstacles: 3 };

describe('dog race plan (replays the server result)', () => {
  const plans = buildRacePlan(outcome, ['filou', 'praline']);
  const byId = Object.fromEntries(plans.map((p) => [p.id, p]));

  it('makes the server-designated winner cross the line first', () => {
    const winner = byId.filou!;
    const loser = byId.praline!;
    const winnerFinish = winner.keyframes.find((k) => k.x >= 1)!.offset;
    expect(winnerFinish).toBeLessThan(1);
    expect(loser.keyframes.every((k) => k.x < 1)).toBe(true);
  });

  it('works whichever dog the server picks', () => {
    const other = buildRacePlan({ ...outcome, winner_dog: 'praline', stumbles: { filou: 0 } }, ['filou', 'praline']);
    expect(other.find((p) => p.id === 'praline')!.keyframes.at(-1)!.x).toBe(1);
    expect(other.find((p) => p.id === 'filou')!.keyframes.at(-1)!.x).toBeLessThan(1);
  });

  it('produces valid Web Animations keyframes', () => {
    for (const plan of plans) {
      const offsets = plan.keyframes.map((k) => k.offset);
      expect(offsets[0]).toBe(0);
      expect(offsets.at(-1)).toBe(1);
      expect([...offsets].sort((a, b) => a - b)).toEqual(offsets);
      expect(new Set(offsets).size).toBe(offsets.length);
    }
  });

  it('spreads hurdles evenly', () => {
    expect(obstaclePositions(3)).toEqual([0.25, 0.5, 0.75]);
  });
});

describe('wheel rotation', () => {
  it('stops the drawn segment under the top pointer', () => {
    for (let index = 0; index < 4; index++) {
      const rotation = wheelRotationFor(0, index, 4);
      const centre = (index + 0.5) * 90;
      expect((((centre + rotation) % 360) + 360) % 360).toBeCloseTo(0);
    }
  });

  it('always spins forward from the current angle', () => {
    expect(wheelRotationFor(2295, 2, 4)).toBeGreaterThan(2295);
    expect(wheelRotationFor(0, 0, 4, 0)).toBeGreaterThan(0);
  });
});
