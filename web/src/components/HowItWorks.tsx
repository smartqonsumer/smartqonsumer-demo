import Image from 'next/image';
import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';
import { ProductBand } from '@/components/ProductBand';

const STEPS = [
  {
    num: '01',
    title: 'Le consommateur scanne',
    text: "Il scanne le QR Code augmenté GS1 imprimé sur le produit. L'expérience d'affiliation à votre programme de fidélité démarre.",
    image: { src: '/assets/mecanisme-01.webp', width: 386, height: 462 },
    alt: 'Un smartphone scanne le QR Code « Rejoignez notre club » imprimé sur un étui de savon',
    visual: 'bleed',
  },
  {
    num: '02',
    title: 'Il rejoint votre univers',
    text: "Votre programme de fidélité et votre page produit personnalisée. Vous identifiez immédiatement le produit acheté grâce au GTIN porté par le QR Code qui s'associe au profil du consommateur.",
    image: { src: '/assets/mecanisme-02-phone.webp', width: 250, height: 462 },
    alt: "L'espace Club Fidélité de la marque sur smartphone : solde de points, récompenses exclusives et bouton « Rejoindre le club »",
    visual: 'phone',
  },
  {
    num: '03',
    title: 'Vous créez une relation directe',
    text: 'Un profil consommateur enrichi, exploitable pour vos futures campagnes.',
    image: { src: '/assets/mecanisme-03-profil-camille.webp', width: 314, height: 420 },
    alt: "Fiche consommateur : produit préféré, segment, canal d'entrée, nombre de scans, statut et points de fidélité",
    visual: 'card',
  },
  {
    num: '04',
    title: 'Vous réengagez par emailing',
    text: 'Grâce au marketing automation, vous envoyez des campagnes email personnalisées : offres, nouveautés, relances et contenus adaptés au profil.',
    image: { src: '/assets/mecanisme-04-phone.webp', width: 238, height: 471 },
    alt: 'Un email personnalisé de la marque sur smartphone : une offre exclusive et les nouveautés',
    visual: 'email',
  },
] as const;

const EMAIL_FEATURES = [
  {
    label: 'Campagnes automatisées',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
  },
  {
    label: 'Emails adaptés au profil (offres, nouveautés, relances…)',
    icon: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 20a6 6 0 0 1 12 0M16 4.5a3.2 3.2 0 0 1 0 7M18 14.5a6 6 0 0 1 3 5.5" />
      </>
    ),
  },
  {
    label: 'Suivi des performances',
    icon: <path d="M4 20V14M10 20V9M16 20V12M22 20V4M2 20h21" />,
  },
] as const;

type Step = (typeof STEPS)[number];

function StepVisual({ step }: { step: Step }) {
  const image = (className: string) => (
    <Image src={step.image.src} alt={step.alt} width={step.image.width} height={step.image.height} className={className} />
  );

  if (step.visual === 'bleed') {
    return <div className="-mx-[30px] -mb-[30px] mt-auto overflow-hidden rounded-b-[19px] pt-2">{image('h-auto w-full')}</div>;
  }
  if (step.visual === 'card') {
    return (
      <div className="mt-auto flex justify-center pt-2">
        <div className="w-full max-w-[300px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(18,22,26,.08)]">
          {image('h-auto w-full')}
        </div>
      </div>
    );
  }
  if (step.visual === 'email') {
    return (
      <div className="mt-auto flex items-center justify-center gap-2.5 pt-2">
        {image('h-auto w-[58%] max-w-[190px] drop-shadow-[0_14px_22px_rgba(18,22,26,.16)]')}
        <ul className="flex w-[42%] max-w-[118px] flex-col gap-2.5">
          {EMAIL_FEATURES.map((feature) => (
            <li
              key={feature.label}
              className="rounded-xl border border-neutral-200 bg-white p-2.5 text-[10.5px] font-medium leading-snug text-neutral-800 shadow-[0_6px_16px_rgba(18,22,26,.06)]"
            >
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-1.5 text-scan-green"
              >
                {feature.icon}
              </svg>
              {feature.label}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="mt-auto flex justify-center pt-2">
      {image('h-auto w-[78%] max-w-[230px] drop-shadow-[0_14px_22px_rgba(18,22,26,.16)]')}
    </div>
  );
}

export function HowItWorks() {
  return (
    <ProductBand id="how" variant="club" className="scroll-mt-20 py-[88px] max-md:py-16">
      <Container>
        <SectionHeading pill eyebrow="Le mécanisme" title="Chaque scan devient une opportunité." />

        <div className="mx-auto mt-11 grid max-w-[1240px] gap-[18px] md:grid-cols-2 xl:grid-cols-4 xl:gap-7">
          {STEPS.map((step, index) => (
            <Reveal
              key={step.num}
              delay={index * 0.1}
              className="group relative flex min-h-[280px] flex-col gap-3.5 rounded-[20px] border border-neutral-200 bg-white p-[30px] shadow-sm transition-[transform,box-shadow,border-color] duration-[400ms] ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-2 hover:border-brand-300 hover:shadow-[0_24px_48px_rgba(18,22,26,.14)]"
            >
              <div
                aria-hidden="true"
                className="text-[13px] font-extrabold tracking-[0.6px] text-brand-700 transition-[letter-spacing] duration-[400ms] group-hover:tracking-[1.6px]"
              >
                {step.num}
              </div>
              <h3 className="text-lg font-semibold tracking-[-0.2px] text-neutral-950">{step.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-neutral-600">{step.text}</p>
              <StepVisual step={step} />
              {index < STEPS.length - 1 ? (
                <svg
                  aria-hidden="true"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute -right-[26px] top-[62%] z-10 hidden text-scan-green xl:block"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              ) : null}
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
