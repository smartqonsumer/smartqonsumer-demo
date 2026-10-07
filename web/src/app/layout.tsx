import type { Metadata } from 'next';
import { Instrument_Sans } from 'next/font/google';
import Script from 'next/script';
import { AxeptioScripts } from '@/components/AxeptioScripts';
import { PostHogProvider } from '@/components/PostHogProvider';
import { pageMetadata } from '@/lib/metadata';
import { axeptioConfig, siteConfig } from '@/lib/site-config';
import './globals.css';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  ...pageMetadata({ title: siteConfig.title, description: siteConfig.description, path: '/' }),
  title: { default: siteConfig.title, template: `%s | ${siteConfig.name}` },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/assets/q-mark.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/assets/q-mark.png',
  },
  manifest: '/site.webmanifest',
  robots: { index: true, follow: true },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/assets/logo-smartqonsumer.png`,
    },
    {
      '@type': 'WebSite',
      '@id': `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: 'CRM pour les marques qui vendent leurs produits en circuits indirects.',
      inLanguage: 'fr-FR',
      publisher: { '@id': `${siteConfig.url}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={instrumentSans.variable}>
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script id="axeptio-settings" strategy="beforeInteractive">
          {`
            window.axeptioSettings = {
              clientId: "${axeptioConfig.clientId}",
              cookiesVersion: "${axeptioConfig.cookiesVersion}",
            };
          `}
        </Script>
      </head>
      <body className="font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-brand-800 focus:shadow-lg"
        >
          Aller au contenu principal
        </a>
        <AxeptioScripts />
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
