import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ClaimView } from '@/components/auth/AuthViews';
import { JourneyShell, LoadingBlock } from '@/components/journeys/JourneyShell';
import { SessionProvider } from '@/lib/auth/session';
import { privatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = privatePageMetadata({
  title: 'Votre cadeau',
  description: 'Ajout du cadeau gagné à la Grande Course Croquin à votre compte fidélité.',
  path: '/club-croquin/reclamer/',
});

export default function Page() {
  return (
    <SessionProvider>
      <Suspense
        fallback={
          <JourneyShell>
            <h1 className="font-club-title text-4xl font-extrabold uppercase text-club-ink">Votre cadeau</h1>
            <LoadingBlock label="Chargement…" />
          </JourneyShell>
        }
      >
        <ClaimView />
      </Suspense>
    </SessionProvider>
  );
}
