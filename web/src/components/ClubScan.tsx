import Image from 'next/image';
import { Container } from '@/components/Container';
import { IconRow } from '@/components/IconRow';
import { Reveal } from '@/components/Reveal';
import styles from './ClubScan.module.css';
import headingStyles from './SectionHeading.module.css';

const ITEMS = [
  {
    title: 'Récompenses exclusives',
    text: 'Offres, avantages et cadeaux réservés à vos membres.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <rect x="5" y="12" width="14" height="8" rx="1" />
        <path d="M12 8v12M12 8c-1.6-3.2-5.2-3-5.2-1s2 1 5.2 1M12 8c1.6-3.2 5.2-3 5.2-1s-2 1-5.2 1" />
      </svg>
    ),
  },
  {
    title: 'Relation directe avec votre marque',
    text: 'Un nouveau point de contact pour engager vos consommateurs.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
      </svg>
    ),
  },
  {
    title: 'Événements spéciaux',
    text: 'Invitations, temps forts et activations réservées à votre communauté.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" />
      </svg>
    ),
  },
] as const;

/** "Un scan. Une relation qui commence." — Club Fidélité entry point after the scan. */
export function ClubScan() {
  return (
    <section
      id="club-fidelite"
      className={`${styles.dots} relative scroll-mt-20 overflow-hidden bg-neutral-50 py-20 sm:py-28`}
    >
      <Container className="relative z-[1]">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <Reveal>
            <span className={`${headingStyles.pill} text-xs font-bold uppercase tracking-[0.1em] text-brand-800`}>
              Le Club Fidélité
            </span>
            <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.014em] text-scan-navy sm:text-3xl">
              Un scan. Une relation qui commence.
            </h2>
            <p className="mt-4 max-w-[520px] text-base leading-relaxed text-neutral-700">
              Scannez le QR code sur votre produit et redirigez vos consommateurs vers votre Club de Fidélité. Une
              manière simple de prolonger l&apos;expérience, d&apos;activer vos récompenses et de créer une relation
              directe avec votre marque.
            </p>

            <div className="mt-8 flex flex-col gap-6">
              {ITEMS.map((item) => (
                <IconRow
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  text={item.text}
                  titleClassName="text-scan-navy"
                  iconClassName="h-[46px] w-[46px] rounded-xl bg-white text-scan-green shadow-sm"
                />
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4 rounded-2xl bg-brand-700 px-5 py-4 shadow-[0_10px_24px_rgba(31,132,67,.22)]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="shrink-0 text-white">
                <path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3" />
                <rect x="8" y="8" width="3" height="3" />
                <rect x="13" y="8" width="3" height="3" />
                <rect x="8" y="13" width="3" height="3" />
                <path d="M13 13h3v3h-3z" />
              </svg>
              <span aria-hidden="true" className="h-8 w-px shrink-0 bg-white/40" />
              <p className="text-[15px] font-semibold leading-snug text-white">
                Après le scan, vos consommateurs rejoignent <br className="hidden sm:inline" />
                <span className="whitespace-nowrap">votre Club de Fidélité</span>
              </p>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-neutral-600">
              SmartQonsumer s&apos;appuie sur son propre resolver d&apos;URLs, compatible avec{' '}
              <a
                href="https://www.gs1.fr/qr-code-augmente-gs1"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-scan-green-ink underline hover:text-scan-navy"
              >
                GS1 Digital Link
              </a>
              , pour gérer le lien produit.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <Image
              src="/assets/club-fidelite-maison-alba-v3.webp"
              alt="Un étui de savon artisanal avec un QR Code « Rejoignez notre club », scanné par un smartphone qui ouvre l'espace Club Fidélité de la marque : solde de points, récompenses exclusives et événements spéciaux"
              width={750}
              height={608}
              className="mx-auto h-auto w-full max-w-[620px] mix-blend-multiply"
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
