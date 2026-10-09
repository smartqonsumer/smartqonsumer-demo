import { Container } from '@/components/Container';
import { HeroVideo } from '@/components/HeroVideo';
import styles from './Hero.module.css';

const PROOF_POINTS = ['Connaissance client', 'Engagement client', 'Fidélisation'] as const;

export function Hero() {
  return (
    <section id="hero" className="relative scroll-mt-20 overflow-hidden bg-neutral-950 text-white">
      <div aria-hidden="true" className={styles.modules} />
      <Container className="relative flex flex-col items-center pb-14 pt-[104px] text-center sm:pt-[118px] lg:pb-16">
        <p className={`${styles.in} text-[13px] font-medium uppercase tracking-[0.06em] text-brand-400`} style={{ animationDelay: '.05s' }}>
          CRM nouvelle génération pour la vente indirecte
        </p>
        <h1
          className={`${styles.in} mt-4 text-3xl font-semibold leading-[1.12] tracking-[-0.02em] [text-wrap:balance] sm:text-4xl xl:text-[42px]`}
          style={{ animationDelay: '.15s' }}
        >
          Vos produits se vendent partout.
        </h1>
        <p
          className={`${styles.in} mt-2 text-xl font-medium leading-snug tracking-[-0.01em] text-brand-300 [text-wrap:balance] sm:text-2xl xl:text-[28px]`}
          style={{ animationDelay: '.25s' }}
        >
          <span className={styles.shimmer}>Comprenez et fidélisez vos consommateurs.</span>
        </p>

        {/* Sized from the viewport height so the whole video shows above the fold. */}
        <div
          className={`${styles.in} relative z-[1] mt-8 w-full max-w-[min(100%,calc((100svh-340px)*16/9))] sm:mt-10`}
          style={{ animationDelay: '.35s' }}
        >
          <HeroVideo />
        </div>

        <ul
          className={`${styles.in} mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-neutral-300`}
          style={{ animationDelay: '.45s' }}
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
      </Container>
    </section>
  );
}
