import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailView } from '@/components/auth/AuthViews';
import { JourneyShell, LoadingBlock } from '@/components/journeys/JourneyShell';
import { SessionProvider } from '@/lib/auth/session';
import { privatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = privatePageMetadata({
  title: 'Confirmation de votre email',
  description: 'Confirmation de l’adresse email de votre compte fidélité.',
  path: '/verify-email/',
});

export default function Page() {
  return (
    <SessionProvider>
      <Suspense
        fallback={
          <JourneyShell>
            <h1 className="font-club-title text-4xl font-extrabold uppercase text-club-ink">Confirmation de votre email</h1>
            <LoadingBlock label="Chargement…" />
          </JourneyShell>
        }
      >
        <VerifyEmailView />
      </Suspense>
    </SessionProvider>
  );
}
