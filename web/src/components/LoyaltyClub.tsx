import { Container } from '@/components/Container';
import { IconRow } from '@/components/IconRow';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';
import { MemberPhoneMockup, TenantPanel } from '@/components/ClubFideliteVisuals';

const ITEMS = [
  {
    title: 'Chaque engagement a son origine',
    text: "Inscription, profil complété, scan produit : vous définissez les règles et le membre retrouve l'historique de ses points.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      </svg>
    ),
  },
  {
    title: 'Chaque palier ouvre une possibilité',
    text: 'Statuts, progression et catalogue de récompenses rendent les prochaines étapes visibles.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <rect x="5" y="12" width="14" height="8" rx="1" />
        <path d="M12 8v12M12 8c-1.6-3.2-5.2-3-5.2-1s2 1 5.2 1M12 8c1.6-3.2 5.2-3 5.2-1s-2 1-5.2 1" />
      </svg>
    ),
  },
  {
    title: 'Chaque récompense se suit',
    text: 'Code promotionnel générique, code unique ou QR Code à usage unique : une récompense peut devenir un QR Code à usage unique, scanné en point de vente et vérifié en temps réel par SmartQonsumer avant validation.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3" />
      </svg>
    ),
  },
] as const;

export function LoyaltyClub() {
  return (
    <section id="club-fidelite" className="product-band product-band-club scroll-mt-20 py-[88px] max-md:py-16">
      <Container className="grid gap-14 lg:grid-cols-[0.95fr_1.3fr] lg:items-start">
        <div>
          <SectionHeading pill center={false} eyebrow="Le Club Fidélité" title="Donnez une bonne raison de revenir." />
          <Reveal delay={0.06}>
            <p className="mt-3.5 max-w-[460px] text-[15px] leading-relaxed text-neutral-600">
              Des points compréhensibles. Des récompenses concrètes. Un parcours qui fait de la place à la relation,
              dès l&apos;inscription et le recueil des consentements.
            </p>
            <div className="mt-6 flex flex-col gap-5">
              {ITEMS.map((item) => (
                <IconRow key={item.title} icon={item.icon} title={item.title} text={item.text} />
              ))}
            </div>
            <a
              href="#club-fidelite"
              className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-brand-700 hover:underline"
            >
              Découvrir le parcours membre
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="flex flex-col items-start gap-5 md:flex-row">
            <MemberPhoneMockup />
            <TenantPanel />
          </div>
          <p className="mt-4 text-right text-[11px] text-neutral-500">Données fictives · illustration du parcours</p>
        </Reveal>
      </Container>
    </section>
  );
}
