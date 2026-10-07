import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalLayout } from '@/components/LegalLayout';
import { LegalCallout } from '@/components/LegalCallout';
import { legalPageMetadata } from '@/lib/metadata';
import { legalConfig } from '@/lib/site-config';

export const metadata: Metadata = legalPageMetadata({
  title: 'Mentions légales',
  description:
    'Mentions légales du site smartqonsumer.com : éditeur, directeur de la publication, hébergement, propriété intellectuelle et données personnelles.',
  path: '/legal/mentions-legales/',
});

export default function MentionsLegalesPage() {
  const { publisher, email, host } = legalConfig;

  return (
    <LegalLayout eyebrow="Informations légales" title="Mentions légales" updated={legalConfig.updated}>
      <LegalCallout>
        SmartQonsumer est un projet en cours de création d&apos;entreprise. Le site est édité à titre personnel par
        son fondateur ; ces mentions seront complétées par les informations de la société (dénomination, numéro
        d&apos;immatriculation, siège social) dès son immatriculation.
      </LegalCallout>

      <h2>1. Éditeur du site</h2>
      <p>Le site smartqonsumer.com est édité par :</p>
      <ul>
        <li>
          <strong>Éditeur</strong> : {publisher}, personne physique, fondateur du projet SmartQonsumer
        </li>
        <li>
          <strong>Directeur de la publication</strong> : {publisher}
        </li>
        <li>
          <strong>Contact</strong> : <a href={`mailto:${email}`}>{email}</a>
        </li>
      </ul>

      <h2>2. Hébergement</h2>
      <p>Le site est hébergé par :</p>
      <ul>
        <li>
          <strong>{host.name}</strong>
        </li>
        <li>{host.address}</li>
        <li>Téléphone : {host.phone}</li>
        <li>
          <a href={host.url} target="_blank" rel="noopener noreferrer">
            www.ovhcloud.com
          </a>
        </li>
      </ul>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments du site (textes, illustrations, logos, vidéos, structure, code) est protégé au
        titre du droit de la propriété intellectuelle et demeure la propriété de son éditeur, sauf mention contraire.
        Toute reproduction, représentation ou exploitation, totale ou partielle, sans autorisation préalable est
        interdite.
      </p>

      <h2>4. Données personnelles et cookies</h2>
      <p>
        Le traitement des données personnelles des visiteurs du site, ainsi que l&apos;usage des cookies, sont
        décrits dans la <Link href="/legal/confidentialite/">politique de confidentialité</Link>. Les principes de
        protection des données retenus pour la plateforme SmartQonsumer sont présentés sur la page{' '}
        <Link href="/legal/rgpd/">Informations RGPD</Link>.
      </p>

      <h2>5. Limitation de responsabilité</h2>
      <p>
        Le site présente un service en cours de développement. Son éditeur s&apos;efforce d&apos;assurer
        l&apos;exactitude des informations diffusées, sans garantir qu&apos;elles soient exemptes d&apos;erreurs ou
        d&apos;omissions, ni que les fonctionnalités présentées soient disponibles en l&apos;état. Il ne saurait être
        tenu responsable des dommages directs ou indirects résultant de l&apos;accès au site ou de
        l&apos;impossibilité d&apos;y accéder.
      </p>

      <h2>6. Liens hypertextes</h2>
      <p>
        Le site contient des liens vers des sites tiers (prise de rendez-vous, réseaux sociaux, ressources GS1). Son
        éditeur n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
      </p>

      <h2>7. Droit applicable</h2>
      <p>Les présentes mentions légales sont soumises au droit français.</p>
    </LegalLayout>
  );
}
