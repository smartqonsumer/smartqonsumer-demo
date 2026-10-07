import type { Metadata } from 'next';
import { DogRaceGamePage } from '@/components/loyalty/ClubGames';
import { privatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = privatePageMetadata({
  title: 'Course de chiens',
  description: 'Choisissez votre chien et tentez de gagner des points.',
  path: '/club/jeux/course/',
});

export default function Page() {
  return <DogRaceGamePage />;
}
