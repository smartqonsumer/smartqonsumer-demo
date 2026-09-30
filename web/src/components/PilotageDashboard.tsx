import { Container } from '@/components/Container';
import { Counter } from '@/components/Counter';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';

const KPIS = [
  { label: 'Contacts connus', value: 248, suffix: '', hint: 'dont 36 nouveaux' },
  { label: 'Scans totaux', value: 420, suffix: '', hint: '310 scans uniques' },
  { label: 'Scan → inscription', value: 18, suffix: ' %', hint: 'sur la période illustrée' },
] as const;

const TOP_PRODUCTS = [
  { label: 'Édition Limitée n°4', value: 210, pct: 100 },
  { label: 'Coffret Découverte', value: 130, pct: 62 },
  { label: 'Produit exemple', value: 80, pct: 38 },
] as const;

const SEGMENTS = [
  { label: 'Adeptes des bons plans', pct: 45, color: 'bg-brand-700' },
  { label: 'Ambassadeurs de la marque', pct: 35, color: 'bg-brand-500' },
  { label: 'Premium engagés', pct: 20, color: 'bg-brand-300' },
] as const;

const STRIP = [
  { label: 'Engagement fidélité', value: '52 membres actifs' },
  { label: 'Ouverture des campagnes', value: '32 %' },
  { label: 'Total de points attribués', value: '6 400 points' },
  { label: "Proches d'une récompense", value: '18 membres' },
] as const;

export function PilotageDashboard() {
  return (
    <section id="pilotage" className="product-band product-band-pilot scroll-mt-20 pb-[52px] pt-[88px] max-md:pb-10 max-md:pt-16">
      <Container>
        <SectionHeading
          pill
          eyebrow="Le pilotage, en continu"
          title="Voyez ce qui crée de l'intérêt. Décidez de la suite."
          description="Reliez les scans, l'engagement du Club et les campagnes. Des indicateurs pour comprendre le parcours et préparer votre prochaine action."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {KPIS.map((kpi, index) => (
            <Reveal key={kpi.label} delay={index * 0.06} className="rounded-lg border border-neutral-200 p-6">
              <div className="text-sm text-neutral-700">{kpi.label}</div>
              <div className="mt-1 text-3xl font-bold text-neutral-950">
                <Counter value={kpi.value} suffix={kpi.suffix} />
              </div>
              <div className="mt-1 text-xs text-neutral-700">{kpi.hint}</div>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Reveal className="rounded-lg border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-neutral-950">Produits les plus scannés</h3>
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">
                Exemple · Septembre
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {TOP_PRODUCTS.map((product) => (
                <div key={product.label}>
                  <div className="flex items-center justify-between text-sm text-neutral-700">
                    <span>{product.label}</span>
                    <span className="font-semibold">{product.value}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-neutral-100">
                    <div className="h-2 rounded-full bg-brand-600" style={{ width: `${product.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-neutral-700">Performance par produit · Scans totaux et uniques</p>
          </Reveal>

          <Reveal delay={0.06} className="rounded-lg border border-neutral-200 p-6">
            <h3 className="text-base font-semibold text-neutral-950">Segments &amp; personas</h3>
            <div className="mt-5 space-y-3">
              {SEGMENTS.map((segment) => (
                <div key={segment.label} className="flex items-center gap-3 text-sm text-neutral-700">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${segment.color}`} aria-hidden="true" />
                  <span className="flex-1">{segment.label}</span>
                  <span className="font-semibold text-neutral-950">{segment.pct} %</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-neutral-700">Personas déterminés par les règles de votre équipe</p>
          </Reveal>
        </div>

        <Reveal className="mt-6 grid gap-4 rounded-lg bg-neutral-50 p-6 sm:grid-cols-4">
          {STRIP.map((item) => (
            <div key={item.label}>
              <div className="text-xs text-neutral-700">{item.label}</div>
              <div className="mt-1 text-sm font-semibold text-neutral-950">{item.value}</div>
            </div>
          ))}
        </Reveal>
        <p className="mt-4 text-xs text-neutral-700">
          Toutes les valeurs de ce tableau sont fictives. Elles illustrent les indicateurs du produit, pas des
          résultats clients.
        </p>
      </Container>
    </section>
  );
}
