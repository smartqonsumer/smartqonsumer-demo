import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GamifiedJourney } from '@/components/journeys/GamifiedJourney';
import { JourneyShell, LoadingBlock } from '@/components/journeys/JourneyShell';
import { JOURNEYS } from '@/lib/brand/journeys';
import { SessionProvider } from '@/lib/auth/session';
import { privatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = privatePageMetadata({
  title: 'La Grande Course Croquin',
  description: 'Choisissez votre chien, gagnez la course et recevez votre cadeau du Club Croquin.',
  path: '/club-croquin/',
});

export default function ClubCroquinPage() {
  return (
    <SessionProvider>
      <Suspense
        fallback={
          <JourneyShell>
            <h1 className="font-club-title text-4xl font-extrabold uppercase text-club-ink">La Grande Course</h1>
            <LoadingBlock label="Chargement…" />
          </JourneyShell>
        }
      >
        <GamifiedJourney campaignSlug={JOURNEYS.gamified} />
      </Suspense>
    </SessionProvider>
  );
}
