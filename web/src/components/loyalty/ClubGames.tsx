'use client';

import { useState } from 'react';
import { DogRace } from '@/components/games/dog-race/DogRace';
import { Roulette } from '@/components/games/roulette/Roulette';
import { Alert, ButtonLink, Card, Heading } from '@/components/ui';
import { api } from '@/lib/api/client';
import type { DogRaceDisplay, GamePlayResponse, MemberGame, RouletteDisplay } from '@/lib/api/types';
import { useClub, useMemberData } from './ClubShell';

const replayMessage = (limit: string) => (limit === 'once_per_day' ? 'Vous pourrez rejouer demain.' : 'Merci pour votre participation !');

/** Member game page: same game components as the welcome journey, server-side results. */
function GamePage({ type, title }: { type: MemberGame['type']; title: string }) {
  const { brand, refreshSummary } = useClub();
  const { state, reload } = useMemberData<MemberGame[]>('/games', { brand });
  const [result, setResult] = useState<GamePlayResponse | null>(null);
  const [round, setRound] = useState(0);
  const game = state.status === 'ready' ? state.data.find((g) => g.type === type) : undefined;

  const play = (choice?: string) =>
    api<GamePlayResponse>(`/games/${game?.slug}/play`, {
      method: 'POST',
      body: { campaign_slug: game?.campaign_slug, choice },
    });

  async function onComplete(response: GamePlayResponse) {
    setResult(response);
    await refreshSummary();
  }

  return (
    <>
      <Heading>{title}</Heading>
      {state.status === 'loading' && (
        <p role="status" className="py-8 text-center text-lg">
          Chargement du jeu…
        </p>
      )}
      {state.status === 'error' && <Alert>{state.message}</Alert>}
      {state.status === 'ready' && !game && <Alert tone="info">Ce jeu n&apos;est pas disponible pour le moment.</Alert>}
      {game && (
        <>
          <p className="text-lg">
            {game.points_hint} à gagner{game.play_limit === 'once_per_day' ? ' — une partie par jour' : ''}.
          </p>
          {!game.can_play && !result ? (
            <>
              <Alert tone="info">{game.message ?? 'Vous avez déjà joué.'}</Alert>
              <ButtonLink href="/club/gagner/" variant="secondary">
                Autres façons de gagner des points
              </ButtonLink>
            </>
          ) : (
            <Card key={round} className="w-full max-w-3xl">
              {type === 'dog_race' ? (
                <DogRace display={game.display as DogRaceDisplay} play={(choice) => play(choice)} onComplete={onComplete} />
              ) : (
                <Roulette display={game.display as RouletteDisplay} play={() => play()} onComplete={onComplete} disabledMessage={result && game.play_limit !== 'unlimited' ? replayMessage(game.play_limit) : null} />
              )}
            </Card>
          )}
          {result && (
            <div className="flex w-full max-w-3xl flex-col gap-3">
              <Alert tone={result.won ? 'success' : 'info'}>{result.message}</Alert>
              <ButtonLink
                href="/club/gagner/"
                variant="secondary"
              >
                Autres façons de gagner des points
              </ButtonLink>
              {game.play_limit === 'unlimited' && (
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => {
                    setResult(null);
                    setRound((r) => r + 1);
                    void reload();
                  }}
                >
                  Rejouer
                </button>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}

export function DogRaceGamePage() {
  return <GamePage type="dog_race" title="Course de chiens" />;
}

export function RouletteGamePage() {
  return <GamePage type="roulette" title="Roue de la chance" />;
}
