import type { Metadata } from 'next';
import { RouletteGamePage } from '@/components/loyalty/ClubGames';
import { privatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = privatePageMetadata({
  title: 'Roue de la chance',
  description: 'Lancez la roue de la chance du Club Croquin et gagnez des points fidélité.',
  path: '/club/jeux/roue/',
});

export default function Page() {
  return <RouletteGamePage />;
}
