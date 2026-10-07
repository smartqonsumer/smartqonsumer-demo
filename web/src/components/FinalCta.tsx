import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';
import { siteConfig } from '@/lib/site-config';
import styles from './FinalCta.module.css';

export function FinalCta() {
  return (
    <section className={`${styles.band} py-20 text-center text-white sm:py-28`}>
      <Container className="flex flex-col items-center">
        <Reveal as="span" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden="true" />
          La prochaine étape se construit ensemble
        </Reveal>
        <Reveal as="h2" delay={0.06} className="mt-6 text-2xl font-semibold leading-tight sm:text-3xl">
          Faites de chaque produit
          <br />
          un point de départ pour la fidélisation.
        </Reveal>
        <Reveal delay={0.12} className="mt-4 max-w-xl text-base leading-relaxed text-brand-100">
          Découvrez comment connecter vos QR Codes, enrichir votre CRM et activer vos campagnes dans un même
          parcours.
        </Reveal>
        <Reveal
          delay={0.18}
          className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-brand-100"
        >
          <span>QR Codes</span>
          <span aria-hidden="true">→</span>
          <span>CRM</span>
          <span aria-hidden="true">→</span>
          <span>Campagnes</span>
        </Reveal>
        <Reveal delay={0.24}>
          <a
            href={siteConfig.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center rounded-sm bg-white px-6 py-3.5 text-base font-semibold text-brand-900 transition-colors hover:bg-brand-50"
          >
            Contacter l&apos;équipe commerciale
          </a>
        </Reveal>
      </Container>
    </section>
  );
}
