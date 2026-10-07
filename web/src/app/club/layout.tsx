import type { ReactNode } from 'react';
import { ClubShell } from '@/components/loyalty/ClubShell';
import { SessionProvider } from '@/lib/auth/session';

export default function ClubLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ClubShell>{children}</ClubShell>
    </SessionProvider>
  );
}
