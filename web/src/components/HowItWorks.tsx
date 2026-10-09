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
    visual: 'scan',
  },
  {
    num: '02',
    title: 'Il rejoint votre univers',
    text: "Votre programme de fidélité et votre page produit personnalisée. Vous identifiez immédiatement le produit acheté grâce au GTIN porté par le QR Code qui s'associe au profil du consommateur.",
    visual: 'club',
  },
  {
    num: '03',
    title: 'Vous créez une relation directe',
    text: 'Un profil consommateur enrichi, exploitable pour vos futures campagnes.',
    visual: 'profile',
  },
  {
    num: '04',
    title: 'Vous réengagez par emailing',
    text: 'Grâce au marketing automation, vous envoyez des campagnes email personnalisées : offres, nouveautés, relances et contenus adaptés au profil.',
    visual: 'email',
  },
] as const;

const phoneShadow = 'drop-shadow-[0_14px_22px_rgba(18,22,26,.16)]';

/* Viewfinder corners of the phone screen in mecanisme-01-scan.webp (386×395 px space). */
const SCAN_BRACKETS = [
  'M253.1 94.8 L231.7 97.3 L235.6 120',
  'M307.6 88.5 L329 86 L332.8 108.5',
  'M345.4 183.5 L350 211 L332.6 213.2',
  'M274.6 220.6 L253.3 223.3 L249.4 200.6',
];

function ScanVisual() {
  return (
    <div className="relative -mx-[30px] -mb-[30px] mt-auto overflow-hidden rounded-b-[19px] pt-2">
      <Image
        src="/assets/mecanisme-01-scan.webp"
        alt="Un smartphone scanne le QR Code GS1 imprimé sur l'étui d'un savon Maison Alba"
        width={386}
        height={395}
        className="h-auto w-full"
      />
      {/* Crisp viewfinder drawn over the photo: corner brackets and a sweeping scan line. */}
      <svg aria-hidden="true" viewBox="0 0 386 395" className="absolute inset-x-0 bottom-0 h-auto w-full">
        <defs>
          <linearGradient id="scan-line" x1="0" x2="1">
            <stop offset="0" stopColor="#00B54D" stopOpacity="0" />
            <stop offset=".5" stopColor="#00B54D" />
            <stop offset="1" stopColor="#00B54D" stopOpacity="0" />
          </linearGradient>
        </defs>
        {SCAN_BRACKETS.map((d) => (
          <path key={d} d={d} fill="none" stroke="#00B54D" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        <line x1="236" y1="104" x2="331" y2="93" stroke="url(#scan-line)" strokeWidth="2.2" strokeLinecap="round" className="motion-reduce:hidden">
          <animate attributeName="y1" values="104;216;104" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="y2" values="93;204;93" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="x1" values="236;256;236" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="x2" values="331;346;331" dur="2.6s" repeatCount="indefinite" />
        </line>
      </svg>
      <span className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/95 py-1.5 pl-1.5 pr-3 text-[11.5px] font-semibold text-neutral-900 shadow-[0_8px_20px_rgba(18,22,26,.16)]">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-scan-green text-white">
          <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 5 5L20 7" />
          </svg>
        </span>
        QR Code GS1 détecté
      </span>
    </div>
  );
}

function ClubVisual() {
  return (
    <div className="mt-auto flex justify-center pt-2">
      <Image
        src="/assets/mecanisme-02-club.webp"
        alt="La page Club Fidélité Maison Alba sur smartphone : savon surgras aux huiles végétales, +50 points de bienvenue et bouton « Rejoindre le club »"
        width={233}
        height={396}
        className={`h-auto w-[74%] max-w-[220px] ${phoneShadow}`}
      />
    </div>
  );
}

const PROFILE_ROWS = [
  ['Produit préféré', 'Savon surgras'],
  ['Segment', 'Adeptes des bons plans'],
  ["Canal d'entrée", 'Scan en magasin'],
  ['Scans', '12'],
] as const;

function ProfileVisual() {
  return (
    <div className="-mx-3 mt-auto pt-2">
      <div className="rounded-2xl border border-neutral-200 bg-white px-3.5 py-3.5 shadow-[0_10px_30px_rgba(18,22,26,.07)]">
        <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3.5">
          <Image src="/assets/mecanisme-03-camille.webp" alt="" width={96} height={96} className="h-12 w-12 shrink-0 rounded-full" />
          <div className="min-w-0">
            <div className="whitespace-nowrap text-[14px] font-semibold text-neutral-950">Camille Rousseau</div>
            <div className="whitespace-nowrap text-[11px] text-neutral-500">Cliente depuis mars 2024</div>
          </div>
        </div>
        <dl className="text-[11.5px]">
          {PROFILE_ROWS.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-2 border-b border-neutral-100 py-2.5">
              <dt className="whitespace-nowrap text-neutral-500">{label}</dt>
              <dd className="text-right font-semibold text-neutral-950">{value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-2 pt-2.5">
            <dt className="text-neutral-500">Statut</dt>
            <dd className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-800">Fidèle</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

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
    label: 'Segmentation automatique',
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

function EmailVisual() {
  return (
    <div className="mt-auto flex items-center justify-center gap-1.5 pt-2">
      <Image
        src="/assets/mecanisme-04-email.webp"
        alt="Un email Maison Alba sur smartphone : « Une attention rien que pour vous », -10 % sur la prochaine commande"
        width={199}
        height={377}
        className={`h-auto w-[56%] max-w-[180px] ${phoneShadow}`}
      />
      {/* Dashed bracket from the email to the automation steps. */}
      <svg aria-hidden="true" width="14" height="150" viewBox="0 0 14 150" fill="none" className="shrink-0 text-scan-green">
        <path d="M13 6H6v138h7" stroke="currentColor" strokeWidth="1.3" strokeDasharray="3 3" />
        <path d="M1 75h9M7 72l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <ol className="flex w-[40%] max-w-[112px] flex-col items-center">
        {EMAIL_FEATURES.map((feature, index) => (
          <li key={feature.label} className="flex w-full flex-col items-center">
            {index > 0 ? (
              <svg aria-hidden="true" width="10" height="14" viewBox="0 0 10 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="my-1 text-scan-green">
                <path d="M5 1v11M1.5 8.5 5 12l3.5-3.5" />
              </svg>
            ) : null}
            <span className="flex w-full flex-col items-center rounded-xl border border-neutral-200 bg-white px-2 py-2.5 text-center text-[10.5px] font-medium leading-snug text-neutral-800 shadow-[0_6px_16px_rgba(18,22,26,.06)]">
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
                className="mb-1 text-scan-green"
              >
                {feature.icon}
              </svg>
              {feature.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const VISUALS = {
  scan: <ScanVisual />,
  club: <ClubVisual />,
  profile: <ProfileVisual />,
  email: <EmailVisual />,
};

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
              {VISUALS[step.visual]}
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
