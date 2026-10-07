import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';

const FEATURES = [
  {
    title: 'Contacts',
    text: 'Une fiche client 360° qui se construit à chaque scan, sans ressaisie : produit préféré, provenance, statut fidélité, historique.',
    href: '#story',
  },
  {
    title: 'Produits & QR Codes',
    text: 'Un QR Code par produit, conforme GS1 Digital Link, avec une URL de destination que vous choisissez et changez à tout moment.',
    href: '#qr-augmente',
  },
  {
    title: 'Club Fidélité',
    text: 'Points, paliers, tirages au sort et récompenses activables. Vous choisissez les contreparties à activer aux couleurs de votre marque.',
    href: '#club-fidelite',
  },
  {
    title: 'Campagnes e-mail',
    text: "Ciblez un segment précis et envoyez une campagne en quelques clics, avec aperçu du message avant l'envoi.",
    href: '#email-automation',
  },
  {
    title: 'Automatisations',
    text: "Des scénarios déclenchés par le comportement du contact : anniversaire, entrée en sommeil, proche d'une récompense.",
    href: '#email-automation',
  },
  {
    title: 'Analyses',
    text: 'Scans, contacts, conversion, segments : les indicateurs pour comprendre le parcours et décider de la prochaine action.',
    href: '#pilotage',
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
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Reveal
              key={feature.title}
              delay={index * 0.06}
              className="rounded-lg border border-neutral-200 bg-white p-6"
            >
              <h3 className="text-base font-semibold text-neutral-950">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">{feature.text}</p>
              <a href={feature.href} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-800 hover:text-brand-900">
                Découvrir
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
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
