'use client';

import Link from 'next/link';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Alert, ButtonLink, Card, Heading, ProgressBar, focusRing } from '@/components/ui';
import type { EarningActions, PointTransaction } from '@/lib/api/types';
import { useSession } from '@/lib/auth/session';
import { useClub, useMemberData } from './ClubShell';
import { EarnPreview } from './EarnPreview';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

function Skeleton({ label }: { label: string }) {
  return (
    <p role="status" className="py-8 text-center text-lg text-club-muted">
      {label}
    </p>
  );
}

export function BalanceCard() {
  const { summary } = useClub();
  if (!summary) return <Skeleton label="Chargement de votre solde…" />;
  const next = summary.next_reward;
  return (
    <Card className="!bg-club-ink text-white">
      <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Mon solde</p>
      <p className="font-club-title text-6xl font-extrabold leading-none">
        {summary.balance}
        <span className="ml-2 text-2xl">points</span>
      </p>
      {next ? (
        <div className="mt-4 flex flex-col gap-2">
          <ProgressBar value={next.progress} label={`Progression vers « ${next.title} »`} />
          <p className="text-base text-white/90">
            Plus que <strong>{next.missing_points} points</strong> avant votre prochaine récompense : {next.title}.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-base text-white/90">Vous pouvez débloquer toutes les récompenses du catalogue 🎉</p>
      )}
    </Card>
  );
}

export function ClubHome() {
  const session = useSession();
  const user = session.status === 'authenticated' ? session.user : null;
  return (
    <>
      <Heading>Bonjour{user?.first_name ? ` ${user.first_name}` : ''} 👋</Heading>
      {user && !user.email_verified && (
        <Alert tone="info">Pensez à confirmer votre adresse email grâce au lien que nous vous avons envoyé.</Alert>
      )}
      <BalanceCard />
      <ButtonLink href="/club/recompenses/">Voir les récompenses</ButtonLink>
      {user && <EarnPreview />}
    </>
  );
}

export function PointsPage() {
  const { brand } = useClub();
  const { state } = useMemberData<PointTransaction[]>('/loyalty/transactions', { brand });
  return (
    <>
      <Heading>Mes points</Heading>
      <BalanceCard />
      <section aria-labelledby="history" className="flex flex-col gap-3">
        <h2 id="history" className="font-club-title text-2xl font-bold uppercase text-club-ink">
          Historique
        </h2>
        {state.status === 'loading' && <Skeleton label="Chargement de l'historique…" />}
        {state.status === 'error' && <Alert>{state.message}</Alert>}
        {state.status === 'ready' && state.data.length === 0 && (
          <Card>
            <p className="text-lg">Aucun point pour le moment.</p>
            <Link href="/club/gagner/" className="mt-2 inline-block font-semibold text-club-ink underline">
              Découvrir comment gagner des points
            </Link>
          </Card>
        )}
        {state.status === 'ready' && state.data.length > 0 && (
          <ul className="flex flex-col divide-y divide-club-border rounded-club-lg border border-club-border bg-club-surface">
            {state.data.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-club-ink">{t.description}</p>
                  <p className="text-sm text-club-muted">{dateFormat.format(new Date(t.created_at))}</p>
                </div>
                <span className={`font-club-title text-2xl font-extrabold ${t.amount > 0 ? 'text-club-accent-text' : 'text-club-primary'}`}>
                  {t.amount > 0 ? `+${t.amount}` : t.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export function EarnPage() {
  const { brand } = useClub();
  const { state, reload } = useMemberData<EarningActions>('/loyalty/earning-actions', { brand });
  return (
    <>
      <Heading>Gagner des points</Heading>
      {state.status === 'loading' && <Skeleton label="Chargement…" />}
      {state.status === 'error' && <Alert>{state.message}</Alert>}
      {state.status === 'ready' && (
        <>
          <section aria-labelledby="games" className="flex flex-col gap-3">
            <h2 id="games" className="font-club-title text-2xl font-bold uppercase text-club-ink">
              Jouer
            </h2>
            {state.data.games.length === 0 && <p>Aucun jeu disponible pour le moment.</p>}
            <ul className="grid gap-3 sm:grid-cols-2">
              {state.data.games.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={g.type === 'roulette' ? '/club/jeux/roue/' : '/club/jeux/course/'}
                    className={`flex h-full flex-col gap-1 rounded-club-lg border border-club-border bg-club-surface p-5 shadow-sm ${focusRing}`}
                  >
                    <span aria-hidden="true" className="text-4xl">
                      {g.type === 'roulette' ? '🎡' : '🐕'}
                    </span>
                    <span className="font-club-title text-2xl font-bold uppercase text-club-ink">{g.name}</span>
                    <span className="font-semibold text-club-accent-text">{g.points_hint}</span>
                    <span className="text-sm text-club-muted">{g.can_play ? 'Disponible maintenant' : g.message}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="profile" className="flex flex-col gap-3">
            <h2 id="profile" className="font-club-title text-2xl font-bold uppercase text-club-ink">
              Compléter mon profil
            </h2>
            <ProfileForm actions={state.data.profile} onSaved={reload} />
          </section>
        </>
      )}
    </>
  );
}
