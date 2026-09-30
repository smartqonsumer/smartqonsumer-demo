import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalLayout } from '@/components/LegalLayout';
import { LegalCallout } from '@/components/LegalCallout';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente',
  description: 'Conditions Générales de Vente du service SaaS de démonstration SmartQonsumer.',
  alternates: { canonical: '/legal/cgv/' },
  robots: { index: false, follow: true },
};

const TOC = [
  ['objet', 'Objet'],
  ['definitions', 'Définitions'],
  ['acces', 'Accès au Service et compte'],
  ['offres', 'Offres, essai et abonnement'],
  ['prix', 'Prix et facturation'],
  ['duree', 'Durée, renouvellement et résiliation'],
  ['obligations-client', 'Obligations du Client'],
  ['obligations-editeur', "Obligations de l'Éditeur"],
  ['donnees', 'Données et hébergement'],
  ['pi', 'Propriété intellectuelle'],
  ['responsabilite', 'Responsabilité'],
  ['confidentialite', 'Confidentialité'],
  ['divers', 'Dispositions diverses'],
  ['loi', 'Droit applicable et litiges'],
] as const;

export default function CgvPage() {
  return (
    <LegalLayout eyebrow="Conditions générales" title="Conditions Générales de Vente" updated="17 septembre 2026">
      <LegalCallout>
        SmartQonsumer est présenté ici à titre de démonstration produit. Ce texte illustre la structure et le contenu
        type de conditions générales de vente pour un éditeur de logiciel SaaS B2B ; il ne constitue pas un
        engagement contractuel réel et ne doit pas être invoqué comme tel.
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

      <h2 id="objet">1. Objet</h2>
      <p>
        Les présentes Conditions Générales de Vente (ci-après les « CGV ») régissent la fourniture, par
        SmartQonsumer (ci-après l&apos;« Éditeur »), de son logiciel en mode SaaS (Software as a Service) permettant
        aux marques vendant tout ou partie de leurs produits en circuits indirects (distributeurs, revendeurs,
        grande distribution) de créer une relation directe avec leurs consommateurs finaux via des QR Codes produit,
        un CRM, un Club de Fidélité et des campagnes marketing (ci-après le « Service »).
      </p>
      <p>
        Toute souscription au Service emporte acceptation pleine et entière des présentes CGV par le Client, à
        l&apos;exclusion de tout autre document.
      </p>

      <h2 id="definitions">2. Définitions</h2>
      <ul>
        <li>
          <strong>Client</strong> : personne morale ayant souscrit un abonnement au Service.
        </li>
        <li>
          <strong>Utilisateur</strong> : toute personne physique autorisée par le Client à accéder au Service pour
          son compte.
        </li>
        <li>
          <strong>Consommateur</strong> : personne physique interagissant avec un produit du Client via un QR Code
          (scan, inscription au Club de Fidélité, etc.).
        </li>
        <li>
          <strong>Compte</strong> : espace de travail (tenant) attribué au Client sur la plateforme.
        </li>
        <li>
          <strong>Contenus</strong> : données, produits, visuels, textes et paramétrages que le Client importe ou
          crée dans le Service.
        </li>
      </ul>

      <h2 id="acces">3. Accès au Service et compte</h2>
      <p>
        L&apos;accès au Service est réservé aux Clients ayant souscrit un abonnement et créé un Compte. Chaque
        Utilisateur dispose d&apos;un accès individuel, authentifié et, selon le plan souscrit, protégé par une
        authentification à deux facteurs (MFA).
      </p>
      <p>
        Le Client est responsable de la confidentialité des identifiants attribués à ses Utilisateurs et de toute
        action réalisée depuis leurs comptes. Il s&apos;engage à informer l&apos;Éditeur sans délai de toute
        utilisation non autorisée dont il aurait connaissance.
      </p>

      <h2 id="offres">4. Offres, essai et abonnement</h2>
      <p>
        L&apos;Éditeur propose plusieurs formules d&apos;abonnement, dont le détail (fonctionnalités incluses,
        volumes de scans, nombre d&apos;Utilisateurs, options Premium telles que les Landing Pages ou le Club de
        Fidélité) est présenté sur le site et dans l&apos;espace « Abonnement » du Service.
      </p>
      <p>
        Une période d&apos;essai peut être proposée à la souscription. Sauf mention contraire, elle ne donne lieu à
        aucune facturation et se termine automatiquement à son terme, sans reconduction tacite vers une offre
        payante.
      </p>

      <h2 id="prix">5. Prix et facturation</h2>
      <p>
        Les prix applicables sont ceux en vigueur au jour de la souscription, exprimés en euros hors taxes. Ils sont
        facturés selon la périodicité choisie par le Client (mensuelle ou annuelle) et sont payables d&apos;avance,
        par prélèvement automatique ou carte bancaire.
      </p>
      <p>
        Tout changement de plan en cours de période donne lieu à une facturation au prorata. Le défaut de paiement à
        échéance peut entraîner, après relance restée sans effet, la suspension de l&apos;accès au Service.
      </p>

      <h2 id="duree">6. Durée, renouvellement et résiliation</h2>
      <p>
        L&apos;abonnement est souscrit pour la durée choisie (mensuelle ou annuelle) et se renouvelle tacitement pour
        une durée identique, sauf résiliation notifiée par le Client depuis son espace « Abonnement » ou par écrit,
        avec un préavis de trente (30) jours avant l&apos;échéance.
      </p>
      <p>
        En cas de manquement grave du Client à ses obligations (notamment défaut de paiement ou usage non conforme),
        l&apos;Éditeur peut suspendre ou résilier l&apos;accès au Service après mise en demeure restée infructueuse
        pendant quinze (15) jours.
      </p>
      <p>
        À l&apos;issue du contrat, le Client dispose d&apos;un délai de trente (30) jours pour exporter ses données
        avant leur suppression définitive, conformément à la politique de conservation décrite dans la{' '}
        <Link href="/legal/confidentialite">Politique de confidentialité</Link>.
      </p>

      <h2 id="obligations-client">7. Obligations du Client</h2>
      <ul>
        <li>Fournir des informations exactes lors de la souscription et les maintenir à jour ;</li>
        <li>
          Utiliser le Service conformément à sa destination et à la réglementation applicable, notamment en matière
          de protection des données personnelles des Consommateurs ;
        </li>
        <li>
          Disposer des droits nécessaires sur les Contenus qu&apos;il importe (visuels produits, textes, marques) ;
        </li>
        <li>
          Recueillir, lorsque le Service le requiert, le consentement des Consommateurs (inscription au Club de
          Fidélité, envoi de campagnes marketing) via les fonctionnalités prévues à cet effet.
        </li>
      </ul>

      <h2 id="obligations-editeur">8. Obligations de l&apos;Éditeur</h2>
      <p>
        L&apos;Éditeur s&apos;engage à mettre en œuvre les moyens raisonnables pour assurer la disponibilité, la
        sécurité et la maintenance du Service, dans les conditions précisées, le cas échéant, par un contrat de
        niveau de service (SLA) associé au plan souscrit.
      </p>
      <p>
        L&apos;Éditeur peut faire évoluer les fonctionnalités du Service pour l&apos;améliorer, sans que cela ne
        réduise substantiellement les fonctionnalités essentielles pour lesquelles le Client s&apos;est abonné.
      </p>

      <h2 id="donnees">9. Données et hébergement</h2>
      <p>
        Les données du Client et des Consommateurs sont hébergées au sein de l&apos;Union européenne. Chaque Compte
        bénéficie d&apos;une architecture multi-tenant assurant une séparation logique des données entre Clients,
        décrite dans le bloc « La confiance fait partie du parcours » du site.
      </p>
      <p>
        Le traitement des données à caractère personnel est régi par la{' '}
        <Link href="/legal/rgpd">politique de conformité RGPD</Link> de l&apos;Éditeur, qui fait partie intégrante
        des présentes CGV.
      </p>

      <h2 id="pi">10. Propriété intellectuelle</h2>
      <p>
        Le Service, son code source, sa base de données, son design et sa documentation demeurent la propriété
        exclusive de l&apos;Éditeur. La souscription au Service confère au Client un droit d&apos;usage non
        exclusif, non cessible et limité à la durée du contrat.
      </p>
      <p>
        Le Client conserve l&apos;intégralité des droits sur ses propres Contenus (données, marques, visuels) et en
        concède à l&apos;Éditeur un droit d&apos;usage limité, nécessaire à la seule exécution du Service.
      </p>

      <h2 id="responsabilite">11. Responsabilité</h2>
      <p>
        L&apos;Éditeur est tenu à une obligation de moyens. Sa responsabilité ne saurait être engagée en cas de
        dommage indirect (perte de chiffre d&apos;affaires, préjudice d&apos;image) ni en cas d&apos;interruption du
        Service résultant d&apos;un cas de force majeure, d&apos;une défaillance d&apos;un prestataire tiers
        (hébergeur, fournisseur d&apos;e-mailing) ou d&apos;un usage du Service non conforme aux présentes CGV.
      </p>
      <p>
        En tout état de cause, la responsabilité totale de l&apos;Éditeur est plafonnée au montant des sommes versées
        par le Client au titre des douze (12) derniers mois d&apos;abonnement.
      </p>

      <h2 id="confidentialite">12. Confidentialité</h2>
      <p>
        Chaque partie s&apos;engage à conserver confidentielles les informations non publiques de l&apos;autre partie
        dont elle aurait connaissance à l&apos;occasion de l&apos;exécution du contrat, et à ne les utiliser
        qu&apos;aux fins de cette exécution.
      </p>

      <h2 id="divers">13. Dispositions diverses</h2>
      <p>
        Si l&apos;une des clauses des présentes CGV venait à être déclarée nulle ou inapplicable, les autres clauses
        conserveraient leur plein effet. Le fait, pour l&apos;une des parties, de ne pas se prévaloir d&apos;un
        manquement de l&apos;autre partie ne saurait être interprété comme une renonciation à s&apos;en prévaloir
        ultérieurement.
      </p>

      <h2 id="loi">14. Droit applicable et litiges</h2>
      <p>
        Les présentes CGV sont soumises au droit français. En cas de litige et à défaut de résolution amiable, les
        tribunaux compétents du ressort du siège social de l&apos;Éditeur seront seuls compétents, sauf disposition
        légale contraire applicable aux consommateurs ou non-professionnels.
      </p>
    </LegalLayout>
  );
}
