import { Container } from '@/components/Container';
import { siteConfig } from '@/lib/site-config';

const PROOF_POINTS = ['Connaissance client', 'Engagement client', 'Fidélisation'] as const;

export function Hero() {
  return (
    <section id="hero" className="overflow-hidden bg-gradient-to-b from-brand-50 to-white py-16 sm:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-800">
            CRM nouvelle génération pour la vente indirecte
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-[-0.022em] text-neutral-950 sm:text-5xl">
            Vous vendez vos produits partout.
            <br />
            Enfin, sachez qui les achète.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-700">
            SmartQonsumer vous permet de passer d&rsquo;une connaissance limitée de vos consommateurs à une relation
            directe avec eux. Chaque interaction avec vos produits enrichit leur profil dans la plateforme et vous
            permet ensuite de communiquer avec eux de manière ciblée et automatisée.
          </p>
          <div className="mt-8">
            <a
              href={siteConfig.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-sm bg-brand-700 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-800"
            >
              Nous contacter
            </a>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-neutral-700">
            {PROOF_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-brand-600">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl">
            <video
              className="aspect-[1400/787] w-full"
              width={1400}
              height={787}
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              poster="/assets/SmartQonsumeR-home-v1-cover.png"
              aria-label="Présentation de SmartQonsumer"
            >
              <source src="/assets/SmartQonsumeR-home-v1.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </Container>
    </section>
  );
}
