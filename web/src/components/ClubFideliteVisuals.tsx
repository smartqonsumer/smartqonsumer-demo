import { ArrowRightIcon } from '@/components/icons';

/** The member-facing phone screen, ported from the legacy static site's `.club-promo-phone`. */
export function MemberPhoneMockup() {
  return (
    <div className="w-[212px] flex-none rounded-[32px] bg-neutral-950 p-2.5 shadow-lg">
      <div className="mx-auto mb-2 mt-1 h-[5px] w-14 rounded-[3px] bg-white/25" />
      <div className="flex flex-col rounded-3xl bg-white px-[15px] py-[18px]">
        <div className="mb-2.5 text-right text-[9.5px] font-extrabold uppercase tracking-[.5px] text-neutral-600">
          Le Club
        </div>
        <div className="mb-2 text-[14.5px] font-bold text-neutral-950">
          Bonjour Camille <span className="text-brand-700">✦</span>
        </div>
        <span className="mb-3 inline-block w-fit rounded-full bg-brand-50 px-2.5 py-0.5 text-[11.5px] font-semibold text-brand-700">
          Découvreur
        </span>
        <div className="mb-2 flex items-baseline gap-1.5">
          <b className="text-[32px] font-extrabold tracking-[-1px] text-neutral-950">120</b>
          <span className="text-[11.5px] text-neutral-600">points</span>
        </div>
        <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-neutral-100">
          <span className="block h-full w-4/5 rounded-full bg-gradient-to-r from-brand-600 to-brand-400" />
        </div>
        <div className="mb-3.5 text-[10px] text-neutral-600">Encore 30 points avant le prochain palier</div>
        <div className="mb-1.5 border-t border-neutral-200 pt-2.5 text-[10.5px] font-extrabold text-neutral-950">
          Vos derniers points
        </div>
        {[
          ['Scan produit', '+20'],
          ['Profil complété', '+30'],
          ['Inscription au Club', '+70'],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between py-[3px] text-[11px] text-neutral-950">
            <span>{label}</span>
            <b className="font-bold text-brand-700">{value}</b>
          </div>
        ))}
        <div className="mt-2.5 flex items-center gap-2.5 rounded-xl bg-neutral-50 p-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0 text-brand-700">
            <rect x="3" y="8" width="18" height="4" rx="1" />
            <rect x="5" y="12" width="14" height="8" rx="1" />
            <path d="M12 8v12M12 8c-1.6-3.2-5.2-3-5.2-1s2 1 5.2 1M12 8c1.6-3.2 5.2-3 5.2-1s-2 1-5.2 1" />
          </svg>
          <div>
            <b className="block text-[10.5px] text-neutral-950">Votre prochaine découverte</b>
            <span className="text-[9.5px] text-neutral-600">Explorer les récompenses</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The tenant-side stats panel, ported from `.club-promo-tenant`. */
export function TenantPanel() {
  return (
    <div className="min-w-0 flex-1 rounded-[18px] border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[.5px] text-neutral-600">
        Vue tenant · Votre marque
      </div>
      <h4 className="mb-[18px] text-lg font-bold tracking-[-0.3px] text-neutral-950">Le programme, sous vos yeux.</h4>
      <div className="mb-4 grid grid-cols-2 gap-x-5 gap-y-4">
        {[
          ['84', 'inscriptions'],
          ['52', 'membres engagés'],
          ['6 400', 'points distribués'],
          ['2 100', 'points utilisés'],
        ].map(([value, label]) => (
          <div key={label}>
            <b className="block text-[23px] font-extrabold tracking-[-0.5px] text-neutral-950">{value}</b>
            <span className="text-[11px] text-neutral-600">{label}</span>
          </div>
        ))}
      </div>
      <div className="mb-4 h-px bg-neutral-200" />
      <div className="mb-2 flex items-center gap-3">
        <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[11px] bg-neutral-100 text-brand-700">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="3" height="3" />
            <rect x="18" y="14" width="3" height="3" />
            <rect x="14" y="18" width="3" height="3" />
            <rect x="18" y="18" width="3" height="3" />
          </svg>
        </div>
        <div>
          <h5 className="text-[14.5px] font-semibold text-neutral-950">Récompenses</h5>
          <span className="text-xs text-neutral-600">21 obtenues · 16 consommées</span>
        </div>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-neutral-600">
        Transformée en QR Code à usage unique, vérifiée par SmartQonsumer au moment du scan en point de vente.
      </p>
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">Émis</span>
        <ArrowRightIcon className="h-3 w-3 text-neutral-500" />
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">Présenté</span>
        <ArrowRightIcon className="h-3 w-3 text-neutral-500" />
        <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-800">Consommé</span>
      </div>
      <div className="mb-2.5 text-[11px] text-neutral-500">Ou expiré si la période de validité est dépassée.</div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-950">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-brand-600">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Inscription et consentements distincts
      </div>
    </div>
  );
}
