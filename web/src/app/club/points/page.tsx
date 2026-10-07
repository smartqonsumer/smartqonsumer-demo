import type { Metadata } from 'next';
import { PointsPage } from '@/components/loyalty/ClubPages';
import { privatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = privatePageMetadata({
  title: 'Mes points',
  description: 'Votre solde et l’historique détaillé de vos points fidélité Club Croquin.',
  path: '/club/points/',
});

export default function Page() {
  return <PointsPage />;
}
