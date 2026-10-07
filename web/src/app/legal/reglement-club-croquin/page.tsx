import type { Metadata } from 'next';
import { LegalCallout } from '@/components/LegalCallout';
import { LegalLayout } from '@/components/LegalLayout';
import { legalPageMetadata } from '@/lib/metadata';
import { legalConfig } from '@/lib/site-config';

export const metadata: Metadata = legalPageMetadata({
  title: 'Règlement du Club Croquin (démo)',
  description: "Règlement de démonstration de l'opération et du programme de fidélité Club Croquin, marque fictive.",
  path: '/legal/reglement-club-croquin/',
});

/**
 * Placeholder rules page for the demo journeys. Its URL is configured per brand/campaign
 * in the API (legal_urls.rules) and can point to the brand's real rules once validated.
 */
export default function ReglementPage() {
  return (
    <LegalLayout eyebrow="Démonstration" title="Règlement du Club Croquin" updated={legalConfig.updated}>
      <LegalCallout>
        Croquin est une marque fictive créée pour démontrer la plateforme SmartQonsumer. Ce règlement est un modèle
        de démonstration : il n&apos;a pas de valeur contractuelle et devra être rédigé et validé juridiquement par
        chaque marque cliente avant toute opération réelle.
      </LegalCallout>
      <h2>1. Objet</h2>
      <p>
        Le Club Croquin permet aux consommateurs ayant scanné le QR Code d&apos;un produit de créer un compte
        fidélité, de cumuler des points (inscription, profil, jeux) et de les échanger contre des codes promotionnels.
      </p>
      <h2>2. Participation</h2>
      <p>
        La participation est gratuite et ouverte aux personnes majeures. Un même QR Code ne permet de participer
        qu&apos;une seule fois par opération, selon les règles affichées lors du scan.
      </p>
      <h2>3. Jeux</h2>
      <p>
        Les résultats des jeux (course de chiens, roue de la chance) sont déterminés par le serveur de la plateforme,
        selon des probabilités définies pour chaque opération. Le nombre de parties peut être limité.
      </p>
      <h2>4. Points et récompenses</h2>
      <p>
        Les points n&apos;ont aucune valeur monétaire. Les codes promotionnels de cette démonstration sont fictifs et
        ne peuvent pas être utilisés.
      </p>
      <h2>5. Données personnelles</h2>
      <p>
        Les données collectées sont nécessaires à la gestion du compte. Vous pouvez les consulter, les télécharger,
        retirer votre consentement marketing ou supprimer votre compte depuis votre espace « Mon compte ».
      </p>
    </LegalLayout>
  );
}
