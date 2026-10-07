import type { Metadata } from 'next';
import Link from 'next/link';
import { CookieSettingsButton } from '@/components/CookieSettingsButton';
import { LegalLayout } from '@/components/LegalLayout';
import { LegalCallout } from '@/components/LegalCallout';
import { ScrollableTable } from '@/components/ScrollableTable';
import { legalPageMetadata } from '@/lib/metadata';
import { legalConfig } from '@/lib/site-config';

export const metadata: Metadata = legalPageMetadata({
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité de smartqonsumer.com : données collectées, finalités, cookies, durées de conservation, destinataires et vos droits.',
  path: '/legal/confidentialite/',
});

const TOC = [
  ['responsable', 'Responsable du traitement'],
  ['donnees', 'Données collectées et finalités'],
  ['cookies', 'Cookies et mesure d’audience'],
  ['duree', 'Durée de conservation'],
  ['destinataires', 'Destinataires et sous-traitants'],
  ['transferts', 'Transferts hors de l’Union européenne'],
  ['droits', 'Vos droits'],
  ['contact', 'Contact'],
] as const;

const DATA_TABLE = [
  [
    'Mesure d’audience et erreurs techniques',
    'Pages consultées, type d’appareil et de navigateur, erreurs JavaScript rencontrées',
    'Améliorer le site et corriger ses dysfonctionnements',
    'Consentement',
  ],
  [
    'Choix en matière de cookies',
    'Vos préférences de consentement',
    'Respecter et prouver vos choix',
    'Obligation légale',
  ],
  [
    'Prise de rendez-vous',
    'Nom, e-mail, informations saisies lors de la réservation (via Calendly)',
    'Organiser un échange ou une démonstration',
    'Intérêt légitime',
  ],
  [
    'Échanges par e-mail',
    'Nom, adresse e-mail, contenu de vos messages',
    'Répondre à vos demandes',
    'Intérêt légitime',
  ],
  [
    'Journaux techniques',
    'Adresse IP, date et heure, page demandée',
    'Sécurité et bon fonctionnement de l’hébergement',
    'Intérêt légitime',
  ],
] as const;

const PROCESSORS = [
  ['OVH SAS', 'Hébergement du site', 'France'],
  ['PostHog', 'Mesure d’audience et suivi des erreurs (après consentement)', 'Union européenne'],
  ['Axeptio', 'Gestion du consentement aux cookies', 'France'],
  ['Calendly', 'Prise de rendez-vous', 'États-Unis'],
] as const;

export default function ConfidentialitePage() {
  const { publisher, email } = legalConfig;

  return (
    <LegalLayout eyebrow="Vie privée" title="Politique de confidentialité" updated={legalConfig.updated}>
      <LegalCallout>
        Cette politique concerne le site smartqonsumer.com et ses visiteurs. La plateforme SmartQonsumer est en
        cours de développement et n&apos;est pas encore commercialisée : les principes de protection des données
        retenus pour elle sont présentés sur la page <Link href="/legal/rgpd/">Informations RGPD</Link>.
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

      <h2 id="responsable">1. Responsable du traitement</h2>
      <p>
        Les données personnelles collectées sur ce site sont traitées par {publisher}, fondateur du projet
        SmartQonsumer, joignable à l&apos;adresse <a href={`mailto:${email}`}>{email}</a>. Aucune donnée n&apos;est
        vendue ni louée à des tiers.
      </p>

      <h2 id="donnees">2. Données collectées et finalités</h2>
      <ScrollableTable label="Données collectées et finalités">
        <table>
          <thead>
            <tr>
              <th>Traitement</th>
              <th>Données</th>
              <th>Finalité</th>
              <th>Base légale</th>
            </tr>
          </thead>
          <tbody>
            {DATA_TABLE.map(([name, data, purpose, basis]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{data}</td>
                <td>{purpose}</td>
                <td>{basis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTable>
      <p>
        Le site ne propose ni compte utilisateur ni paiement, et ne collecte aucune donnée sensible. Les polices de
        caractères et la vidéo de présentation sont hébergées sur le site lui-même : leur affichage ne transmet
        aucune donnée à un tiers.
      </p>

      <h2 id="cookies">3. Cookies et mesure d&apos;audience</h2>
      <p>
        Lors de votre première visite, un bandeau vous permet d&apos;accepter ou de refuser la mesure
        d&apos;audience. Tant que vous ne l&apos;avez pas acceptée, aucun cookie de mesure n&apos;est déposé et
        aucune donnée de navigation n&apos;est envoyée. Seul est conservé le cookie qui mémorise votre choix,
        strictement nécessaire au respect de celui-ci.
      </p>
      <p>
        Vous pouvez modifier ou retirer votre consentement à tout moment, aussi simplement que vous l&apos;avez
        donné : <CookieSettingsButton />.
      </p>

      <h2 id="duree">4. Durée de conservation</h2>
      <ul>
        <li>Cookies de mesure d&apos;audience et choix de consentement : 13 mois au maximum ;</li>
        <li>
          Prise de rendez-vous et échanges par e-mail : le temps de traiter votre demande, puis 3 ans au plus après
          notre dernier échange ;
        </li>
        <li>Journaux techniques : durée limitée fixée par l&apos;hébergeur pour la sécurité du service.</li>
      </ul>

      <h2 id="destinataires">5. Destinataires et sous-traitants</h2>
      <p>
        Vos données ne sont accessibles qu&apos;à {publisher} et aux prestataires techniques suivants, dans la limite
        de ce qui est nécessaire à leur mission :
      </p>
      <ScrollableTable label="Destinataires et sous-traitants">
        <table>
          <thead>
            <tr>
              <th>Prestataire</th>
              <th>Rôle</th>
              <th>Localisation des données</th>
            </tr>
          </thead>
          <tbody>
            {PROCESSORS.map(([name, role, location]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{role}</td>
                <td>{location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTable>

      <h2 id="transferts">6. Transferts hors de l&apos;Union européenne</h2>
      <p>
        Lorsque vous réservez un rendez-vous, les informations saisies sont traitées par Calendly, situé aux
        États-Unis. Ce transfert est encadré par les garanties prévues par le RGPD (cadre de protection des données
        UE–États-Unis ou clauses contractuelles types de la Commission européenne). Les autres données restent
        hébergées dans l&apos;Union européenne.
      </p>

      <h2 id="droits">7. Vos droits</h2>
      <p>
        Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d&apos;un droit d&apos;accès, de
        rectification, d&apos;effacement, de limitation, d&apos;opposition et de portabilité sur vos données, ainsi
        que du droit de retirer votre consentement et de définir des directives sur le sort de vos données après
        votre décès. Une réponse vous est apportée dans un délai d&apos;un mois.
      </p>

      <h2 id="contact">8. Contact</h2>
      <p>
        Pour toute question relative à cette politique ou pour exercer vos droits, écrivez à{' '}
        <a href={`mailto:${email}`}>{email}</a>. Si vous estimez, après nous avoir contactés, que vos droits ne sont
        pas respectés, vous pouvez adresser une réclamation à la CNIL (
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          www.cnil.fr
        </a>
        ).
      </p>
    </LegalLayout>
  );
}
