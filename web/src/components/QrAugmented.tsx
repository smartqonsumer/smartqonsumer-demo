import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';

const CARDS = [
  {
    tag: '01 · Prioritaire',
    title: 'Votre Club de Fidélité',
    text: "Un club de fidélité à votre image : dès qu'il est actif, il accueille le consommateur et lui propose son parcours membre.",
    foot: 'La relation commence ici',
    active: true,
  },
  {
    tag: '02 · Sinon',
    title: 'Votre page de présentation produit',
    text: 'Une landing page de votre produit, configurée, publiée et suivie directement dans SmartQonsumer.',
    foot: 'La bonne information produit',
    active: false,
  },
  {
    tag: '03 · Sinon',
    title: 'Lien vers une de vos offres existantes',
    text: "Une URL produit de votre écosystème : une redirection vers l'adresse configurée sur le site de votre entreprise.",
    foot: 'Votre écosystème reste connecté',
    active: false,
  },
] as const;

export function QrAugmented() {
  return (
    <section id="qr-augmente" className="qr-aug-dots relative scroll-mt-20 overflow-hidden bg-neutral-50 py-20 sm:py-28">
      <Container className="relative z-[1]">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-800">
              <span aria-hidden="true" className="h-[7px] w-[7px] shrink-0 rounded-[2px] bg-brand-700" />
              Le QR code augmenté
            </div>
            <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.014em] text-neutral-950 sm:text-3xl">
              Une étiquette imprimée. Des expériences qui évoluent.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-700">
              Le lien reste sur le produit. Vous pilotez ce qui se passe après le scan, selon votre programme et vos
              temps forts.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col items-stretch">
            <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-neutral-200 text-neutral-950">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="3" height="3" />
                  <rect x="18" y="14" width="3" height="3" />
                  <rect x="14" y="18" width="3" height="3" />
                  <rect x="18" y="18" width="3" height="3" />
                </svg>
              </div>
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-[.5px] text-neutral-600">
                  Sur votre produit
                </div>
                <div className="text-base font-bold tracking-[-0.1px] text-neutral-950">Scan du QR Code</div>
              </div>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="ml-auto shrink-0 text-neutral-600">
                <path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3" />
              </svg>
            </div>

            <span aria-hidden="true" className="py-1.5 text-center text-base leading-none text-brand-700/55">
              ↓
            </span>

            <div className="flex items-center gap-2.5 rounded-xl bg-neutral-100 px-5 py-3.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0 text-brand-700">
                <path d="M10 13a5 5 0 0 0 7.07 0l1.93-1.93a5 5 0 0 0-7.07-7.07L10.5 5.46" />
                <path d="M14 11a5 5 0 0 0-7.07 0L4.93 12.93a5 5 0 0 0 7.07 7.07L13.46 18.5" />
              </svg>
              <code className="font-mono text-[13.5px] text-neutral-950">qr.smartqonsumer/01/{'{GTIN}'}</code>
            </div>

            <span aria-hidden="true" className="py-1.5 text-center text-base leading-none text-brand-700/55">
              ↓
            </span>

            <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-neutral-950 text-lg font-extrabold text-white">
                Q
              </div>
              <div>
                <div className="text-base font-bold tracking-[-0.1px] text-neutral-950">Résolution SaaS</div>
                <div className="text-[12.5px] text-neutral-600">Les règles de votre marque décident.</div>
              </div>
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
              <span className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-neutral-950">
                {card.foot}
                {card.active ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17 17 7M7 7h10v10" />
                  </svg>
                ) : null}
              </span>
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
