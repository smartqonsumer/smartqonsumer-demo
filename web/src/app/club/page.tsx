import type { Metadata } from 'next';
import { ClubHome } from '@/components/loyalty/ClubPages';
import { privatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = privatePageMetadata({
  title: 'Mon club',
  description: 'Votre espace fidélité : solde de points, récompenses et actions pour gagner des points.',
  path: '/club/',
});

export default function Page() {
  return <ClubHome />;
}
