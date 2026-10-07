import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ForgotPasswordView } from '@/components/auth/AuthViews';
import { JourneyShell, LoadingBlock } from '@/components/journeys/JourneyShell';
import { SessionProvider } from '@/lib/auth/session';
import { privatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = privatePageMetadata({
  title: 'Mot de passe oublié',
  description: 'Recevez un lien pour choisir un nouveau mot de passe.',
  path: '/auth/mot-de-passe-oublie/',
});

export default function Page() {
  return (
    <SessionProvider>
      <Suspense
        fallback={
          <JourneyShell>
            <h1 className="font-club-title text-4xl font-extrabold uppercase text-club-ink">Mot de passe oublié</h1>
            <LoadingBlock label="Chargement…" />
          </JourneyShell>
        }
      >
        <ForgotPasswordView />
      </Suspense>
    </SessionProvider>
  );
}
