'use client';

import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { api, errorMessage } from '@/lib/api/client';
import type { DemoQrCode } from '@/lib/api/types';

const JOURNEY_COPY = {
  gamified: {
    badge: 'QR #1 · Parcours gamifié',
    title: 'La Grande Course',
    steps: ['Le consommateur choisit son chien', 'Les chiens font la course, le gagnant mange ses croquettes', 'Il crée son compte pour recevoir son cadeau et ses points'],
  },
  simple: {
    badge: 'QR #2 · Fidélité simple',
    title: 'Rejoindre le club',
    steps: ['Landing page du club, sans jeu', 'Création du compte et confirmation par email', 'Points de bienvenue, puis jeux et récompenses dans le club'],
  },
} as const;

type Loaded = { code: DemoQrCode; image: string };

/** The two demo QR codes. They encode the GS1 resolver URL, so scanning them really
 * goes through the resolver before reaching the SmartQonsumer journey. */
export function QrDemo() {
  const [state, setState] = useState<{ status: 'loading' } | { status: 'ready'; codes: Loaded[] } | { status: 'error'; message: string }>({ status: 'loading' });

  useEffect(() => {
    api<DemoQrCode[]>('/qr-codes')
      .then(async (codes) => {
        const loaded = await Promise.all(
          codes.map(async (code) => ({
            code,
            image: await QRCode.toDataURL(code.resolver_url, { width: 560, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#0f172a', light: '#ffffff' } }),
          })),
        );
        setState({ status: 'ready', codes: loaded });
      })
      .catch((e) => setState({ status: 'error', message: errorMessage(e) }));
  }, []);

  if (state.status === 'loading') {
    return (
      <p role="status" className="py-12 text-center text-lg text-neutral-700">
        Génération des QR codes…
      </p>
    );
  }
  if (state.status === 'error') {
    return (
      <p role="alert" className="rounded-md border-l-4 border-red-600 bg-red-50 p-4 text-neutral-900">
        {state.message}
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {state.codes.map(({ code, image }) => {
        const copy = JOURNEY_COPY[code.journey];
        return (
          <article key={code.gtin} className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-md">
            <span className="self-start rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-800">{copy.badge}</span>
            <h2 className="text-2xl font-semibold text-neutral-950">{copy.title}</h2>
            {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL */}
            <img
              src={image}
              width={280}
              height={280}
              alt={`QR code du parcours « ${copy.title} » : ${code.resolver_url}`}
              className="mx-auto h-auto w-full max-w-[280px] rounded-md border border-neutral-200"
            />
            <ol className="list-decimal space-y-1 pl-5 text-base text-neutral-800">
              {copy.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-md bg-neutral-50 p-3 text-sm text-neutral-700">
              <dt className="font-semibold">GTIN</dt>
              <dd className="font-mono">{code.gtin}</dd>
              <dt className="font-semibold">Produit</dt>
              <dd>{code.label}</dd>
              <dt className="font-semibold">Resolver</dt>
              <dd className="break-all font-mono">{code.resolver_url}</dd>
              <dt className="font-semibold">Parcours</dt>
              <dd className="font-mono">{code.destination_path}</dd>
            </dl>
            <a
              href={code.resolver_url}
              className="mt-auto inline-flex min-h-[48px] items-center justify-center rounded-pill bg-brand-800 px-6 font-semibold text-white hover:bg-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-800"
            >
              Ouvrir ce parcours dans le navigateur
            </a>
          </article>
        );
      })}
    </div>
  );
}
