/** Small illustrative mockups for each of the 4 "how it works" steps, ported from the legacy static site. */
import styles from './HowItWorksVisuals.module.css';

const SECTORS = [
  { title: 'Boissons artisanales', path: 'M9 2h6v3l2 3v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8l2-3V2z' },
  { title: 'Petfood premium', path: 'M7 8c0-3 2-5 5-5s5 2 5 5v9a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3V8zM9.5 8h5' },
  { title: 'Chocolaterie & confiserie', path: 'M4 8h16v9H4zM8 8v9M12 8v9M16 8v9M4 12.5h16' },
  { title: 'Épicerie fine', path: 'M9 3h6v3H9zM8 6h8l1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L8 6z' },
  { title: 'Cosmétique naturelle', path: 'M8 9h8v12H8zM11 9V6.5a1 1 0 0 1 1-1 1 1 0 0 1 1 1V9M9.5 4h5' },
] as const;

export function QrScanVisual() {
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="relative grid h-[88px] w-[88px] place-items-center rounded-[18px] bg-white text-neutral-950 shadow-[0_14px_32px_rgba(18,22,26,.18)] transition-transform duration-[400ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:-translate-y-1 group-hover:scale-[1.03]">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="3" height="3" />
          <rect x="18" y="14" width="3" height="3" />
          <rect x="14" y="18" width="3" height="3" />
          <rect x="18" y="18" width="3" height="3" />
        </svg>
        <div className="pointer-events-none absolute -inset-3.5" aria-hidden="true">
          <i className="absolute left-0 top-0 h-4 w-4 rounded-tl-[5px] border-[2.5px] border-b-0 border-r-0 border-brand-600" />
          <i className="absolute right-0 top-0 h-4 w-4 rounded-tr-[5px] border-[2.5px] border-b-0 border-l-0 border-brand-600" />
          <i className="absolute bottom-0 left-0 h-4 w-4 rounded-bl-[5px] border-[2.5px] border-r-0 border-t-0 border-brand-600" />
          <i className="absolute bottom-0 right-0 h-4 w-4 rounded-br-[5px] border-[2.5px] border-l-0 border-t-0 border-brand-600" />
          <span className={`${styles.scanLine} absolute left-1 right-1 top-1.5 h-0.5 bg-gradient-to-r from-transparent via-brand-600 to-transparent`} />
        </div>
      </div>
      <div className="flex gap-2.5">
        {SECTORS.map((sector) => (
          <span
            key={sector.title}
            title={sector.title}
            className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-brand-50 text-brand-700"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d={sector.path} />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

export function PhoneMockup() {
  return (
    <div className="h-[264px] w-[132px] rounded-[20px] bg-neutral-950 p-1.5 shadow-[0_18px_36px_rgba(18,22,26,.3)] transition-transform duration-[400ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:-translate-y-1 group-hover:scale-[1.03]">
      <div className="flex h-full flex-col overflow-hidden rounded-[14px] bg-white">
        <div className="flex h-[76px] flex-col items-center justify-center gap-1.5 bg-[linear-gradient(150deg,theme(colors.neutral.900),theme(colors.brand.800))] p-3">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-white">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2 2 7l10 5 10-5-10-5Z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </span>
          <b className="block whitespace-nowrap text-[10px] uppercase tracking-[.4px] text-white">Votre marque</b>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-2.5">
          <div className="h-14 flex-none rounded-[10px] bg-gradient-to-br from-brand-50 to-neutral-100" />
          <i className="block h-1.5 w-[78%] rounded-full bg-neutral-100" />
          <i className="block h-1.5 w-[52%] rounded-full bg-neutral-100" />
          <div className="flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1.5 text-[8.5px] font-extrabold text-brand-700">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <path d="M12 2l2.9 6.3 6.9.9-5 4.8 1.2 6.9L12 17.8 5.9 21l1.2-6.9-5-4.8 6.9-.9L12 2z" />
            </svg>
            +50 points de bienvenue
          </div>
          <div className="mt-auto rounded-lg bg-brand-600 py-2 text-center text-[9.5px] font-extrabold text-white">
            Rejoindre le club
          </div>
        </div>
      </div>
    </div>
  );
}

const CRM_ROWS = [
  ['Produit préféré', 'Produit exemple'],
  ['Segment', 'Adeptes des bons plans'],
  ["Canal d'entrée", 'Scan en magasin'],
  ['Scans', '12'],
  ['Statut', 'Fidèle'],
] as const;

export function CrmCard() {
  return (
    <div className="w-[246px] rounded-lg border border-neutral-200 bg-white p-4 text-left shadow-sm transition-transform duration-[400ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:-translate-y-1 group-hover:scale-[1.03]">
      {CRM_ROWS.map(([label, value], index) => (
        <div
          key={label}
          className={`flex justify-between py-1.5 text-[11.5px] ${
            index < CRM_ROWS.length - 1 ? 'border-b border-neutral-100' : ''
          }`}
        >
          <span className="text-neutral-600">{label}</span>
          <b className="text-neutral-950">{value}</b>
        </div>
      ))}
    </div>
  );
}

export function RepurchaseFlow() {
  return (
    <div className="flex w-full items-center justify-center gap-2.5">
      <div className="min-h-[108px] w-[90px] rounded-xl border border-dashed border-brand-700 bg-white p-2 text-center shadow-sm">
        <span className="block text-[7px] font-extrabold tracking-[.6px] text-neutral-600">OFFRE FIDÉLITÉ</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto my-2 block h-[34px] w-[34px] text-neutral-950">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="3" height="3" />
          <rect x="18" y="14" width="3" height="3" />
          <rect x="14" y="18" width="3" height="3" />
          <rect x="18" y="18" width="3" height="3" />
        </svg>
        <b className="text-lg text-brand-700">−10%</b>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px] shrink-0 text-brand-700">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
      <div className="w-[104px] rounded-xl bg-neutral-950 p-2.5 text-white shadow-md">
        <b className="mb-2 block text-[10px] leading-tight">Profil client enrichi</b>
        <span className="mt-1.5 block rounded-md bg-white/10 px-1.5 py-1 text-[8px] leading-tight">+1 réachat suivi</span>
        <span className="mt-1.5 block rounded-md bg-white/10 px-1.5 py-1 text-[8px] leading-tight">Offre utilisée</span>
      </div>
    </div>
  );
}
