import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginView } from '@/components/auth/AuthViews';
import { JourneyShell, LoadingBlock } from '@/components/journeys/JourneyShell';
import { SessionProvider } from '@/lib/auth/session';
import { privatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = privatePageMetadata({
  title: 'Connexion au club',
  description: 'Connectez-vous à votre espace fidélité Club Croquin.',
  path: '/auth/connexion/',
});

export default function Page() {
  return (
    <SessionProvider>
      <Suspense
        fallback={
          <JourneyShell>
            <h1 className="font-club-title text-4xl font-extrabold uppercase text-club-ink">Connexion</h1>
            <LoadingBlock label="Chargement…" />
          </JourneyShell>
        }
      >
        <LoginView />
      </Suspense>
    </SessionProvider>
  );
}
