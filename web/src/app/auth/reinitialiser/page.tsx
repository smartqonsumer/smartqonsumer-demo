import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordView } from '@/components/auth/AuthViews';
import { JourneyShell, LoadingBlock } from '@/components/journeys/JourneyShell';
import { SessionProvider } from '@/lib/auth/session';
import { privatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = privatePageMetadata({
  title: 'Nouveau mot de passe',
  description: 'Choisissez un nouveau mot de passe pour votre compte fidélité.',
  path: '/auth/reinitialiser/',
});

export default function Page() {
  return (
    <SessionProvider>
      <Suspense
        fallback={
          <JourneyShell>
            <h1 className="font-club-title text-4xl font-extrabold uppercase text-club-ink">Nouveau mot de passe</h1>
            <LoadingBlock label="Chargement…" />
          </JourneyShell>
        }
      >
        <ResetPasswordView />
      </Suspense>
    </SessionProvider>
  );
}
