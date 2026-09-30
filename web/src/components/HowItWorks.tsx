import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';

const STEPS = [
  {
    num: '01',
    title: 'Le consommateur scanne',
    text: "Il scanne le QR Code augmenté GS1 imprimé sur le produit. Grâce à GS1 Digital Link, ce code 2D contient le GTIN — l'identifiant unique du produit, identique à celui porté par son EAN-13 — et ouvre l'expérience digitale choisie par la marque.",
  },
  {
    num: '02',
    title: 'Il rejoint votre univers',
    text: 'Landing personnalisée, récompense, contenu ou programme de fidélité — à votre image.',
  },
  {
    num: '03',
    title: 'Vous créez une relation directe',
    text: 'Un profil consommateur enrichi, exploitable pour vos futures campagnes.',
  },
  {
    num: '04',
    title: 'Le réachat enrichit la relation',
    text: "Lors d'un nouvel achat, le consommateur présente son QR Code promotionnel. Son utilisation est suivie, rattachée à son profil et ajoute un nouveau signal d'achat à votre base client.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow="Le mécanisme" title="Chaque scan devient une opportunité." />
        <div className="mt-14 grid gap-[18px] md:grid-cols-2">
          {STEPS.map((step, index) => (
            <Reveal
              key={step.num}
              delay={index * 0.1}
              className="group min-h-[220px] rounded-[20px] border border-neutral-200 bg-white p-[30px] shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-2 hover:border-brand-300 hover:shadow-xl"
            >
              <div
                aria-hidden="true"
                className="text-[13px] font-extrabold tracking-[0.6px] text-brand-700 transition-[letter-spacing] duration-300 group-hover:tracking-[1.6px]"
              >
                {step.num}
              </div>
              <h3 className="mt-3.5 text-lg font-semibold tracking-[-0.2px] text-neutral-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">{step.text}</p>
            </Reveal>
          ))}
        </div>
        <a
          href="https://www.gs1.fr/vos-secteurs-dactivite/communaute-dinteret-pgc-dediee-au-qr-code-augmente-gs1"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block text-sm font-medium text-brand-800 hover:text-brand-900"
        >
          QR Code augmenté GS1 et transition 2027&nbsp;↗
        </a>
      </Container>
    </section>
  );
}
