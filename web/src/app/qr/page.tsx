import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/Container';
import { QrDemo } from '@/components/journeys/QrDemo';
import { privatePageMetadata } from '@/lib/metadata';

export const metadata: Metadata = privatePageMetadata({
  title: 'Démo : QR codes GS1',
  description: 'Scannez les deux QR codes GS1 de démonstration et découvrez les parcours de fidélisation SmartQonsumer.',
  path: '/qr/',
});

export default function QrPage() {
  return (
    <>
      <nav aria-label="Navigation principale" className="border-b border-neutral-200 bg-white">
        <Container className="flex h-[70px] items-center justify-between">
          <Link href="/" aria-label="SmartQonsumer — accueil">
            <Image src="/assets/logo-smartqonsumer.png" alt="SmartQonsumer" width={140} height={19} />
          </Link>
          <Link href="/" className="text-sm font-medium text-neutral-700 hover:text-brand-800">
            Retour au site
          </Link>
        </Container>
      </nav>
      <main id="main-content" className="bg-neutral-50 pb-20 pt-14">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.1em] text-brand-800">Démonstration</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950">Deux QR codes, deux stratégies</h1>
            <p className="mt-4 text-lg text-neutral-700">
              Scannez un QR code avec votre smartphone. Il passe par le résolveur GS1 Digital Link, qui reconnaît le
              GTIN du produit et vous envoie vers l&apos;expérience de la marque. Les deux parcours utilisent le même
              moteur de fidélité SmartQonsumer.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-5xl">
            <QrDemo />
          </div>
          <p className="mx-auto mt-10 max-w-3xl text-center text-sm text-neutral-700">
            Marque, produits et codes promo fictifs, à des fins de démonstration uniquement.
          </p>
        </Container>
      </main>
      <footer className="border-t border-neutral-200 bg-white py-6 text-center text-sm text-neutral-700">
        <Link href="/legal/mentions-legales/" className="underline">
          Mentions légales
        </Link>
        {' · '}
        <Link href="/legal/confidentialite/" className="underline">
          Confidentialité
        </Link>
      </footer>
    </>
  );
}
