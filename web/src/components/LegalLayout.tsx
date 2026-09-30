import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/Container';

const CROSS_LINKS = [
  { label: 'CGV', href: '/legal/cgv' },
  { label: 'Confidentialité', href: '/legal/confidentialite' },
  { label: 'RGPD', href: '/legal/rgpd' },
  { label: 'Mentions légales', href: '/legal/mentions-legales' },
] as const;

export function LegalLayout({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-neutral-200">
        <Container className="flex h-[70px] items-center justify-between">
          <Link href="/" aria-label="SmartQonsumer — accueil">
            <Image src="/assets/logo-smartqonsumer.png" alt="SmartQonsumer" width={140} height={19} />
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-brand-800">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Retour au site
          </Link>
        </Container>
      </nav>

      <Container className="py-14">
        <div className="mx-auto max-w-[720px]">
          <div className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-800">{eyebrow}</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.018em] text-neutral-950">{title}</h1>
          <p className="mt-2 text-sm text-neutral-700">Dernière mise à jour : {updated}</p>

          <div className="prose prose-neutral prose-headings:font-semibold prose-a:text-brand-800 mt-8 max-w-none">
            {children}
          </div>

          <footer className="mt-14 border-t border-neutral-200 pt-6 text-sm text-neutral-700">
            <p>
              Voir aussi :{' '}
              {CROSS_LINKS.map((link, index) => (
                <span key={link.href}>
                  <Link href={link.href} className="text-brand-800 hover:text-brand-900">
                    {link.label}
                  </Link>
                  {index < CROSS_LINKS.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </p>
            <Link href="/" className="mt-2 inline-block text-brand-800 hover:text-brand-900">
              ← Retour à SmartQonsumer
            </Link>
          </footer>
        </div>
      </Container>
    </div>
  );
}
