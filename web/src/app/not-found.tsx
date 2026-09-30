import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 p-6">
      <main className="w-full max-w-[620px] rounded-lg border border-neutral-200 bg-white p-12 text-center shadow-lg">
        <Image src="/assets/logo-smartqonsumer.png" alt="SmartQonsumer" width={150} height={20} className="mx-auto mb-8" />
        <div className="text-xs font-bold uppercase tracking-[0.12em] text-brand-800">Erreur 404</div>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-neutral-950">Cette page n&apos;existe pas.</h1>
        <p className="mx-auto mt-4 max-w-[460px] text-base leading-relaxed text-neutral-700">
          L&apos;adresse est peut-être incorrecte ou la page a été déplacée. Revenez à la présentation de
          SmartQonsumer.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-sm bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800"
        >
          Retour à l&apos;accueil
        </Link>
      </main>
    </div>
  );
}
