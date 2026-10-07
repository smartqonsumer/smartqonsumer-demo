import type { Metadata } from 'next';
import { RewardsPage } from '@/components/loyalty/ClubRewards';
import { privatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = privatePageMetadata({
  title: 'Mes récompenses',
  description: 'Échangez vos points contre des codes promo et retrouvez vos récompenses.',
  path: '/club/recompenses/',
});

export default function Page() {
  return <RewardsPage />;
}
