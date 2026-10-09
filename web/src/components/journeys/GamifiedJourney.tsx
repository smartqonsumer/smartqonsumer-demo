'use client';

import { useEffect, useRef, useState } from 'react';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { DogRace } from '@/components/games/dog-race/DogRace';
import { EarnPreview } from '@/components/loyalty/EarnPreview';
import { Alert, ButtonLink, Card, Heading, PointsBadge } from '@/components/ui';
import { ApiError, api } from '@/lib/api/client';
import type { CampaignPublic, DogRaceDisplay, GamePlayResponse, RegistrationResponse } from '@/lib/api/types';
import { useSession } from '@/lib/auth/session';
import { JourneyShell, LoadingBlock } from './JourneyShell';
import { useCampaign, useScanFromUrl } from './useJourney';

type Step =
  | { name: 'race' }
  | { name: 'won'; result: GamePlayResponse }
  | { name: 'lost'; result: GamePlayResponse }
  | { name: 'confirmed'; points: number; rewardTitle: string | null; loggedIn: boolean };

/** Journey #1 (QR #1): scan → dog race → win → light registration → club. */
export function GamifiedJourney({ campaignSlug }: { campaignSlug: string }) {
  const campaign = useCampaign(campaignSlug);
  const scan = useScanFromUrl(campaignSlug);
  const legal = campaign.status === 'ready' ? campaign.data.legal_urls : undefined;

  return (
    <JourneyShell legalUrls={legal}>
      {campaign.status === 'error' || scan.status === 'error' ? (
        <>
          <Heading>Oups…</Heading>
          <Alert>{campaign.status === 'error' ? campaign.message : scan.status === 'error' ? scan.message : ''}</Alert>
          <ButtonLink href="/qr/" variant="secondary">
            Revenir aux QR codes
          </ButtonLink>
        </>
      ) : campaign.status === 'loading' || scan.status === 'loading' ? (
        <>
          <Heading>La Grande Course</Heading>
          <LoadingBlock label="Vérification de votre QR Code…" />
        </>
      ) : scan.status === 'none' ? (
        <NoScan campaign={campaign.data} />
      ) : !scan.scan.eligible ? (
        <NotEligible campaign={campaign.data} message={scan.scan.message} onBypass={scan.scan.bypass_available ? scan.bypass : undefined} />
      ) : (
        <Game campaign={campaign.data} scanId={scan.scan.scan_id} />
      )}
    </JourneyShell>
  );
}

function NoScan({ campaign }: { campaign: CampaignPublic }) {
  return (
    <>
      <Heading>{campaign.texts.hero_title ?? campaign.name}</Heading>
      <p className="text-center text-lg">Pour participer, scannez le QR Code imprimé sur votre paquet de croquettes.</p>
      <ButtonLink href="/qr/" arrow>
        Voir les QR codes de démonstration
      </ButtonLink>
    </>
  );
}

function NotEligible({ campaign, message, onBypass }: { campaign: CampaignPublic; message: string; onBypass?: () => void }) {
  return (
    <>
      <Heading>{campaign.texts.hero_title ?? campaign.name}</Heading>
      <Alert tone="info">{message}</Alert>
      <p className="text-center text-lg">Retrouvez vos points, vos jeux et vos récompenses dans votre espace fidélité.</p>
      <ButtonLink href="/club/" arrow>
        Accéder à mon club
      </ButtonLink>
      {onBypass && (
        <button type="button" onClick={onBypass} className="self-center text-sm text-club-muted underline underline-offset-4 hover:text-club-ink">
          Rejouer quand même (démo)
        </button>
      )}
    </>
  );
}

const resultKey = (scanId: string) => `sq_race_${scanId}`;

function savedResult(scanId: string): GamePlayResponse | null {
  try {
    const raw = window.sessionStorage.getItem(resultKey(scanId));
    return raw ? (JSON.parse(raw) as GamePlayResponse) : null;
  } catch {
    return null;
  }
}

function stepFor(result: GamePlayResponse): Step {
  if (!result.won) return { name: 'lost', result };
  if (!result.pending_claim) return { name: 'confirmed', points: result.points_awarded, rewardTitle: result.reward_title, loggedIn: true };
  return { name: 'won', result };
}

