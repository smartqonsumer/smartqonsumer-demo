import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalLayout } from '@/components/LegalLayout';
import { LegalCallout } from '@/components/LegalCallout';
import { legalPageMetadata } from '@/lib/metadata';
import { legalConfig } from '@/lib/site-config';

export const metadata: Metadata = legalPageMetadata({
  title: 'Informations RGPD',
  description:
    'Les principes RGPD retenus pour la plateforme SmartQonsumer : rôles, séparation des données, accès, sous-traitants et exercice de vos droits.',
  path: '/legal/rgpd/',
});

const TOC = [
  ['roles', 'Qui fait quoi : responsable et sous-traitant'],
  ['architecture', 'Un espace pour chaque entreprise'],
  ['acces', 'Des accès qui se maîtrisent'],
  ['suivi', 'Des connexions qui se suivent'],
  ['preferences', 'Des préférences qui comptent'],
  ['sous-traitants', 'Sous-traitants et hébergement'],
  ['droits', 'Exercer un droit RGPD'],
  ['violation', 'Gestion des violations de données'],
  ['contact', 'Contact'],
] as const;

export default function RgpdPage() {
  const { email } = legalConfig;

  return (
    <LegalLayout eyebrow="Confiance & conformité" title="Informations RGPD" updated={legalConfig.updated}>
      <LegalCallout>
        La plateforme SmartQonsumer est en cours de développement et n&apos;est pas encore commercialisée. Cette
        page présente les principes de protection des données retenus dès sa conception ; ils seront formalisés
        dans le contrat de traitement des données proposé aux premières marques clientes. Les données des visiteurs
        de ce site relèvent de la <Link href="/legal/confidentialite/">politique de confidentialité</Link>.
      </LegalCallout>

      <nav aria-label="Sommaire" className="not-prose my-8 rounded-md border border-neutral-200 p-5 text-sm">
        <p className="font-semibold text-neutral-950">Sommaire</p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-neutral-700">
          {TOC.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="text-brand-800 hover:text-brand-900">
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <h2 id="roles">1. Qui fait quoi : responsable et sous-traitant</h2>
      <p>
        Pour les données de ses consommateurs finaux, chaque marque cliente de SmartQonsumer conservera la qualité
        de <strong>responsable de traitement</strong> : c&apos;est elle qui décide de la finalité de la collecte
        (club de fidélité, campagne, landing page) et des données demandées. SmartQonsumer interviendra comme{' '}
        <strong>sous-traitant</strong>, dans le cadre d&apos;un contrat de traitement des données conforme à
        l&apos;article 28 du RGPD, annexé au contrat d&apos;abonnement.
      </p>

      <h2 id="architecture">2. Un espace pour chaque entreprise</h2>
      <p>
        La plateforme est conçue sur une architecture multi-tenant : les données de chaque client sont logiquement
        séparées de celles des autres, avec une administration distincte par rôles (super admin de l&apos;espace
        SmartQonsumer, tenant pour chaque marque cliente). Aucune donnée n&apos;est mutualisée entre deux clients.
      </p>

      <h2 id="acces">3. Des accès qui se maîtrisent</h2>
      <p>
        La connexion à l&apos;espace d&apos;administration pourra être protégée par une authentification à deux
        facteurs (MFA) par code à usage unique. Chaque client gérera la liste des utilisateurs autorisés à accéder à
        son Compte et peut révoquer un accès à tout moment.
      </p>

      <h2 id="suivi">4. Des connexions qui se suivent</h2>
      <p>
        Chaque Compte disposera d&apos;un journal des connexions et de la possibilité de recevoir une alerte lors
        d&apos;une connexion depuis un nouvel appareil, afin d&apos;accompagner le suivi des accès à son espace.
      </p>

      <h2 id="preferences">5. Des préférences qui comptent</h2>
      <p>
        Le parcours consommateur (inscription au club de fidélité, réception de campagnes) intègre le recueil du
        consentement, la gestion des préférences de communication et un mécanisme de désinscription en un clic,
        présent sur chaque e-mail envoyé depuis la plateforme.
      </p>

      <h2 id="sous-traitants">6. Sous-traitants et hébergement</h2>
      <p>
        Les données de la plateforme seront hébergées au sein de l&apos;Union européenne. SmartQonsumer fera appel à
        un nombre restreint de sous-traitants techniques (hébergement, envoi d&apos;e-mails transactionnels), chacun
        lié par un contrat encadrant le traitement des données, et dont la liste sera communiquée à chaque client.
      </p>

      <h2 id="droits">7. Exercer un droit RGPD</h2>
      <p>
        Si vous êtes un Consommateur final scanné par un produit d&apos;une marque cliente, la meilleure façon
        d&apos;exercer vos droits (accès, rectification, effacement, portabilité) est de vous adresser directement à
        cette marque, responsable de vos données. SmartQonsumer transmettra et exécutera techniquement toute
        demande relayée par ses clients dans un délai raisonnable.
      </p>
      <p>
        Si vous êtes visiteur du site smartqonsumer.com, vous pouvez exercer ces mêmes droits en écrivant à{' '}
        <a href={`mailto:${email}`}>{email}</a> — voir aussi notre{' '}
        <Link href="/legal/confidentialite/#droits">politique de confidentialité</Link>.
      </p>

      <h2 id="violation">8. Gestion des violations de données</h2>
      <p>
        En cas de violation de données susceptible d&apos;engendrer un risque pour les droits et libertés des
        personnes concernées, SmartQonsumer s&apos;engage à en informer ses clients concernés dans les meilleurs
        délais, afin de leur permettre de respecter leurs propres obligations de notification à la CNIL et, le cas
        échéant, aux personnes concernées.
      </p>

      <h2 id="contact">9. Contact</h2>
      <p>
        Pour toute question relative à la protection des données sur la plateforme SmartQonsumer, écrivez à{' '}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>
    </LegalLayout>
  );
}
