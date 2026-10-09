'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Button, Card, Heading } from '@/components/ui';
import { api, errorMessage } from '@/lib/api/client';
import type { ConsentState, Message } from '@/lib/api/types';
import { useSession } from '@/lib/auth/session';
import { useMemberData } from './ClubShell';

const CONSENT_LABELS: Record<string, string> = {
  participation_terms: 'Règlement et traitement nécessaire à votre compte',
  marketing_brand: 'Actualités et offres de la marque par email',
};

export function AccountPage() {
  const session = useSession();
  const router = useRouter();
  const consents = useMemberData<ConsentState[]>('/me/consents');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const user = session.status === 'authenticated' ? session.user : null;

  async function run(label: string, action: () => Promise<void>) {
    setBusy(label);
    setFeedback(null);
    try {
      await action();
    } catch (e) {
      setFeedback({ tone: 'error', text: errorMessage(e) });
    } finally {
      setBusy(null);
    }
  }

  const toggleMarketing = (active: boolean) =>
    run('consent', async () => {
      const res = await api<Message>(`/me/consents/marketing_brand/${active ? 'withdraw' : 'grant'}`, { method: 'POST' });
      setFeedback({ tone: 'success', text: res.message });
      await consents.reload();
    });

  const exportData = () =>
    run('export', async () => {
      const data = await api<unknown>('/me/export');
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mes-donnees-club.json';
      link.click();
      URL.revokeObjectURL(url);
      setFeedback({ tone: 'success', text: 'Vos données ont été téléchargées.' });
    });

  const deleteAccount = () =>
    run('delete', async () => {
      await api<Message>('/me', { method: 'DELETE' });
      await session.logout();
      router.replace('/club-croquin-simple/');
    });

  const marketing = consents.state.status === 'ready' ? consents.state.data.find((c) => c.type === 'marketing_brand') : undefined;

  return (
    <>
      <Heading>Mon compte</Heading>
      {feedback && <Alert tone={feedback.tone}>{feedback.text}</Alert>}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <Card as="section" className="flex flex-col gap-2">
        <h2 className="font-club-title text-2xl font-bold uppercase text-club-ink">Mes informations</h2>
        <p className="text-lg">
          {user?.first_name} {user?.last_name}
        </p>
        <p className="break-all text-base text-club-muted">{user?.email}</p>
        <Link href="/club/gagner/" className="mt-2 font-semibold text-club-ink underline underline-offset-4">
          Compléter mon profil
        </Link>
      </Card>

      <Card as="section" className="flex flex-col gap-3">
        <h2 className="font-club-title text-2xl font-bold uppercase text-club-ink">Mes consentements</h2>
        {consents.state.status === 'loading' && <p role="status">Chargement…</p>}
        {consents.state.status === 'error' && <Alert>{consents.state.message}</Alert>}
        {consents.state.status === 'ready' && (
          <ul className="flex flex-col gap-3">
            {consents.state.data.map((c) => (
              <li key={c.type} className="flex flex-col gap-1">
                <span className="font-semibold text-club-ink">{CONSENT_LABELS[c.type] ?? c.type}</span>
                <span className="text-sm text-club-muted">
                  {c.active ? 'Accepté' : 'Non accepté'} · version {c.version}
                </span>
              </li>
            ))}
          </ul>
        )}
        {marketing && (
          <Button variant="secondary" loading={busy === 'consent'} onClick={() => toggleMarketing(marketing.active)}>
            {marketing.active ? 'Ne plus recevoir les offres' : 'Recevoir les offres par email'}
          </Button>
        )}
      </Card>

      <Card as="section" className="flex flex-col gap-3">
        <h2 className="font-club-title text-2xl font-bold uppercase text-club-ink">Mes données</h2>
        <p className="text-base">Téléchargez l&apos;ensemble des données associées à votre compte.</p>
        <Button variant="secondary" loading={busy === 'export'} onClick={exportData}>
          Télécharger mes données
        </Button>
        {!confirmDelete ? (
          <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
            Supprimer mon compte
          </Button>
        ) : (
          <div className="flex flex-col gap-2 rounded-club-md border-2 border-club-primary p-4">
            <p className="font-semibold text-club-ink">
              Vos données personnelles seront effacées et vos points perdus. Cette action est définitive.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                Annuler
              </Button>
              <Button loading={busy === 'delete'} onClick={deleteAccount}>
                Supprimer
              </Button>
            </div>
          </div>
        )}
      </Card>
      </div>

      <Button
        className="lg:max-w-xs"
        variant="secondary"
        onClick={async () => {
          await session.logout();
          router.replace('/auth/connexion/');
        }}
      >
        Se déconnecter
      </Button>
    </>
  );
}
