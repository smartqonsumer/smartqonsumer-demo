import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';

const AUDIENCES = [
  { label: 'Toute la base de contacts', checked: false },
  { label: 'Membres du Club', checked: true },
  { label: 'Segment Adeptes des bons plans', checked: true },
  { label: 'Segment Premium engagés', checked: false },
  { label: 'Contacts sélectionnés individuellement', checked: false },
] as const;

const AUTOMATION_RULES = [
  "Anniversaire du contact",
  "Proche d'une récompense",
  'Entrée en sommeil',
  "X jours après l'inscription",
  'Nombre de points atteint',
] as const;

export function EmailAutomation() {
  return (
    <section id="email-automation" className="product-band product-band-email scroll-mt-20 py-[88px] max-md:py-16">
      <Container>
        <SectionHeading
          pill
          eyebrow="E-mailing & Marketing Automation"
          title={
            <>
              La bonne audience. Le bon message.
              <br />
              Le bon moment.
            </>
          }
          description="Passez de la connaissance client à une campagne concrète. Combinez les audiences, préparez le contenu et choisissez le moment de l'envoi."
        />

        <Reveal className="mt-14 grid gap-6 rounded-lg border border-neutral-200 bg-white p-6 lg:grid-cols-2">
          <div>
            <div className="text-xs font-medium text-neutral-700">Étape 2 / 5</div>
            <h3 className="mt-1 text-lg font-semibold text-neutral-950">À qui souhaitez-vous vous adresser ?</h3>
            <p className="mt-1 text-sm text-neutral-700">Les audiences sont cumulables. Essayez la sélection :</p>
            <ul className="mt-4 space-y-2">
              {AUDIENCES.map((audience) => (
                <li key={audience.label} className="flex items-center gap-2 text-sm text-neutral-700">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                      audience.checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-neutral-300'
                    }`}
                  >
                    {audience.checked ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : null}
                  </span>
                  {audience.label}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-neutral-700">
              2 sources sélectionnées · Déduplication et préférences d&apos;envoi prises en compte
            </p>
          </div>

          <div className="rounded-md bg-neutral-50 p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-neutral-700">
              Aperçu du message · exemple
            </div>
            <div className="mt-3 rounded-md bg-brand-800 p-4 text-white">
              <div className="text-sm font-semibold">Édition Limitée n°4</div>
              <div className="text-xs">Une nouvelle découverte</div>
            </div>
            <h4 className="mt-4 text-base font-semibold text-neutral-950">Retrouvez ce qui vous a plu.</h4>
            <p className="mt-1 text-sm text-neutral-700">
              Une nouvelle occasion de découvrir la gamme et de retrouver votre Club.
            </p>
            <span className="mt-3 inline-block text-sm font-semibold text-brand-800">Découvrir le produit →</span>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <h3 className="text-xl font-semibold text-neutral-950">Vos règles prennent le relais.</h3>
            <p className="mt-3 text-base leading-relaxed text-neutral-700">
              Des scénarios déclenchés par les comportements clients, selon vos règles métier et les autorisations de
              chaque contact.
            </p>
          </Reveal>
          <Reveal as="ul" delay={0.1} className="space-y-3">
            {AUTOMATION_RULES.map((rule) => (
              <li
                key={rule}
                className="flex items-center justify-between rounded-md bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm"
              >
                {rule}
                <span aria-hidden="true">→</span>
              </li>
            ))}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
