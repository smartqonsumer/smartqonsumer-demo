export const siteConfig = {
  name: 'SmartQonsumer',
  url: 'https://smartqonsumer.com',
  title: 'CRM pour marques en circuits indirects | SmartQonsumer',
  description:
    "Transformez chaque produit vendu en point de contact direct : QR Code GS1, CRM, fidélité et campagnes pour mieux connaître vos consommateurs.",
  calendlyUrl: 'https://calendly.com/nicolas-wicke/30min',
  linkedinUrl: 'https://www.linkedin.com/in/nicolas-wicke-09b771160/',
} as const;

/**
 * Identity shown on the legal pages. SmartQonsumer is not incorporated yet: the
 * publisher is the project's founder as an individual. Add the company details
 * (legal name, SIREN/RCS, VAT number, address) here once it is registered.
 */
export const legalConfig = {
  publisher: 'Nicolas Wicke',
  email: 'nicolas.wicke@smartqonsumer.com',
  updated: '5 octobre 2026',
  host: {
    name: 'OVH SAS',
    address: '2 rue Kellermann, 59100 Roubaix, France',
    phone: '1007',
    url: 'https://www.ovhcloud.com',
  },
} as const;

export const posthogConfig = {
  key: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? 'phc_tWnMkKTFhskPmPxyTkjzuBmzmxT2tjLx8Hi8GC3WpfGp',
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
} as const;

export const axeptioConfig = {
  clientId: process.env.NEXT_PUBLIC_AXEPTIO_CLIENT_ID ?? '6aabffab12d1349a8dc81f7b',
  cookiesVersion: process.env.NEXT_PUBLIC_AXEPTIO_COOKIES_VERSION ?? '3ad3ffb7-c0c1-418f-b633-842820e53000',
} as const;
