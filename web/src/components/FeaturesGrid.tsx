import Image from 'next/image';
import type { ReactNode } from 'react';
import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';

/** 24px stroke icon; children are the SVG paths. */
function Icon({ children, size = 22, className = '' }: { children: ReactNode; size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

const GIFT = (
  <>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <rect x="5" y="12" width="14" height="8" rx="1" />
    <path d="M12 8v12M12 8c-1.6-3.2-5.2-3-5.2-1s2 1 5.2 1M12 8c1.6-3.2 5.2-3 5.2-1s-2 1-5.2 1" />
  </>
);
const MAIL = (
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </>
);
const CROWN = <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8Z" />;
const BARS = <path d="M6 20v-6M12 20V9M18 20V4" />;

/* ---------- Mini illustrations (decorative) ---------- */

const chip = 'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium';

function ContactVisual() {
  return (
    <div className="w-[140px] rounded-2xl border border-neutral-100 bg-white p-3 shadow-[0_10px_28px_rgba(18,22,26,.08)]">
      <div className="mb-3 flex items-center gap-2.5">
        <Image src="/assets/feature-contact-avatar.webp" alt="" width={84} height={84} className="h-11 w-11 rounded-full" />
        <div className="flex flex-1 flex-col gap-1.5">
          <span className="h-1.5 w-full rounded-full bg-neutral-200" />
          <span className="h-1.5 w-2/3 rounded-full bg-neutral-100" />
        </div>
      </div>
      <div className="flex flex-col items-start gap-1.5">
        <span className={`${chip} bg-brand-50 text-brand-800`}>
          <Icon size={12} className="text-brand-700">{CROWN}</Icon>
          Client fidèle
        </span>
        <span className={`${chip} bg-neutral-100 text-neutral-700`}>
          <Icon size={12}>
            <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" />
            <circle cx="12" cy="11" r="2" />
          </Icon>
          Paris
        </span>
        <span className={`${chip} bg-neutral-100 text-neutral-700`}>
          <Icon size={12}>{BARS}</Icon>
          12 scans
        </span>
      </div>
    </div>
  );
}

function ProductVisual() {
  return (
    <div className="flex w-[150px] flex-col items-end">
      <Image src="/assets/feature-produit-v2.webp" alt="" width={617} height={500} className="h-auto w-[150px]" />
      <span className="relative -mt-2.5 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-neutral-100 bg-white px-2.5 py-1.5 text-[10px] font-medium text-neutral-800 shadow-[0_6px_16px_rgba(18,22,26,.08)]">
        <Icon size={12} className="text-brand-700">
          <path d="M10 13a5 5 0 0 0 7.07 0l1.93-1.93a5 5 0 0 0-7.07-7.07L10.5 5.46" />
          <path d="M14 11a5 5 0 0 0-7.07 0L4.93 12.93a5 5 0 0 0 7.07 7.07L13.46 18.5" />
        </Icon>
        qr.smartqonsumer.com
      </span>
    </div>
  );
}

function LoyaltyVisual() {
  const round = 'grid h-10 w-10 place-items-center rounded-full bg-white text-brand-700 shadow-[0_6px_16px_rgba(18,22,26,.08)]';
  return (
    <div className="relative w-[144px] pt-4">
      <span aria-hidden="true" className="absolute right-6 top-0 text-brand-500">
        <svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M13 1v5M4 5l3 3M22 5l-3 3" />
        </svg>
      </span>
      <div className="rounded-2xl border border-neutral-100 bg-white p-3 shadow-[0_10px_28px_rgba(18,22,26,.08)]">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-950">
          <Icon size={14} className="text-brand-700">{CROWN}</Icon>
          2 450 points
          <Icon size={12} className="ml-auto text-neutral-400">
            <path d="m9 6 6 6-6 6" />
          </Icon>
        </div>
        <div className="mt-2.5 h-1.5 rounded-full bg-neutral-100">
          <div className="h-full w-[72%] rounded-full bg-brand-600" />
        </div>
      </div>
      <div className="mt-3 flex justify-between px-1">
        <span className={round}>
          <Icon size={18}>{GIFT}</Icon>
        </span>
        <span className={round}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z" />
          </svg>
        </span>
        <span className={round}>
          <Icon size={18}>
            <path d="M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a3 3 0 0 0 0 6v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a3 3 0 0 0 0-6Z" />
            <path d="M14 5v14" strokeDasharray="2 2" />
          </Icon>
        </span>
      </div>
    </div>
  );
}

function EmailVisual() {
  return (
    <div className="relative w-[140px] pr-4 pt-4">
      <div className="rounded-2xl border border-neutral-100 bg-white p-3 shadow-[0_10px_28px_rgba(18,22,26,.08)]">
        <span className="block h-2 w-1/2 rounded-full bg-neutral-200" />
        <div className="mt-2.5 grid h-14 place-items-center rounded-lg bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700">
          <Icon size={22}>
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
            <path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12" />
          </Icon>
        </div>
        <span className="mt-2.5 block h-1.5 w-full rounded-full bg-neutral-100" />
        <span className="mt-1.5 block h-1.5 w-3/4 rounded-full bg-neutral-100" />
        <span className="mt-2.5 block h-4 w-1/2 rounded-md bg-brand-700" />
      </div>
      <span className="absolute right-0 top-0 grid h-9 w-9 place-items-center rounded-full bg-white text-brand-700 shadow-[0_6px_16px_rgba(18,22,26,.1)]">
        <Icon size={16}>
          <path d="m22 2-7 20-4-9-9-4 20-7Z" />
          <path d="M22 2 11 13" />
        </Icon>
      </span>
    </div>
  );
}

function AutomationVisual() {
  const steps = [
    { label: 'Scan produit', icon: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /> },
    { label: 'Envoi e-mail', icon: MAIL },
    { label: 'Récompense', icon: GIFT },
  ];
  return (
    <div className="flex w-[132px] flex-col items-center">
      {steps.map((step, index) => (
        <div key={step.label} className="flex w-full flex-col items-center">
          {index > 0 ? (
            <svg aria-hidden="true" width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="my-0.5 text-brand-600">
              <path d="M5 1v13M1.5 10.5 5 14l3.5-3.5" />
            </svg>
          ) : null}
          <span className="flex w-full items-center gap-2 rounded-xl border border-neutral-100 bg-white px-3 py-2 text-[11px] font-medium text-neutral-800 shadow-[0_6px_16px_rgba(18,22,26,.06)]">
            <Icon size={15} className="text-brand-700">{step.icon}</Icon>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsVisual() {
  const bars = [
    ['h-[14%]', 'bg-brand-700'],
    ['h-[30%]', 'bg-brand-300'],
    ['h-[44%]', 'bg-brand-400'],
    ['h-[58%]', 'bg-brand-400'],
    ['h-[74%]', 'bg-brand-500'],
    ['h-[100%]', 'bg-brand-600'],
  ];
  return (
    <div className="relative w-[144px] pt-5">
      <span className="absolute right-0 top-0 z-10 flex items-center gap-1 rounded-xl bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand-800 shadow-[0_6px_16px_rgba(18,22,26,.1)]">
        <Icon size={12}>
          <path d="M7 17 17 7M8 7h9v9" />
        </Icon>
        +24 %
      </span>
      <div className="rounded-2xl border border-neutral-100 bg-white p-3 shadow-[0_10px_28px_rgba(18,22,26,.08)]">
        <div className="flex h-20 items-end gap-1.5 border-b border-l border-neutral-100 pb-px pl-1.5">
          {bars.map(([height, color], index) => (
            <span key={index} className={`w-full rounded-t-[3px] ${height} ${color}`} />
          ))}
        </div>
        <span className="mt-3 block h-1.5 w-full rounded-full bg-neutral-100" />
        <span className="mt-1.5 block h-1.5 w-2/3 rounded-full bg-neutral-100" />
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: 'Contacts',
    text: 'Une fiche client 360° qui se construit à chaque scan, sans ressaisie : produit préféré, provenance, statut fidélité, historique.',
    href: '#story',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    visual: <ContactVisual />,
  },
  {
    title: 'Produits & QR Codes',
    text: 'Un QR Code par produit, conforme GS1 Digital Link, avec une URL de destination que vous choisissez et changez à tout moment.',
    href: '#club-fidelite',
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
      </>
    ),
    visual: <ProductVisual />,
  },
  {
    title: 'Club Fidélité',
    text: 'Points, paliers, tirages au sort et récompenses activables. Vous choisissez les contreparties à activer aux couleurs de votre marque.',
    href: '#club-fidelite',
    icon: GIFT,
    visual: <LoyaltyVisual />,
  },
  {
    title: 'Campagnes e-mail',
    text: "Ciblez un segment précis et envoyez une campagne en quelques clics, avec aperçu du message avant l'envoi.",
    href: '#email-automation',
    icon: MAIL,
    visual: <EmailVisual />,
  },
  {
    title: 'Automatisations',
    text: "Des scénarios déclenchés par le comportement du contact : anniversaire, entrée en sommeil, proche d'une récompense.",
    href: '#email-automation',
    icon: (
      <>
        <circle cx="12" cy="5" r="2.5" />
        <circle cx="5" cy="19" r="2.5" />
        <circle cx="19" cy="19" r="2.5" />
        <path d="M10.8 7.2 6.2 16.8M13.2 7.2l4.6 9.6" />
      </>
    ),
    visual: <AutomationVisual />,
  },
  {
    title: 'Analyses',
    text: 'Scans, contacts, conversion, segments : les indicateurs pour comprendre le parcours et décider de la prochaine action.',
    href: '#pilotage',
    icon: BARS,
    visual: <AnalyticsVisual />,
  },
] as const;

export function FeaturesGrid() {
  return (
    <section id="features" className="scroll-mt-20 bg-neutral-50 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Fonctionnalités"
          title="Tout ce dont vous avez besoin, dans une seule plateforme."
          description="Du scan du produit à la campagne ciblée, chaque module s'appuie sur les données des précédents."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Reveal
              key={feature.title}
              delay={index * 0.06}
              className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon>{feature.icon}</Icon>
                </span>
                <h3 className="text-lg font-semibold tracking-[-0.2px] text-neutral-950">{feature.title}</h3>
              </div>
              <div className="mt-4 flex flex-1 flex-col gap-5 sm:flex-row sm:items-center sm:gap-4">
                <p className="min-w-0 flex-1 text-sm leading-relaxed text-neutral-700">{feature.text}</p>
                <div aria-hidden="true" className="flex shrink-0 justify-center">
                  {feature.visual}
                </div>
              </div>
              <a
                href={feature.href}
                className="mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-800 hover:text-brand-900"
              >
                Découvrir
                <span className="sr-only"> : {feature.title}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
