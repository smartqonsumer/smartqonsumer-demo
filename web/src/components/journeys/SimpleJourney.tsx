'use client';

import { useEffect, useRef, useState } from 'react';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { Alert, Button, ButtonLink, Card, Heading } from '@/components/ui';
import { api, errorMessage } from '@/lib/api/client';
import type { CampaignPublic, Message, RegistrationResponse } from '@/lib/api/types';
import { useSession } from '@/lib/auth/session';
import { JourneyShell, LoadingBlock } from './JourneyShell';
import { useCampaign, useScanFromUrl } from './useJourney';

/**
 * Journey #2 (QR #2): no game on arrival, the only goal is joining the loyalty club.
 * The account stays pending until the email is confirmed; points are credited then.
 * The scan is still recorded (funnel analytics) but never blocks the landing page.
 */
export function SimpleJourney({ campaignSlug }: { campaignSlug: string }) {
  const campaign = useCampaign(campaignSlug);
  useScanFromUrl(campaignSlug);
  const session = useSession();
  const [registered, setRegistered] = useState<string | null>(null);
  const legal = campaign.status === 'ready' ? campaign.data.legal_urls : undefined;

  return (
    <JourneyShell legalUrls={legal}>
      {campaign.status === 'loading' && (
        <>
          <Heading>Club fidélité</Heading>
          <LoadingBlock label="Chargement…" />
        </>
      )}
      {campaign.status === 'error' && (
        <>
          <Heading>Oups…</Heading>
          <Alert>{campaign.message}</Alert>
        </>
      )}
      {campaign.status === 'ready' &&
        (registered ? (
          <CheckEmail campaign={campaign.data} email={registered} />
        ) : session.status === 'authenticated' ? (
          <Card>
            <h2 className="font-club-title text-2xl font-bold uppercase text-club-ink">Vous êtes déjà membre 👋</h2>
            <p className="mb-4 mt-2 text-lg">Retrouvez vos points, vos jeux et vos récompenses.</p>
            <ButtonLink href="/club/" arrow>
              Accéder à mon espace
            </ButtonLink>
          </Card>
        ) : (
          <>
            <Intro campaign={campaign.data} />
            <Benefits campaign={campaign.data} />
            <Card as="section">
              <h2 className="mb-4 font-club-title text-2xl font-bold uppercase text-club-ink">Créer mon compte</h2>
              <RegistrationForm campaign={campaign.data} onRegistered={(r: RegistrationResponse) => setRegistered(r.user.email)} />
              <p className="mt-5 text-center text-base">
                Déjà membre ?{' '}
                <a className="font-semibold text-club-ink underline underline-offset-4" href="/auth/connexion/">
                  Se connecter
                </a>
              </p>
            </Card>
          </>
        ))}
    </JourneyShell>
  );
}

function Intro({ campaign }: { campaign: CampaignPublic }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-club-accent-text">{campaign.brand.name} · Club fidélité</p>
      <Heading>{campaign.texts.hero_title ?? campaign.name}</Heading>
      <p className="text-center text-lg">{campaign.texts.hero_subtitle}</p>
    </div>
  );
}

function Benefits({ campaign }: { campaign: CampaignPublic }) {
  const items = [
    campaign.registration_points > 0 && {
      icon: '🎁',
      text: `${campaign.registration_points} points de bienvenue dès la confirmation de votre email`,
    },
    { icon: '🐕', text: 'Des jeux pour gagner encore plus de points' },
    { icon: '🏷️', text: 'Des codes promo à débloquer avec vos points' },
  ].filter(Boolean) as { icon: string; text: string }[];
  return (
    <ul className="grid gap-3" aria-label="Les avantages du club">
      {items.map((item) => (
        <li key={item.text} className="flex items-center gap-4 rounded-club-md border border-club-border bg-club-surface p-4 shadow-sm">
          <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-club-accent-soft text-2xl">
            {item.icon}
          </span>
          <span className="text-lg font-semibold text-club-ink">{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

function CheckEmail({ campaign, email }: { campaign: CampaignPublic; email: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => ref.current?.focus(), []);

  async function resend() {
    setLoading(true);
    try {
      const res = await api<Message>('/auth/resend-verification', { method: 'POST', body: { email } });
      setStatus({ tone: 'success', text: res.message });
    } catch (e) {
      setStatus({ tone: 'error', text: errorMessage(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={ref} tabIndex={-1} className="flex flex-col gap-5 outline-none">
      <Heading>{campaign.texts.verify_title ?? 'Vérifiez votre boîte mail'}</Heading>
      <p className="text-lg">
        {campaign.texts.verify_text ?? 'Nous vous avons envoyé un lien de confirmation.'} Il a été envoyé à <strong>{email}</strong>.
      </p>
      <p className="text-base text-club-muted">
        Votre compte sera actif dès que vous aurez cliqué sur le lien
        {campaign.registration_points > 0 && <> — et vos {campaign.registration_points} points de bienvenue seront crédités</>}.
      </p>
      {status && <Alert tone={status.tone}>{status.text}</Alert>}
      <Button variant="secondary" onClick={resend} loading={loading}>
        Renvoyer l&apos;email
      </Button>
    </div>
  );
}
