'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { trackNavClick } from '@/lib/analytics';
import { siteConfig } from '@/lib/site-config';

const NAV_ITEMS = [
  { label: 'Solution', href: '#hero' },
  { label: 'Comment ça marche', href: '#how' },
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Sécurité', href: '#security' },
  { label: 'FAQ', href: '#faq' },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[78px] max-w-content items-center justify-between gap-6 px-6">
        <Link href="/" aria-label="SmartQonsumer — accueil" className="shrink-0">
          <Image src="/assets/logo-smartqonsumer.png" alt="SmartQonsumer" width={150} height={20} priority />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => trackNavClick(item.label, 'desktop')}
              className="rounded-sm px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:text-brand-800"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={siteConfig.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackNavClick('Nous contacter', 'desktop')}
            className="hidden rounded-sm bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 lg:inline-flex"
          >
            Nous contacter
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-neutral-900 lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-neutral-200 bg-white lg:hidden">
          <nav className="flex flex-col gap-1 p-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => {
                  trackNavClick(item.label, 'mobile');
                  setMenuOpen(false);
                }}
                className="rounded-sm px-3 py-3 text-base font-medium text-neutral-800 hover:bg-neutral-50"
              >
                {item.label}
              </a>
            ))}
            <a
              href={siteConfig.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackNavClick('Nous contacter', 'mobile')}
              className="mt-2 rounded-sm bg-brand-700 px-4 py-3 text-center text-base font-semibold text-white"
            >
              Nous contacter
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
