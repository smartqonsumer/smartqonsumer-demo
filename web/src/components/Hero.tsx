import { Container } from '@/components/Container';
import { siteConfig } from '@/lib/site-config';

const PROOF_POINTS = ['Connaissance client', 'Engagement client', 'Fidélisation'] as const;

export function Hero() {
  return (
    <section id="hero" className="relative scroll-mt-20 overflow-hidden bg-neutral-950 text-white">
      <div aria-hidden="true" className="hero-modules" />
      <Container className="relative grid gap-10 pb-16 pt-[122px] sm:pb-20 sm:pt-[150px] lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10 lg:pb-24">
        <div>
          <p className="hero-in text-xs font-bold uppercase tracking-[0.1em] text-brand-400" style={{ animationDelay: '.05s' }}>
            CRM nouvelle génération pour la vente indirecte
          </p>
          <h1
            className="hero-in hero-title-shine mt-3.5 text-4xl font-bold leading-[1.1] tracking-[-0.022em] sm:text-5xl"
            style={{ animationDelay: '.15s' }}
          >
            Vous vendez vos produits partout.
            <br />
            Enfin, sachez qui les achète.
          </h1>
          <p
            className="hero-in mt-[18px] max-w-xl text-lg leading-relaxed text-neutral-300"
            style={{ animationDelay: '.28s' }}
          >
            SmartQonsumer vous permet de passer d&apos;une connaissance limitée de vos consommateurs à une relation
            directe avec eux. Chaque interaction avec vos produits enrichit leur profil dans la plateforme et vous
            permet ensuite de communiquer avec eux de manière ciblée et automatisée.
          </p>
          <div className="hero-in mt-[26px] flex flex-wrap items-center gap-3" style={{ animationDelay: '.4s' }}>
            <a
              href={siteConfig.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-sm bg-brand-700 px-[18px] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-800"
            >
              Nous contacter
            </a>
          </div>
          <ul
            className="hero-in mt-[26px] flex flex-wrap gap-5 text-xs text-neutral-400"
            style={{ animationDelay: '.5s' }}
          >
            {PROOF_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-brand-400">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-in relative z-[1] flex flex-col gap-3" style={{ animationDelay: '.55s' }}>
          <div className="overflow-hidden rounded-lg bg-white shadow-xl">
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
