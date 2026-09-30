import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';

const ITEMS = [
  {
    title: 'Un espace pour chaque entreprise',
    text: 'Architecture multi-tenant, séparation des données et des accès, administration par rôles Super Admin et Tenant.',
  },
  {
    title: 'Des accès qui se maîtrisent',
    text: 'Connexion MFA par code OTP, gestion des sessions et contrôle des utilisateurs autorisés.',
  },
  {
    title: 'Des connexions qui se suivent',
    text: 'Alertes de connexion et journal des connexions pour accompagner le suivi des accès.',
  },
  {
    title: 'Des préférences qui comptent',
    text: 'Consentements, gestion des cookies et parcours RGPD pour accompagner les usages autorisés des données.',
  },
] as const;

export function SecurityTrust() {
  return (
    <section id="security" className="scroll-mt-20 bg-neutral-950 py-20 text-white sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <Reveal>
          <div className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-300">
            La confiance fait partie du parcours
          </div>
          <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.014em] sm:text-3xl">
            La relation client commence par le respect des données.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-300">
            Des espaces distincts, des accès définis et des consentements pris en compte. Une base pour organiser vos
            usages en responsabilité.
          </p>
          <a
            href="/legal/rgpd/"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-300 hover:text-brand-200"
          >
            Consulter les informations RGPD →
          </a>
          <div className="mt-8 flex items-start gap-3 rounded-md border border-white/10 bg-white/5 p-4">
            <div>
              <div className="font-semibold text-white">Cloudflare</div>
              <div className="text-sm text-neutral-400">
                Protection anti-robots et contrôle des autorisations dans les parcours concernés.
              </div>
            </div>
          </div>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2">
          {ITEMS.map((item, index) => (
            <Reveal key={item.title} small delay={index * 0.06}>
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{item.text}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