function Game({ campaign, scanId }: { campaign: CampaignPublic; scanId: string }) {
  const session = useSession();
  const [step, setStep] = useState<Step>({ name: 'race' });

  // The race is played once per scan: after a reload, resume at its result screen.
  useEffect(() => {
    const previous = savedResult(scanId);
    if (previous) setStep(stepFor(previous));
  }, [scanId]);
  const topRef = useRef<HTMLDivElement>(null);
  const game = campaign.games.find((g) => g.type === 'dog_race');
  const texts = campaign.texts;

  useEffect(() => {
    if (step.name !== 'race') topRef.current?.focus();
  }, [step.name]);

  if (!game) return <Alert>Ce jeu n&apos;est pas disponible pour le moment.</Alert>;

  const play = async (choice: string) => {
    const result = await api<GamePlayResponse>('/games/dog-race/play', {
      method: 'POST',
      anon: true,
      body: { campaign_slug: campaign.slug, scan_id: scanId, choice },
    });
    try {
      window.sessionStorage.setItem(resultKey(scanId), JSON.stringify(result));
    } catch {
      // storage unavailable: the result screen still follows the animation
    }
    return result;
  };

  function onRaceComplete(result: GamePlayResponse) {
    // Give the winner a moment to enjoy the kibbles before the next screen.
    setTimeout(() => setStep(stepFor(result)), 900);
  }

  function onRegistered(result: RegistrationResponse) {
    if (result.logged_in) void session.refresh();
    try {
      window.sessionStorage.removeItem(resultKey(scanId));
    } catch {
      // ignore
    }
    setStep({ name: 'confirmed', points: result.points_awarded, rewardTitle: result.reward_title, loggedIn: result.logged_in });
  }

  return (
    <div ref={topRef} tabIndex={-1} className="flex flex-col gap-6 outline-none">
      {step.name === 'race' && (
        <>
          <div>
            <Heading>{texts.hero_title ?? campaign.name}</Heading>
            <p className="mt-4 text-center text-lg">{texts.hero_subtitle}</p>
          </div>
          <Card>
            <DogRace display={game.display as DogRaceDisplay} play={play} onComplete={onRaceComplete} />
          </Card>
        </>
      )}

      {step.name === 'won' && (
        <>
          <div className="rounded-club-lg bg-club-primary p-6 text-center text-white">
            <Heading className="!text-white">{texts.win_title ?? 'Bravo ! 🎉'}</Heading>
            <p className="mt-3 text-lg text-white/90">{texts.win_text ?? 'Votre cadeau vous attend.'}</p>
          </div>
          <Card as="section">
            <h2 className="mb-1 font-club-title text-2xl font-bold uppercase text-club-ink">Recevez votre cadeau</h2>
            <p className="mb-5 text-base text-club-muted">
              Créez votre compte fidélité en 30 secondes
              {campaign.registration_points > 0 && <> et gagnez {campaign.registration_points} points</>}.
            </p>
            <RegistrationForm campaign={campaign} gameSessionId={step.result.game_session_id} submitLabel="Recevoir mon cadeau" onRegistered={onRegistered} />
            <AlreadyMember sessionId={step.result.game_session_id} onClaimed={(points, rewardTitle) => setStep({ name: 'confirmed', points, rewardTitle, loggedIn: true })} />
          </Card>
        </>
      )}

      {step.name === 'lost' && (
        <>
          <Heading>{texts.lose_title ?? 'Pas cette fois…'}</Heading>
          <p className="text-center text-lg">{texts.lose_text}</p>
          <ButtonLink href="/club-croquin-simple/" arrow>
            Rejoindre le club
          </ButtonLink>
        </>
      )}

      {step.name === 'confirmed' && (
        <>
          <div className="rounded-club-lg border border-club-accent/40 bg-club-accent-soft p-6 text-center">
            <Heading>{texts.confirmation_title ?? "C'est enregistré !"}</Heading>
            <p className="mt-3 text-lg text-club-ink">{texts.confirmation_text}</p>
            {step.rewardTitle && (
              <p className="mt-4 text-lg font-semibold text-club-ink">
                🎁 Votre cadeau « {step.rewardTitle} » vous attend dans « Mes récompenses ».
              </p>
            )}
            {step.points > 0 && (
              <p className="mt-4 flex flex-wrap items-center justify-center gap-2 text-lg font-semibold text-club-ink">
                Vous avez également gagné <PointsBadge points={step.points} /> SmartQonsumer.
              </p>
            )}
            <p className="mt-4 text-sm text-club-muted">Un email de confirmation vous a été envoyé.</p>
          </div>
          {step.loggedIn ? <EarnPreview /> : null}
          <ButtonLink href="/club/" arrow>
            Accéder à mon club
          </ButtonLink>
        </>
      )}
    </div>
  );
}

function AlreadyMember({ sessionId, onClaimed }: { sessionId: string; onClaimed: (points: number, rewardTitle: string | null) => void }) {
  const session = useSession();
  const [error, setError] = useState<string | null>(null);
  if (session.status !== 'authenticated') {
    return (
      <p className="mt-5 text-center text-base">
        Déjà membre ?{' '}
        <a
          className="font-semibold text-club-ink underline underline-offset-4"
          href={`/auth/connexion/?next=${encodeURIComponent(`/club-croquin/reclamer/?session=${sessionId}`)}`}
        >
          Connectez-vous pour récupérer votre cadeau
        </a>
      </p>
    );
  }
  async function claim() {
    try {
      const res = await api<{ points_awarded: number; reward_title: string | null }>(`/games/sessions/${sessionId}/claim`, { method: 'POST', anon: true });
      onClaimed(res.points_awarded, res.reward_title);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Une erreur est survenue. Veuillez réessayer.');
    }
  }
  return (
    <div className="mt-5 flex flex-col gap-3">
      <button type="button" onClick={claim} className="text-base font-semibold text-club-ink underline underline-offset-4">
        Vous êtes connecté : ajouter le cadeau à mon compte
      </button>
      {error && <Alert>{error}</Alert>}
    </div>
  );
}
