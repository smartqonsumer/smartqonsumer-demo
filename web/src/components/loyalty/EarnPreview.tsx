'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { focusRing } from '@/components/ui';
import { api } from '@/lib/api/client';
import type { EarningActions } from '@/lib/api/types';
import { DEFAULT_BRAND_SLUG } from '@/lib/brand/theme';

type Teaser = { key: string; points: string; label: string; icon: string };

/** Builds the "keep going" teasers from the brand's earning rules (never hard-coded points). */
export function teasersFrom(actions: EarningActions): Teaser[] {
  const sum = (prefix: string) =>
    actions.profile.filter((a) => !a.done && a.code.startsWith(prefix)).reduce((total, a) => total + a.points, 0);
  const teasers: Teaser[] = [];
  const profile = sum('profile.');
  const pet = sum('pet.');
  if (profile) teasers.push({ key: 'profile', points: `+${profile} points`, label: 'Complétez votre profil', icon: '📝' });
  if (pet) teasers.push({ key: 'pet', points: `+${pet} points`, label: 'Présentez-nous votre chien', icon: '🐶' });
  for (const game of actions.games) {
    teasers.push({ key: game.slug, points: game.points_hint, label: `Jouez : ${game.name}`, icon: game.type === 'roulette' ? '🎡' : '🐕' });
  }
  return teasers;
}

export function EarnPreview({ brand = DEFAULT_BRAND_SLUG }: { brand?: string }) {
  const [teasers, setTeasers] = useState<Teaser[] | null>(null);

  useEffect(() => {
    api<EarningActions>('/loyalty/earning-actions', { query: { brand } })
      .then((actions) => setTeasers(teasersFrom(actions)))
      .catch(() => setTeasers([]));
  }, [brand]);

  if (!teasers?.length) return null;
  return (
    <section aria-labelledby="keep-going" className="flex flex-col gap-3">
      <h2 id="keep-going" className="font-club-title text-3xl font-extrabold uppercase text-club-ink">
        Continuez l&apos;aventure
      </h2>
      <p className="text-base">Gagnez encore plus de points et débloquez vos prochaines récompenses.</p>
      <ul className="flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:flex">
        {teasers.map((t) => (
          <li key={t.key}>
            <Link
              href="/club/gagner/"
              className={`flex min-h-[64px] items-center gap-4 rounded-club-md border border-club-border bg-club-surface p-4 shadow-sm transition-shadow hover:border-club-accent/60 hover:shadow-lg ${focusRing}`}
            >
              <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-club-accent-soft text-2xl">
                {t.icon}
              </span>
              <span className="flex-1 text-lg font-semibold text-club-ink">{t.label}</span>
              <span className="rounded-full bg-club-gold px-3 py-1 font-club-title font-bold text-club-ink">{t.points}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
