import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/Container';
import { siteConfig } from '@/lib/site-config';

const PRODUCT_LINKS = [
  { label: 'Comment ça marche', href: '#how' },
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Club Fidélité', href: '#club-fidelite' },
  { label: 'E-mailing & automatisation', href: '#email-automation' },
  { label: 'Pilotage', href: '#pilotage' },
] as const;

const RESOURCE_LINKS = [
  { label: 'QR Code augmenté & GS1', href: '#qr-augmente' },
  { label: 'Sécurité & RGPD', href: '#security' },
  { label: 'FAQ', href: '#faq' },
] as const;

const LEGAL_LINKS = [
  { label: 'CGV', href: '/legal/cgv' },
  { label: 'Confidentialité', href: '/legal/confidentialite' },
  { label: 'RGPD', href: '/legal/rgpd' },
  { label: 'Mentions légales', href: '/legal/mentions-legales' },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image src="/assets/logo-smartqonsumer.png" alt="SmartQonsumer" width={150} height={20} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-700">
            Le CRM qui reconnecte les marques vendues en circuits indirects à leurs consommateurs finaux. Prototype
            de démonstration.
          </p>
          <a
            href={siteConfig.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 hover:text-brand-800"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="M4 9h3v11H4z" />
              <circle cx="5.5" cy="5.5" r="1.6" />
              <path d="M11 9h3v1.8c.6-1.1 1.8-2 3.4-2 3 0 3.6 1.9 3.6 4.5V20h-3v-6.1c0-1.5 0-3.3-2-3.3s-2.4 1.6-2.4 3.2V20h-3z" />
            </svg>
          </a>
        </div>

        <FooterColumn title="Produit" links={PRODUCT_LINKS} />
        <FooterColumn title="Ressources" links={RESOURCE_LINKS} />
        <FooterColumn title="Légal" links={LEGAL_LINKS} />
      </Container>

      <div className="border-t border-neutral-200 bg-neutral-50 py-8">
        <Container className="flex flex-col items-center gap-4 text-center text-xs text-neutral-700 sm:flex-row sm:justify-between sm:text-left">
          <div className="flex flex-wrap justify-center gap-4">
            <span>Conforme RGPD</span>
            <span>Connexion sécurisée (MFA)</span>
            <span>Vos données vous appartiennent</span>
          </div>
          <span>© 2026 SmartQonsumer</span>
        </Container>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-neutral-950">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            {link.href.startsWith('/') ? (
              <Link href={link.href} className="text-sm text-neutral-700 hover:text-brand-800">
                {link.label}
              </Link>
            ) : (
              <a href={link.href} className="text-sm text-neutral-700 hover:text-brand-800">
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
