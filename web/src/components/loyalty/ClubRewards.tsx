'use client';

import { useRef, useState } from 'react';
import { Alert, Button, Card, Heading } from '@/components/ui';
import { api, errorMessage, newIdempotencyKey } from '@/lib/api/client';
import type { MyReward, RedemptionResponse, Reward } from '@/lib/api/types';
import { useClub, useMemberData } from './ClubShell';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

const STATUS_LABEL: Record<MyReward['status'], string> = {
  available: 'Disponible',
  assigned: 'À utiliser',
  used: 'Utilisé',
  expired: 'Expiré',
};

export function RewardsPage() {
  const { brand } = useClub();
  const catalogue = useMemberData<Reward[]>('/rewards', { brand });
  const mine = useMemberData<MyReward[]>('/rewards/my');

  return (
    <>
      <Heading>Mes récompenses</Heading>
      <section aria-labelledby="mine" className="flex flex-col gap-3">
        <h2 id="mine" className="font-club-title text-2xl font-bold uppercase text-club-ink">
          Mes codes
        </h2>
        {mine.state.status === 'loading' && <p role="status">Chargement…</p>}
        {mine.state.status === 'error' && <Alert>{mine.state.message}</Alert>}
        {mine.state.status === 'ready' && mine.state.data.length === 0 && (
          <Card>
            <p className="text-lg">Vous n&apos;avez pas encore de récompense. Échangez vos points ci-dessous !</p>
          </Card>
        )}
        {mine.state.status === 'ready' && (
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {mine.state.data.map((r) => (
              <li key={r.redemption_id}>
                <RewardCode reward={r} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="catalogue" className="flex flex-col gap-3">
        <h2 id="catalogue" className="font-club-title text-2xl font-bold uppercase text-club-ink">
          Échanger mes points
        </h2>
        {catalogue.state.status === 'loading' && <p role="status">Chargement du catalogue…</p>}
        {catalogue.state.status === 'error' && <Alert>{catalogue.state.message}</Alert>}
        {catalogue.state.status === 'ready' && (
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {catalogue.state.data.map((r) => (
              <li key={r.id}>
                <CatalogueItem
                  reward={r}
                  onRedeemed={() => {
                    void catalogue.reload();
                    void mine.reload();
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function CatalogueItem({ reward, onRedeemed }: { reward: Reward; onRedeemed: () => void }) {
  const { refreshSummary } = useClub();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<RedemptionResponse | null>(null);
  // One key per confirmation: a double tap or a network retry never debits twice.
  const key = useRef<string | null>(null);

  async function redeem() {
    key.current ??= newIdempotencyKey('redeem');
    setLoading(true);
    setError(null);
    try {
      const res = await api<RedemptionResponse>(`/rewards/${reward.id}/redeem`, { method: 'POST', idempotencyKey: key.current });
      setDone(res);
      setConfirming(false);
      key.current = null;
      await refreshSummary();
      onRedeemed();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-club-title text-xl font-bold uppercase text-club-ink">{reward.title}</h3>
          {reward.description && <p className="text-base text-club-muted">{reward.description}</p>}
        </div>
        <span className="shrink-0 rounded-full bg-club-primary px-3 py-1 font-club-title text-lg font-bold text-club-primary-contrast">{reward.cost_points} pts</span>
      </div>
      {done && (
        <Alert tone="success">
          🎁 C&apos;est à vous ! Votre code <strong className="font-mono">{done.code}</strong> est disponible dans « Mes codes ».
        </Alert>
      )}
      {error && <Alert>{error}</Alert>}
      {!reward.in_stock ? (
        <p className="font-semibold text-club-muted">Victime de son succès : plus de code disponible.</p>
      ) : confirming ? (
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-club-ink">Échanger {reward.cost_points} points contre « {reward.title} » ?</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setConfirming(false)} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={redeem} loading={loading}>
              Confirmer
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setConfirming(true)} disabled={!reward.affordable} variant={reward.affordable ? 'primary' : 'secondary'}>
          {reward.affordable ? 'Échanger mes points' : 'Points insuffisants'}
        </Button>
      )}
    </Card>
  );
}

function RewardCode({ reward }: { reward: MyReward }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(reward.code);
      setCopied('Code copié !');
    } catch {
      setCopied('Copie impossible : sélectionnez le code manuellement.');
    }
  }

  return (
    <Card className="flex h-full flex-col gap-3 border-2 !border-dashed !border-club-accent">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-club-title text-xl font-bold uppercase text-club-ink">🎁 {reward.reward_title}</h3>
        <span className="rounded-full bg-club-accent-soft px-2 py-0.5 text-sm font-semibold text-club-ink">{STATUS_LABEL[reward.status]}</span>
      </div>
      <p className="text-sm font-semibold uppercase tracking-widest text-club-muted">Code</p>
      <p className="select-all break-all font-mono text-2xl font-bold text-club-ink">{reward.code}</p>
      <Button variant="secondary" onClick={copy}>
        Copier le code
      </Button>
      <p className="text-sm text-club-muted" aria-live="polite">
        {copied}
      </p>
      <p className="text-sm text-club-muted">
        Obtenu le {dateFormat.format(new Date(reward.granted_at))}
        {reward.source === 'game_win' ? ' (cadeau de la course)' : ` contre ${reward.cost_points} points`}
        {reward.expires_at && <> · valable jusqu&apos;au {dateFormat.format(new Date(reward.expires_at))}</>}
        {reward.used_at && <> · utilisé le {dateFormat.format(new Date(reward.used_at))}</>}
      </p>
    </Card>
  );
}
