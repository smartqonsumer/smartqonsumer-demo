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

      <div className="mt-8 bg-brand-50 py-8">
        <Container>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-semibold text-neutral-700">
            <span className="inline-flex items-center gap-2">
              <ShieldIcon />
              Conforme RGPD
            </span>
            <span className="inline-flex items-center gap-2">
              <BadgeIcon />
              Connexion sécurisée (MFA)
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldIcon />
              Vos données vous appartiennent
            </span>
          </div>
          <div className="my-7 flex items-center justify-center">
            <Image
              src="/assets/logo-smartqonsumer.png"
              alt="SmartQonsumer"
              width={220}
              height={30}
              className="h-16 w-auto sm:h-[100px]"
            />
          </div>
          <div className="text-center text-[11px] text-neutral-600 sm:text-left">© 2026 SmartQonsumer</div>
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

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 text-brand-600">
      <path d="M6 10V7a6 6 0 0 1 12 0v3" />
      <rect x="4" y="10" width="16" height="10" rx="2" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 text-brand-600">
      <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z" />
    </svg>
  );
}
