import type { Metadata } from 'next';
import { EarnPage } from '@/components/loyalty/ClubPages';
import { privatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = privatePageMetadata({
  title: 'Gagner des points',
  description: 'Complétez votre profil et jouez pour gagner des points.',
  path: '/club/gagner/',
});

export default function Page() {
  return <EarnPage />;
}
