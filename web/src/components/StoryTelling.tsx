import { Container } from '@/components/Container';

const ROWS = [
  {
    eyebrow: 'Connaître',
    title: 'Découvrez qui se cache derrière vos ventes.',
    text: "Chaque scan enrichit progressivement le profil du consommateur : produit préféré, contexte d'achat, canal d'entrée. Une fiche client 360 se construit sans qu'il ait à remplir un long formulaire.",
    visual: (
      <ul className="space-y-3 text-sm">
        <li className="rounded-md bg-white p-4 shadow-sm">
          <div className="font-medium text-neutral-900">Un produit est scanné</div>
          <div className="text-neutral-700">→ Vous captez un premier signal d&rsquo;intérêt</div>
        </li>
        <li className="rounded-md bg-white p-4 shadow-sm">
          <div className="font-medium text-neutral-900">Les interactions se multiplient</div>
          <div className="text-neutral-700">→ Vous identifiez des préférences</div>
        </li>
        <li className="rounded-md bg-white p-4 shadow-sm">
          <div className="font-medium text-neutral-900">Qui est le consommateur</div>
          <div className="text-neutral-700">→ Vous construisez un profil client exploitable</div>
        </li>
      </ul>
    ),
  },
  {
    eyebrow: 'Comprendre',
    title: 'Vos données deviennent des opportunités.',
    text: 'Des segments se créent automatiquement à partir des interactions et des informations recueillies auprès de vos consommateurs — sans tableur, sans requête, sans data analyst.',
    visual: (
      <div className="space-y-3">
        {[
          ['Adeptes des bons plans', '1 840'],
          ['Ambassadeurs de la marque', '1 220'],
          ['Premium engagés', '960'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-md bg-white p-4 text-sm shadow-sm">
            <span className="text-neutral-700">{label}</span>
            <span className="font-semibold text-neutral-950">{value}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    eyebrow: 'Fidéliser',
    title: 'Donnez une raison de revenir.',
    text: 'Points, paliers et récompenses activables directement par vos consommateurs — pour transformer chaque scan en réflexe de fidélité. Vous pouvez piloter plusieurs programmes de récompenses en parallèle depuis la même solution.',
    visual: (
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <div className="text-xs font-medium uppercase tracking-wide text-neutral-700">Club fidélité</div>
        <div className="mt-1 text-lg font-semibold text-neutral-950">Camille Rousseau</div>
        <div className="mt-1 text-2xl font-bold text-brand-800">
          320 <span className="text-sm font-medium text-neutral-700">points</span>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-neutral-100">
          <div className="h-2 rounded-full bg-brand-600" style={{ width: '80%' }} />
        </div>
        <div className="mt-2 text-xs text-neutral-700">120 points avant le prochain palier</div>
        <div className="mt-4 rounded-md bg-brand-50 p-3 text-xs font-medium text-brand-800">
          Récompense débloquée : cadeau exclusif offert
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Réactiver',
    title: "Passez de la donnée à l'action marketing.",
    text: "Ciblez les bons consommateurs, au bon moment. Lancez une campagne en quelques clics ou automatisez vos prises de parole pour relancer, féliciter et réengager chaque segment sans intervention manuelle.",
    visual: (
      <div className="space-y-3">
        <div className="rounded-md bg-white p-4 text-sm shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-700">
            <span>Campagne email</span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5">Premium engagés</span>
          </div>
          <div className="mt-2 font-medium text-neutral-900">Une nouvelle collection arrive vendredi.</div>
        </div>
        <div className="rounded-md bg-white p-4 text-sm shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-700">
            <span>Scénario automatisé</span>
            <span className="text-brand-800">● Actif</span>
          </div>
          <div className="mt-2 font-medium text-neutral-900">Anniversaire du contact → Joyeux anniversaire 🎉</div>
        </div>
      </div>
    ),
  },
] as const;

export function StoryTelling() {
  return (
    <section id="story" className="bg-white py-20 sm:py-28">
      <Container className="space-y-20">
        {ROWS.map((row, index) => (
          <div
            key={row.title}
            className={`grid items-center gap-10 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}
          >
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-800">{row.eyebrow}</div>
              <h3 className="mt-3 text-xl font-semibold text-neutral-950 sm:text-2xl">{row.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-neutral-700">{row.text}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-6">{row.visual}</div>
          </div>
        ))}
      </Container>
    </section>
  );
}
