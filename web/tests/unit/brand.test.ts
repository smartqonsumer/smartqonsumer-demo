import { describe, expect, it } from 'vitest';
import { teasersFrom } from '@/components/loyalty/EarnPreview';
import { getTheme, themeVariables } from '@/lib/brand/theme';

describe('brand theme', () => {
  it('exposes the theme as CSS variables in RGB channels', () => {
    const vars = themeVariables(getTheme('croquin'));
    expect(vars['--club-primary']).toBe('176 0 47');
    expect(vars['--club-primary-contrast']).toBe('255 255 255');
    expect(vars['--club-radius-lg']).toBe('24px');
  });

  it('falls back to the default theme for an unknown preset', () => {
    expect(getTheme('unknown').slug).toBe('croquin');
  });
});

describe('"keep going" teasers', () => {
  it('sums the remaining points from the API rules and lists games', () => {
    const teasers = teasersFrom({
      profile: [
        { code: 'profile.city', kind: 'profile_field', label: 'Ville', description: null, points: 10, done: false },
        { code: 'profile.complete', kind: 'profile_complete', label: 'Complet', description: null, points: 50, done: false },
        { code: 'pet.name', kind: 'profile_field', label: 'Prénom', description: null, points: 20, done: false },
        { code: 'pet.age_years', kind: 'profile_field', label: 'Âge', description: null, points: 10, done: true },
      ],
      games: [
        { type: 'roulette', slug: 'roulette', name: 'Roue', campaign_slug: 'c', play_limit: 'once_per_day', can_play: true, message: null, points_hint: "Jusqu'à +100 points", display: {} },
      ],
    });
    expect(teasers.map((t) => [t.label, t.points])).toEqual([
      ['Complétez votre profil', '+60 points'],
      ['Présentez-nous votre chien', '+20 points'],
      ['Jouez : Roue', "Jusqu'à +100 points"],
    ]);
  });
});
