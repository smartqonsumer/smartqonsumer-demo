'use client';

import { useEffect, useRef, useState } from 'react';
import { Alert, Button, focusRing } from '@/components/ui';
import { errorMessage } from '@/lib/api/client';
import type { DogRaceDisplay, DogRaceOutcome, GamePlayResponse } from '@/lib/api/types';
import { Bowl, Dog } from './Dog';
import styles from './DogRace.module.css';
import { RACE_DURATION_MS, buildRacePlan, obstaclePositions } from './plan';

type Phase = 'choose' | 'preparing' | 'racing' | 'eating' | 'done';

const DEFAULT_COATS = ['#C98B4B', '#3B2A20'];
const EATING_MS = 1800;

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Reusable dog race. The parent passes `play`, which calls the API: the server decides
 * the winner, this component only replays the outcome (and still works, without motion,
 * when the user prefers reduced motion).
 */
export function DogRace({
  display,
  play,
  onComplete,
}: {
  display: DogRaceDisplay;
  play: (choice: string) => Promise<GamePlayResponse>;
  onComplete: (result: GamePlayResponse) => void;
}) {
  const dogs = display.dogs.map((d, i) => ({ ...d, coat: d.coat ?? DEFAULT_COATS[i % 2]! }));
  const [choice, setChoice] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('choose');
  const [countdown, setCountdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GamePlayResponse | null>(null);
  const [announce, setAnnounce] = useState('');
  const trackRef = useRef<HTMLDivElement>(null);
  const runners = useRef<Record<string, HTMLDivElement | null>>({});
  const mounted = useRef(true);

  useEffect(() => {
    // Reset on (re)mount: React strict mode mounts, unmounts and mounts again in dev.
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const outcome = result?.outcome as DogRaceOutcome | undefined;
  const winner = dogs.find((d) => d.id === outcome?.winner_dog);
  const hurdles = obstaclePositions(outcome?.obstacles ?? 3);

  async function start() {
    if (!choice) return;
    setError(null);
    setPhase('preparing');
    setAnnounce('Préparation de la course…');
    const reduced = prefersReducedMotion();
    let response: GamePlayResponse;
    try {
      const countdownSteps = reduced
        ? Promise.resolve()
        : (async () => {
            for (const step of ['3', '2', '1', 'Partez !']) {
              if (!mounted.current) return;
              setCountdown(step);
              await wait(step === 'Partez !' ? 350 : 500);
            }
          })();
      [response] = await Promise.all([play(choice), countdownSteps]);
    } catch (e) {
      setCountdown(null);
      setPhase('choose');
      setError(errorMessage(e));
      return;
    }
    if (!mounted.current) return;
    setCountdown(null);
    setResult(response);
    await race(response, reduced);
  }

  async function race(response: GamePlayResponse, reduced: boolean) {
    const raceOutcome = response.outcome as DogRaceOutcome;
    const plans = buildRacePlan(raceOutcome, dogs.map((d) => d.id));
    const winnerName = dogs.find((d) => d.id === raceOutcome.winner_dog)?.name ?? '';
    const track = trackRef.current;
    const width = track?.clientWidth ?? 0;

    const transformsFor = (id: string) => {
      const el = runners.current[id];
      const plan = plans.find((p) => p.id === id);
      if (!el || !plan) return null;
      const distance = Math.max(width - el.clientWidth, 0);
      const height = el.clientHeight;
      return {
        el,
        frames: plan.keyframes.map((k) => ({
          offset: k.offset,
          transform: `translate(${k.x * distance}px, ${k.y * height}px) rotate(${k.rotate}deg)`,
        })),
      };
    };

    if (reduced || typeof Element === 'undefined' || !('animate' in Element.prototype)) {
      for (const dog of dogs) {
        const t = transformsFor(dog.id);
        if (t) t.el.style.transform = t.frames[t.frames.length - 1]!.transform;
      }
    } else {
      setPhase('racing');
      setAnnounce('La course commence !');
      const animations = dogs
        .map((dog) => transformsFor(dog.id))
        .filter((t): t is NonNullable<typeof t> => t !== null)
        .map((t) => t.el.animate(t.frames, { duration: RACE_DURATION_MS, fill: 'forwards', easing: 'linear' }));
      await Promise.all(animations.map((a) => a.finished.catch(() => undefined)));
      if (!mounted.current) return;
      setPhase('eating');
      setAnnounce(`${winnerName} remporte la course et dévore ses croquettes !`);
      await wait(EATING_MS);
      if (!mounted.current) return;
    }
    setPhase('done');
    setAnnounce(
      `${winnerName} remporte la course ! ${response.won ? 'Votre chien a gagné.' : "Votre chien n'a pas gagné cette fois."}`,
    );
    onComplete(response);
  }

  const running = phase === 'racing';

  return (
    <div className="flex flex-col gap-5">
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      {phase === 'choose' && (
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-3 font-club-title text-2xl font-bold uppercase text-club-ink">Choisissez votre chien</legend>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            {dogs.map((dog, index) => (
              <div key={dog.id} className={index === 1 ? 'order-3' : 'order-1'}>
                <button
                  type="button"
                  aria-pressed={choice === dog.id}
                  onClick={() => setChoice(dog.id)}
                  className={`flex w-full flex-col items-center gap-2 rounded-club-lg border-[3px] bg-club-surface p-3 transition-transform active:scale-95 motion-reduce:transition-none ${
                    choice === dog.id ? 'border-club-primary shadow-lg' : 'border-club-border'
                  } ${focusRing}`}
                >
                  <span className="w-full max-w-[140px]">
                    <Dog coat={dog.coat} />
                  </span>
                  <span className="font-club-title text-xl font-bold uppercase text-club-ink">{dog.name}</span>
                  <span className={`text-sm font-semibold ${choice === dog.id ? 'text-club-primary' : 'text-club-muted'}`}>
                    {choice === dog.id ? '✓ Mon champion' : 'Choisir'}
                  </span>
                </button>
              </div>
            ))}
            <span aria-hidden="true" className="order-2 font-club-title text-3xl font-extrabold italic text-club-primary">
              VS
            </span>
          </div>
          {error && <Alert>{error}</Alert>}
          <Button onClick={start} disabled={!choice}>
            {choice ? `Lancer la course avec ${dogs.find((d) => d.id === choice)?.name}` : 'Choisissez un chien'}
          </Button>
        </fieldset>
      )}

      {phase !== 'choose' && (
        <div className="relative" aria-hidden="true">
          <div className="flex flex-col gap-2 rounded-club-lg bg-club-ink p-2">
            {dogs.map((dog) => {
              const isWinner = winner?.id === dog.id;
              const eating = isWinner && (phase === 'eating' || phase === 'done');
              return (
                <div key={dog.id} className={`${styles.track} relative flex h-24 items-end overflow-hidden rounded-club-md sm:h-28`}>
                  <span className="absolute left-2 top-1 z-10 rounded-full bg-club-ink/70 px-2 text-xs font-bold uppercase text-white">
                    {dog.name}
                    {dog.id === choice ? ' · vous' : ''}
                  </span>
                  <div ref={trackRef} className="relative h-full flex-1">
                    {hurdles.map((h) => (
                      <span
                        key={h}
                        className={`${styles.hurdle} absolute bottom-2 h-7 w-2 rounded-sm`}
                        style={{ left: `calc(${h * 100}% - 4px)` }}
                      />
                    ))}
                    <div
                      ref={(el) => {
                        runners.current[dog.id] = el;
                      }}
                      className={`${styles.runner} absolute bottom-1 left-0 w-[22%] max-w-[110px]`}
                    >
                      <Dog coat={dog.coat} running={running} eating={eating} />
                    </div>
                  </div>
                  <span className={`${styles.finish} h-full w-3 shrink-0`} />
                  <div className={`w-[14%] max-w-[70px] shrink-0 px-1 pb-2 ${eating ? styles.emptying : ''}`}>
                    <Bowl />
                  </div>
                </div>
              );
            })}
          </div>
          {countdown && (
            <div className="absolute inset-0 grid place-items-center rounded-club-lg bg-club-ink/60">
              <span key={countdown} className={`${styles.confetti} font-club-title text-6xl font-extrabold uppercase text-white`}>
                {countdown}
              </span>
            </div>
          )}
          {phase === 'preparing' && !countdown && (
            <div className="absolute inset-0 grid place-items-center rounded-club-lg bg-club-ink/60 text-xl font-bold text-white">
              Préparation de la course…
            </div>
          )}
        </div>
      )}

      {phase === 'preparing' && <p className="text-center text-lg font-semibold text-club-ink">Préparation de la course…</p>}
      {(phase === 'eating' || phase === 'done') && winner && (
        <p className={`${styles.confetti} text-center font-club-title text-3xl font-extrabold uppercase text-club-ink`}>
          🏆 {winner.name} gagne la course !
        </p>
      )}
    </div>
  );
}
