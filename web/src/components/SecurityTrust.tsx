import { Container } from '@/components/Container';
import { IconRow } from '@/components/IconRow';
import { Reveal } from '@/components/Reveal';
import styles from './SecurityTrust.module.css';

const ITEMS = [
  {
    title: 'Un espace pour chaque entreprise',
    text: 'Architecture multi-tenant, séparation des données et des accès, administration par rôles super admin et tenant.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 3 3 8 12 13 21 8 12 3" />
        <polyline points="3 16 12 21 21 16" />
        <polyline points="3 12 12 17 21 12" />
      </svg>
    ),
  },
  {
    title: 'Des accès qui se maîtrisent',
    text: 'Connexion MFA par code OTP, gestion des sessions et contrôle des utilisateurs autorisés.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.5" cy="15.5" r="5.5" />
        <path d="M21 2l-9.6 9.6" />
        <path d="M15.5 7.5l3 3L22 7l-3-3" />
      </svg>
    ),
  },
  {
    title: 'Des connexions qui se suivent',
    text: 'Alertes de connexion et journal des connexions pour accompagner le suivi des accès.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    title: 'Des préférences qui comptent',
    text: 'Consentements, gestion des cookies et parcours RGPD pour accompagner les usages autorisés des données.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <path d="M12 11a2 2 0 0 0-2 2c0 3.5-.5 6-1 7" />
        <path d="M8 12a4 4 0 0 1 8 0c0 1 0 2.5-.3 4" />
        <path d="M5 12a7 7 0 0 1 11.5-5.3" />
        <path d="M4 16c.7-1.5 1-3 1-4" />
        <path d="M19 8a9 9 0 0 1 1 6.5" />
        <path d="M14.5 20c.7-1.2 1-2.5 1.2-3.5" />
      </svg>
    ),
  },
] as const;

export function SecurityTrust() {
  return (
    <section id="security" className={`${styles.band} scroll-mt-20 py-20 text-white sm:py-28`}>
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <Reveal>
          <div className="grid h-[52px] w-[52px] place-items-center rounded-2xl bg-white/10 text-brand-300">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 2.5 5 5.8v5.6c0 5 3 8.4 7 9.9 4-1.5 7-4.9 7-9.9V5.8L12 2.5Z" />
              <path d="M9 12.2l2 2 4-4.2" />
            </svg>
          </div>
          <div className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-brand-300">
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
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-300 hover:text-brand-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2.5 5 5.8v5.6c0 5 3 8.4 7 9.9 4-1.5 7-4.9 7-9.9V5.8L12 2.5Z" />
              <path d="M9 12.2l2 2 4-4.2" />
            </svg>
            Consulter les informations RGPD
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <div className="mt-8 flex max-w-[360px] items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3.5">
            <div className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bg-white/10 text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M6.5 17a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 16.4 8.1 4.5 4.5 0 0 1 16.5 17h-10z" />
                <path d="m10 13.2 1.6 1.6 3-3.2" />
              </svg>
            </div>
            <div>
              <b className="block text-[12.5px] font-bold text-white">Cloudflare</b>
              <span className="text-[11.5px] leading-tight text-neutral-400">
                Protection anti-robots et contrôle des autorisations dans les parcours concernés.
              </span>
            </div>
          </div>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2">
          {ITEMS.map((item, index) => (
            <Reveal key={item.title} small delay={index * 0.06}>
              <IconRow
                icon={item.icon}
                title={item.title}
                text={item.text}
                titleClassName="text-white"
                textClassName="text-neutral-400"
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
