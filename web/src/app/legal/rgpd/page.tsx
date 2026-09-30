import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalLayout } from '@/components/LegalLayout';
import { LegalCallout } from '@/components/LegalCallout';

export const metadata: Metadata = {
  title: 'Informations RGPD',
  description: 'Conformité RGPD de la plateforme SmartQonsumer : rôles, architecture multi-tenant, accès, sous-traitants et exercice de vos droits.',
  alternates: { canonical: '/legal/rgpd/' },
  robots: { index: false, follow: true },
};

const TOC = [
  ['roles', 'Qui fait quoi : responsable et sous-traitant'],
  ['architecture', 'Un espace pour chaque entreprise'],
  ['acces', 'Des accès qui se maîtrisent'],
  ['suivi', 'Des connexions qui se suivent'],
  ['preferences', 'Des préférences qui comptent'],
  ['sous-traitants', 'Sous-traitants et hébergement'],
  ['droits', 'Exercer un droit RGPD'],
  ['violation', 'Gestion des violations de données'],
  ['dpo', 'Contact délégué à la protection des données'],
] as const;

export default function RgpdPage() {
  return (
    <LegalLayout eyebrow="Confiance & conformité" title="Informations RGPD" updated="17 septembre 2026">
      <LegalCallout>
        SmartQonsumer est présenté ici à titre de démonstration produit. Cette page illustre la manière dont un
        éditeur SaaS présente sa conformité RGPD à ses clients ; elle ne constitue pas un engagement contractuel
        réel.
      </LegalCallout>

      <nav className="not-prose my-8 rounded-md border border-neutral-200 p-5 text-sm">
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
        Pour les données de ses Consommateurs finaux, chaque marque cliente de SmartQonsumer conserve la qualité de{' '}
        <strong>responsable de traitement</strong> : c&apos;est elle qui décide de la finalité de la collecte (Club
        de Fidélité, campagne, landing page) et des données demandées. SmartQonsumer intervient comme{' '}
        <strong>sous-traitant</strong>, dans le cadre d&apos;un contrat de traitement des données conforme à
        l&apos;article 28 du RGPD, annexé au contrat d&apos;abonnement.
      </p>

      <h2 id="architecture">2. Un espace pour chaque entreprise</h2>
      <p>
        La plateforme repose sur une architecture multi-tenant : les données de chaque Client sont logiquement
        séparées de celles des autres, avec une administration distincte par rôles (Super Admin de l&apos;espace
        SmartQonsumer, Tenant pour chaque marque cliente). Aucune donnée n&apos;est mutualisée entre deux Clients.
      </p>

      <h2 id="acces">3. Des accès qui se maîtrisent</h2>
      <p>
        La connexion à l&apos;espace d&apos;administration peut être protégée par une authentification à deux
        facteurs (MFA) par code à usage unique. Chaque Client gère la liste des Utilisateurs autorisés à accéder à
        son Compte et peut révoquer un accès à tout moment.
      </p>

      <h2 id="suivi">4. Des connexions qui se suivent</h2>
      <p>
        Chaque Compte dispose d&apos;un journal des connexions et de la possibilité de recevoir une alerte lors
        d&apos;une connexion depuis un nouvel appareil, afin d&apos;accompagner le suivi des accès à son espace.
      </p>

      <h2 id="preferences">5. Des préférences qui comptent</h2>
      <p>
        Le parcours consommateur (inscription au Club de Fidélité, réception de campagnes) intègre le recueil du
        consentement, la gestion des préférences de communication et un mécanisme de désinscription en un clic,
        présent sur chaque e-mail envoyé depuis la plateforme.
      </p>

      <h2 id="sous-traitants">6. Sous-traitants et hébergement</h2>
      <p>
        Les données sont hébergées au sein de l&apos;Union européenne. SmartQonsumer fait appel à un nombre restreint
        de sous-traitants techniques (hébergement, envoi d&apos;e-mails transactionnels, prise de rendez-vous
        commercial), chacun lié par un contrat encadrant le traitement des données. La liste à jour des
        sous-traitants est communiquée aux Clients qui en font la demande.
      </p>

      <h2 id="droits">7. Exercer un droit RGPD</h2>
      <p>
        Si vous êtes un Consommateur final scanné par un produit d&apos;une marque cliente, la meilleure façon
        d&apos;exercer vos droits (accès, rectification, effacement, portabilité) est de vous adresser directement à
        cette marque, responsable de vos données. SmartQonsumer transmet et exécute techniquement toute demande
        relayée par ses Clients dans un délai raisonnable.
      </p>
      <p>
        Si vous êtes Client ou visiteur du site smartqonsumer.com, vous pouvez exercer ces mêmes droits en nous
        contactant directement — voir la section{' '}
        <Link href="/legal/confidentialite#contact">Contact</Link> de notre politique de confidentialité.
      </p>

      <h2 id="violation">8. Gestion des violations de données</h2>
      <p>
        En cas de violation de données susceptible d&apos;engendrer un risque pour les droits et libertés des
        personnes concernées, SmartQonsumer s&apos;engage à en informer ses Clients concernés dans les meilleurs
        délais, afin de leur permettre de respecter leurs propres obligations de notification à la CNIL et, le cas
        échéant, aux personnes concernées.
      </p>

      <h2 id="dpo">9. Contact délégué à la protection des données</h2>
      <p>
        Pour toute question relative à la conformité RGPD de la plateforme, vous pouvez solliciter un rendez-vous
        avec notre équipe via le bouton « Nous contacter » du site, ou consulter notre{' '}
        <Link href="/legal/confidentialite">politique de confidentialité</Link> pour les modalités de contact
        écrites.
      </p>
    </LegalLayout>
  );
}
