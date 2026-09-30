import { Container } from '@/components/Container';

const STEPS = [
  { num: '01', text: "Identifiez l'intérêt produit au moment du scan" },
  { num: '02', text: 'Transformez un visiteur anonyme en membre consentant' },
  { num: '03', text: 'Enrichissez automatiquement votre connaissance client' },
  { num: '04', text: 'Activez des campagnes ciblées à partir des comportements réels' },
] as const;

export function HeroStepsStrip() {
  return (
    <section className="border-y border-neutral-200 bg-neutral-50 py-10">
      <Container className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.num}>
            <div className="flex items-center justify-between text-brand-800">
              <span className="text-sm font-bold">{step.num}</span>
              <span aria-hidden="true">↗</span>
            </div>
            <p className="mt-2 text-sm leading-snug text-neutral-700">{step.text}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
