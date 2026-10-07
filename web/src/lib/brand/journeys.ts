/**
 * Acquisition journeys → campaign slugs. The URLs are two different marketing
 * strategies sharing ONE loyalty engine (/club); everything else (texts, points, games,
 * scan policy) comes from the campaign configuration in the API.
 */
export const JOURNEYS = {
  gamified: process.env.NEXT_PUBLIC_CAMPAIGN_GAMIFIED ?? 'croquin-dog-race',
  simple: process.env.NEXT_PUBLIC_CAMPAIGN_SIMPLE ?? 'croquin-simple-loyalty',
} as const;
