import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';

const STEPS = [
  { num: '01', text: "Identifiez l'intérêt produit au moment du scan" },
  { num: '02', text: 'Transformez un visiteur anonyme en membre consentant' },
  { num: '03', text: 'Enrichissez automatiquement votre connaissance client' },
  { num: '04', text: 'Activez des campagnes ciblées à partir des comportements réels' },
] as const;

export function HeroStepsStrip() {
  return (
    <section className="relative z-[1] bg-white py-9">
      <Container className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-neutral-200">
        {STEPS.map((step, index) => (
          <Reveal key={step.num} delay={index * 0.08} className="lg:px-7">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-extrabold tracking-[0.02em] text-brand-700">{step.num}</span>
              <span
                aria-hidden="true"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs text-brand-700"
              >
                ↗
              </span>
            </div>
            <p className="mt-2.5 text-sm font-semibold leading-snug text-neutral-950">{step.text}</p>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}
