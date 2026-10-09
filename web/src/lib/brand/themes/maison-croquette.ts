import type { BrandTheme } from '../theme';

/**
 * Maison de la Croquette — fictional premium pet-food brand used for the demo.
 *
 * From the brand board: forest green (trust, nature, premium), natural beige
 * (authenticity, softness), off-white (purity, elegance) and copper (refinement,
 * warmth). Classic serif uppercase titles with a short copper rule, a soft sans-serif
 * for text, forest-green pill CTAs with spaced capitals, warm dog-and-cat imagery.
 * Text colours were checked for WCAG AA on the off-white background.
 */
export const maisonCroquetteTheme: BrandTheme = {
  slug: 'maison-croquette',
  name: 'Maison de la Croquette',
  colors: {
    primary: '#1D3A2D', // vert forêt
    primaryDark: '#132A20',
    primaryContrast: '#FFFFFF',
    ink: '#16271F',
    text: '#3B3A35',
    muted: '#6A6258',
    surface: '#FFFDF9',
    background: '#F7F1E8', // blanc cassé
    accent: '#B8743F', // cuivre (decorative)
    accentText: '#8C5226',
    accentSoft: '#F0E4D4', // beige naturel, light
    gold: '#E6CDAD',
    border: '#E2D5C3',
  },
  radius: { sm: '8px', md: '12px', lg: '20px', pill: '999px' },
  fonts: { title: 'cormorant', text: 'nunitoSans' },
  typography: 'serif',
  assets: {
    logoText: 'Maison',
    logoSubtext: 'de la Croquette',
    logoImage: '/assets/brands/maison-croquette/monogramme.png',
    tagline: 'Le bonheur se croque au quotidien',
    mascot: '🐾',
    heroImage: '/assets/brands/maison-croquette/hero-chien-chat.webp',
    heroAlt: 'Un golden retriever et un chat tigré blottis l’un contre l’autre',
    heroQuote: 'Des compagnons heureux, une vie plus belle',
  },
  copy: { clubName: 'Club Maison de la Croquette', pointsName: 'points' },
};
