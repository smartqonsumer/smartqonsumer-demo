import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';
import { CrmCard, PhoneMockup, QrScanVisual, RepurchaseFlow } from '@/components/HowItWorksVisuals';
import { ProductBand } from '@/components/ProductBand';

const STEPS = [
  {
    num: '01',
    title: 'Le consommateur scanne',
    text: "Il scanne le QR Code augmenté GS1 imprimé sur le produit. L'expérience d'affiliation à votre programme de fidélité démarre.",
    visual: <QrScanVisual />,
  },
  {
    num: '02',
    title: 'Il rejoint votre univers',
    text: "Votre programme de fidélité et votre page produit personnalisée. Vous identifiez immédiatement le produit acheté grâce au GTIN porté par le QR Code qui s'associe au profil du consommateur.",
    visual: <PhoneMockup />,
  },
  {
    num: '03',
    title: 'Vous créez une relation directe',
    text: 'Un profil consommateur enrichi, exploitable pour vos futures campagnes.',
    visual: <CrmCard />,
  },
  {
    num: '04',
    title: 'Le réachat enrichit la relation',
    text: "Lors d'un nouvel achat, le consommateur présente son QR Code promotionnel. Son utilisation est suivie, rattachée à son profil et ajoute un nouveau signal d'achat à votre base client.",
    visual: <RepurchaseFlow />,
  },
] as const;

export function HowItWorks() {
  return (
    <ProductBand id="how" variant="club" className="scroll-mt-20 py-[88px] max-md:py-16">
      <Container>
        <SectionHeading pill eyebrow="Le mécanisme" title="Chaque scan devient une opportunité." />

        <div className="mx-auto mt-11 grid max-w-[1240px] gap-[18px] md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((step, index) => (
            <Reveal
              key={step.num}
              delay={index * 0.1}
              className="group flex min-h-[280px] flex-col gap-3.5 rounded-[20px] border border-neutral-200 bg-white p-[30px] shadow-sm transition-[transform,box-shadow,border-color] duration-[400ms] ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-2 hover:border-brand-300 hover:shadow-[0_24px_48px_rgba(18,22,26,.14)]"
            >
              <div
                aria-hidden="true"
                className="text-[13px] font-extrabold tracking-[0.6px] text-brand-700 transition-[letter-spacing] duration-[400ms] group-hover:tracking-[1.6px]"
              >
                {step.num}
              </div>
              <h3 className="text-lg font-semibold tracking-[-0.2px] text-neutral-950">{step.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-neutral-600">{step.text}</p>
              <div className="mt-1 flex flex-1 items-center justify-center pb-2">{step.visual}</div>
            </Reveal>
          ))}
        </div>

        <a
          href="https://www.gs1.fr/vos-secteurs-dactivite/communaute-dinteret-pgc-dediee-au-qr-code-augmente-gs1"
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto mt-8 block w-fit text-sm font-medium text-brand-800 hover:text-brand-900 hover:underline"
        >
          QR Code augmenté GS1 et transition 2027&nbsp;↗
        </a>
      </Container>
    </ProductBand>
  );
}
