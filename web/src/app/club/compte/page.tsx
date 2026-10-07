import type { Metadata } from 'next';
import { AccountPage } from '@/components/loyalty/ClubAccount';
import { privatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = privatePageMetadata({
  title: 'Mon compte',
  description: 'Vos informations, vos consentements et vos données personnelles.',
  path: '/club/compte/',
});

export default function Page() {
  return <AccountPage />;
}
