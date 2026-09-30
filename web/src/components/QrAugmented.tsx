import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';

const CARDS = [
  {
    tag: '01 · Prioritaire',
    title: 'Votre Club de Fidélité',
    text: "Un club de fidélité à votre image : dès qu'il est actif, il accueille le consommateur et lui propose son parcours membre.",
    active: true,
  },
  {
    tag: '02 · Sinon',
    title: 'Votre page de présentation produit',
    text: 'Une landing page de votre produit, configurée, publiée et suivie directement dans SmartQonsumer.',
    active: false,
  },
  {
    tag: '03 · Sinon',
    title: 'Lien vers une de vos offres existantes',
    text: "Une URL produit de votre écosystème : une redirection vers l'adresse configurée sur le site de votre entreprise.",
    active: false,
  },
] as const;

export function QrAugmented() {
  return (
    <section id="qr-augmente" className="scroll-mt-20 bg-neutral-50 py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-800">Le QR code augmenté</div>
            <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.014em] text-neutral-950 sm:text-3xl">
              Une étiquette imprimée. Des expériences qui évoluent.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-700">
              Le lien reste sur le produit. Vous pilotez ce qui se passe après le scan, selon votre programme et vos
              temps forts.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col items-center gap-3 rounded-lg border border-neutral-200 bg-white p-6 text-center text-sm">
            <div>
              <div className="text-xs font-medium text-neutral-700">Sur votre produit</div>
              <div className="font-semibold text-neutral-900">Scan du QR Code</div>
            </div>
            <span aria-hidden="true" className="text-neutral-400">
              ↓
            </span>
            <code className="rounded-sm bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700">
              qr.smartqonsumer/01/{'{GTIN}'}
            </code>
            <span aria-hidden="true" className="text-neutral-400">
              ↓
            </span>
            <div>
              <div className="font-semibold text-neutral-900">Résolution SaaS</div>
              <div className="text-xs text-neutral-700">Les règles de votre marque décident.</div>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {CARDS.map((card, index) => (
            <Reveal
              key={card.title}
              delay={index * 0.08}
              className={`rounded-lg border p-6 ${
                card.active ? 'border-brand-600 bg-white shadow-lg' : 'border-neutral-200 bg-white'
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-800">{card.tag}</span>
              <h3 className="mt-3 text-base font-semibold text-neutral-950">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">{card.text}</p>
            </Reveal>
          ))}
        </div>

        <p className="mt-10 text-xs leading-relaxed text-neutral-700">
          GS1 Digital Link est le standard utilisé pour le lien produit. Aucune certification GS1 n&rsquo;est
          revendiquée.{' '}
          <a
            href="https://www.gs1.fr/qr-code-augmente-gs1"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-800 hover:text-brand-900"
          >
            Comprendre la transition GS1
          </a>
        </p>
      </Container>
    </section>
  );
}
