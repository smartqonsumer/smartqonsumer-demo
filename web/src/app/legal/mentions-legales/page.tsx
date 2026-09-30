import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalLayout } from '@/components/LegalLayout';
import { LegalCallout } from '@/components/LegalCallout';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    'Mentions légales du site de démonstration SmartQonsumer : éditeur, hébergement, propriété intellectuelle, données personnelles et responsabilité.',
  alternates: { canonical: '/legal/mentions-legales/' },
  robots: { index: false, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <LegalLayout eyebrow="Informations légales" title="Mentions légales" updated="17 septembre 2026">
      <LegalCallout>
        SmartQonsumer est un projet de démonstration produit ; les identifiants d&apos;entreprise ci-dessous (SIRET,
        RCS, capital social) sont des espaces réservés illustratifs et ne correspondent pas à une société réellement
        immatriculée.
      </LegalCallout>

      <h2>1. Éditeur du site</h2>
      <p>Le site smartqonsumer.com est édité par :</p>
      <ul>
        <li>
          <strong>Raison sociale</strong> : SmartQonsumer SAS <em>(dénomination de démonstration)</em>
        </li>
        <li>
          <strong>Forme juridique</strong> : Société par actions simplifiée
        </li>
        <li>
          <strong>Capital social</strong> : [capital social]
        </li>
        <li>
          <strong>Siège social</strong> : [adresse du siège social], France
        </li>
        <li>
          <strong>RCS</strong> : [ville d&apos;immatriculation] [numéro RCS]
        </li>
        <li>
          <strong>SIRET</strong> : [numéro SIRET]
        </li>
        <li>
          <strong>N° de TVA intracommunautaire</strong> : [numéro de TVA]
        </li>
        <li>
          <strong>Directeur de la publication</strong> : [nom du représentant légal]
        </li>
        <li>
          <strong>Contact</strong> : via le bouton « Nous contacter » du site
        </li>
      </ul>

      <h2>2. Hébergement</h2>
      <p>
        Le site et la plateforme SmartQonsumer sont hébergés au sein de l&apos;Union européenne par un prestataire
        d&apos;hébergement cloud dont l&apos;identité complète est communiquée sur demande aux Clients dans le cadre
        de leur contrat de traitement des données.
      </p>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments du site (textes, illustrations, logos, structure, code) est protégé au titre du
        droit de la propriété intellectuelle et demeure la propriété exclusive de SmartQonsumer, sauf mention
        contraire. Toute reproduction, représentation ou exploitation, totale ou partielle, sans autorisation
        préalable est interdite.
      </p>
      <p>
        Le nom « SmartQonsumer » et son logo constituent des marques ; toute utilisation non autorisée est
        susceptible de constituer une contrefaçon.
      </p>

      <h2>4. Données personnelles et cookies</h2>
      <p>
        Le traitement des données personnelles collectées sur ce site est décrit dans notre{' '}
        <Link href="/legal/confidentialite">politique de confidentialité</Link>. Les modalités de conformité RGPD
        applicables à la plateforme sont détaillées sur la page{' '}
        <Link href="/legal/rgpd">Informations RGPD</Link>.
      </p>

      <h2>5. Limitation de responsabilité</h2>
      <p>
        SmartQonsumer s&apos;efforce d&apos;assurer l&apos;exactitude des informations diffusées sur ce site, sans
        garantir qu&apos;elles soient exemptes d&apos;erreurs ou d&apos;omissions. L&apos;éditeur ne saurait être
        tenu responsable des dommages directs ou indirects résultant de l&apos;accès au site ou de
        l&apos;impossibilité d&apos;y accéder.
      </p>

      <h2>6. Liens hypertextes</h2>
      <p>
        Le site peut contenir des liens vers des sites tiers. SmartQonsumer n&apos;exerce aucun contrôle sur ces
        sites et décline toute responsabilité quant à leur contenu.
      </p>

      <h2>7. Médiation de la consommation</h2>
      <p>
        Conformément aux dispositions du Code de la consommation, tout client professionnel ou consommateur dispose
        de la faculté de recourir gratuitement au service de médiation dont les coordonnées lui sont communiquées, le
        cas échéant, dans son contrat.
      </p>

      <h2>8. Droit applicable</h2>
      <p>Les présentes mentions légales sont soumises au droit français.</p>
    </LegalLayout>
  );
}
