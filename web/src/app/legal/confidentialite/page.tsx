import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalLayout } from '@/components/LegalLayout';
import { LegalCallout } from '@/components/LegalCallout';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: "Politique de confidentialité du service de démonstration SmartQonsumer : données collectées, finalités, durées de conservation et vos droits.",
  alternates: { canonical: '/legal/confidentialite/' },
  robots: { index: false, follow: true },
};

const TOC = [
  ['responsable', 'Qui est responsable de vos données'],
  ['donnees', 'Données que nous collectons'],
  ['finalites', 'Pourquoi nous les traitons'],
  ['base', 'Base légale des traitements'],
  ['duree', 'Durée de conservation'],
  ['destinataires', 'Qui a accès à ces données'],
  ['cookies', 'Cookies et traceurs'],
  ['transferts', "Transferts hors de l'Union européenne"],
  ['securite', 'Sécurité'],
  ['droits', 'Vos droits'],
  ['contact', 'Contact'],
] as const;

const DATA_TABLE = [
  ['Compte Client', "Nom de l'entreprise, identité et e-mail des Utilisateurs, préférences", "Renseignées à l'inscription"],
  ['Facturation', 'Coordonnées de facturation, historique des paiements', 'Renseignées par le Client'],
  ['Navigation', "Pages consultées, appareil, mesure d'audience", 'Collectées automatiquement'],
  ['Consommateur final', "Scan d'un produit, inscription au Club, points de fidélité, préférences de communication", 'Collectées via le parcours produit de la marque'],
] as const;

export default function ConfidentialitePage() {
  return (
    <LegalLayout eyebrow="Vie privée" title="Politique de confidentialité" updated="17 septembre 2026">
      <LegalCallout>
        SmartQonsumer est présenté ici à titre de démonstration produit. Ce texte illustre la structure et le contenu
        type d&apos;une politique de confidentialité pour ce genre de service ; il ne constitue pas un engagement
        contractuel réel.
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

      <h2 id="responsable">1. Qui est responsable de vos données</h2>
      <p>SmartQonsumer agit à des rôles distincts selon le type de donnée :</p>
      <ul>
        <li>
          en tant que <strong>responsable de traitement</strong>, pour les données des visiteurs du site
          smartqonsumer.com et de ses Clients (comptes, facturation, support) ;
        </li>
        <li>
          en tant que <strong>sous-traitant</strong>, pour les données des Consommateurs finaux collectées pour le
          compte de ses Clients (marques) via les QR Codes, le Club de Fidélité et les campagnes marketing — chaque
          marque restant responsable de traitement vis-à-vis de ses propres consommateurs.
        </li>
      </ul>

      <h2 id="donnees">2. Données que nous collectons</h2>
      <table>
        <thead>
          <tr>
            <th>Catégorie</th>
            <th>Exemples</th>
            <th>Origine</th>
          </tr>
        </thead>
        <tbody>
          {DATA_TABLE.map(([category, examples, origin]) => (
            <tr key={category}>
              <td>{category}</td>
              <td>{examples}</td>
              <td>{origin}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 id="finalites">3. Pourquoi nous les traitons</h2>
      <ul>
        <li>Fournir, sécuriser et améliorer le Service ;</li>
        <li>Gérer la relation contractuelle et la facturation des Clients ;</li>
        <li>
          Permettre aux marques de faire fonctionner leur Club de Fidélité et leurs campagnes, pour le compte de
          leurs Consommateurs ;
        </li>
        <li>Répondre aux demandes de contact ou de démonstration ;</li>
        <li>Établir des statistiques d&apos;usage agrégées et anonymisées.</li>
      </ul>

      <h2 id="base">4. Base légale des traitements</h2>
      <p>
        Selon les cas, nos traitements reposent sur l&apos;exécution du contrat qui nous lie au Client, sur le
        consentement du Consommateur (inscription au Club, réception de campagnes), sur notre intérêt légitime
        (sécurité, amélioration du Service) ou sur le respect d&apos;une obligation légale (facturation,
        comptabilité).
      </p>

      <h2 id="duree">5. Durée de conservation</h2>
      <p>
        Les données d&apos;un Compte Client sont conservées pendant la durée du contrat, puis pendant trente (30)
        jours après sa résiliation pour permettre l&apos;export des données, avant suppression ou anonymisation. Les
        données de facturation sont conservées conformément aux obligations comptables et fiscales en vigueur. Les
        données des Consommateurs sont conservées selon la politique définie par chaque marque cliente, dans les
        limites qu&apos;elle configure dans le Club de Fidélité.
      </p>

      <h2 id="destinataires">6. Qui a accès à ces données</h2>
      <p>
        Seuls les Utilisateurs habilités du Client concerné, les équipes internes de SmartQonsumer soumises à une
        obligation de confidentialité, et nos sous-traitants techniques (hébergement, envoi d&apos;e-mails, paiement)
        strictement nécessaires au fonctionnement du Service ont accès aux données, dans la limite de leurs besoins
        respectifs. Aucune donnée n&apos;est vendue à des tiers.
      </p>

      <h2 id="cookies">7. Cookies et traceurs</h2>
      <p>
        Le site smartqonsumer.com utilise des cookies strictement nécessaires à son fonctionnement (préférences,
        sécurité) ainsi que, sous réserve de votre consentement, des cookies de mesure d&apos;audience. Vous pouvez à
        tout moment modifier vos préférences depuis les paramètres de votre navigateur.
      </p>

      <h2 id="transferts">8. Transferts hors de l&apos;Union européenne</h2>
      <p>
        Les données sont hébergées par défaut au sein de l&apos;Union européenne. Lorsqu&apos;un sous-traitant
        technique est situé hors de l&apos;UE, un tel transfert n&apos;intervient que sur la base de garanties
        appropriées (clauses contractuelles types de la Commission européenne, décision d&apos;adéquation).
      </p>

      <h2 id="securite">9. Sécurité</h2>
      <p>
        Nous mettons en œuvre des mesures techniques et organisationnelles adaptées : chiffrement des données en
        transit, authentification à deux facteurs, séparation logique des données par Client, journalisation des
        connexions et des accès. Le détail de ces mesures est présenté sur la page{' '}
        <Link href="/legal/rgpd">RGPD</Link>.
      </p>

      <h2 id="droits">10. Vos droits</h2>
      <p>
        Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de
        limitation, d&apos;opposition et de portabilité sur vos données. Si vous êtes un Consommateur final
        d&apos;une marque cliente, ce droit s&apos;exerce en priorité auprès de cette marque, qui reste responsable
        du traitement de vos données ; SmartQonsumer relaie et exécute techniquement ces demandes.
      </p>

      <h2 id="contact">11. Contact</h2>
      <p>
        Pour toute question relative à cette politique ou pour exercer vos droits, vous pouvez nous contacter via le
        formulaire disponible sur <Link href="/">smartqonsumer.com</Link>. Vous disposez également du droit
        d&apos;introduire une réclamation auprès de la CNIL (
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          www.cnil.fr
        </a>
        ).
      </p>
    </LegalLayout>
  );
}
