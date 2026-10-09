import type { Metadata } from 'next';
import { Suspense } from 'react';
import { JourneyShell, LoadingBlock } from '@/components/journeys/JourneyShell';
import { SimpleJourney } from '@/components/journeys/SimpleJourney';
import { JOURNEYS } from '@/lib/brand/journeys';
import { SessionProvider } from '@/lib/auth/session';
import { privatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = privatePageMetadata({
  title: 'Rejoignez le Club Maison de la Croquette',
  description: 'Créez votre compte fidélité Maison de la Croquette et commencez à gagner des points.',
  path: '/club-croquin-simple/',
});

export default function ClubCroquinSimplePage() {
  return (
    <SessionProvider>
      <Suspense
        fallback={
          <JourneyShell>
            <h1 className="font-club-title text-4xl font-extrabold uppercase text-club-ink">Club fidélité</h1>
            <LoadingBlock label="Chargement…" />
          </JourneyShell>
        }
      >
        <SimpleJourney campaignSlug={JOURNEYS.simple} />
      </Suspense>
    </SessionProvider>
  );
}
