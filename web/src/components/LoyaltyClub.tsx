import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';

const ITEMS = [
  {
    title: 'Chaque engagement a son origine',
    text: "Inscription, profil complété, scan produit : vous définissez les règles et le membre retrouve l’historique de ses points.",
  },
  {
    title: 'Chaque palier ouvre une possibilité',
    text: 'Statuts, progression et catalogue de récompenses rendent les prochaines étapes visibles.',
  },
  {
    title: 'Chaque récompense se suit',
    text: 'Code promotionnel générique, code unique ou QR Code à usage unique : une récompense peut devenir un QR Code à usage unique, scanné en point de vente et vérifié en temps réel par SmartQonsumer avant validation.',
  },
] as const;

export function LoyaltyClub() {
  return (
    <section id="club-fidelite" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-800">Le Club Fidélité</div>
          <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.014em] text-neutral-950 sm:text-3xl">
            Donnez une bonne raison de revenir.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-700">
            Des points compréhensibles. Des récompenses concrètes. Un parcours qui fait de la place à la relation,
            dès l&apos;inscription et le recueil des consentements.
          </p>
          <div className="mt-8 space-y-6">
            {ITEMS.map((item) => (
              <div key={item.title}>
                <h3 className="text-sm font-semibold text-neutral-950">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-700">{item.text}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-700">Vue tenant · Votre marque</div>
          <h4 className="mt-1 text-lg font-semibold text-neutral-950">Le programme, sous vos yeux.</h4>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {[
              ['84', 'inscriptions'],
              ['52', 'membres engagés'],
              ['6 400', 'points distribués'],
              ['2 100', 'points utilisés'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-md bg-white p-4 text-center shadow-sm">
                <div className="text-xl font-bold text-neutral-950">{value}</div>
                <div className="text-xs text-neutral-700">{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium">
            <span className="rounded-full bg-neutral-200 px-2.5 py-1 text-neutral-700">Émis</span>
            <span aria-hidden="true">→</span>
            <span className="rounded-full bg-neutral-200 px-2.5 py-1 text-neutral-700">Présenté</span>
            <span aria-hidden="true">→</span>
            <span className="rounded-full bg-brand-100 px-2.5 py-1 text-brand-800">Consommé</span>
          </div>
          <p className="mt-4 text-center text-xs text-neutral-700">Données fictives · illustration du parcours</p>
        </Reveal>
      </Container>
    </section>
  );
}
