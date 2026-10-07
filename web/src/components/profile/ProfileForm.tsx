'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useClub } from '@/components/loyalty/ClubShell';
import { Alert, Button, Card, PointsBadge, TextField } from '@/components/ui';
import { api, errorMessage } from '@/lib/api/client';
import type { EarningAction, Profile, ProfileUpdateResponse } from '@/lib/api/types';

type Values = {
  birth_date: string;
  city: string;
  has_dog: '' | 'yes' | 'no';
  pet_name: string;
  pet_age: string;
  pet_size: '' | 'small' | 'medium' | 'large';
  pet_breed: string;
  pet_food: string;
};

const SIZES = [
  ['small', 'Petit'],
  ['medium', 'Moyen'],
  ['large', 'Grand'],
] as const;

const empty: Values = { birth_date: '', city: '', has_dog: '', pet_name: '', pet_age: '', pet_size: '', pet_breed: '', pet_food: '' };

function fromProfile(p: Profile): Values {
  return {
    birth_date: p.birth_date ?? '',
    city: p.city ?? '',
    has_dog: p.has_dog === null ? '' : p.has_dog ? 'yes' : 'no',
    pet_name: p.pet?.name ?? '',
    pet_age: p.pet?.age_years?.toString() ?? '',
    pet_size: p.pet?.size ?? '',
    pet_breed: p.pet?.breed ?? '',
    pet_food: p.pet?.food_preferences ?? '',
  };
}

/** Progressive profiling: every field is optional; points per field come from the API rules. */
export function ProfileForm({ actions, onSaved }: { actions: EarningAction[]; onSaved: () => void }) {
  const { brand, refreshSummary } = useClub();
  const [values, setValues] = useState<Values>(empty);
  const [loaded, setLoaded] = useState(false);
  const [hadPet, setHadPet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    api<Profile>('/me/profile')
      .then((p) => {
        setValues(fromProfile(p));
        setHadPet(p.pet !== null);
      })
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  const rule = (code: string) => actions.find((a) => a.code === code);
  const hint = (code: string) => {
    const r = rule(code);
    if (!r) return undefined;
    return r.done ? '✓ Points déjà gagnés' : `+${r.points} points`;
  };
  const bonus = rule('profile.complete');
  const set = (name: keyof Values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [name]: e.target.value }));
  const blankToNull = (v: string) => (v.trim() ? v.trim() : null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setResult(null);
    const pet = {
      name: blankToNull(values.pet_name),
      age_years: values.pet_age === '' ? null : Number(values.pet_age),
      size: values.pet_size || null,
      breed: blankToNull(values.pet_breed),
      food_preferences: blankToNull(values.pet_food),
    };
    try {
      const res = await api<ProfileUpdateResponse>('/me/profile', {
        method: 'PATCH',
        query: { brand },
        body: {
          birth_date: blankToNull(values.birth_date),
          city: blankToNull(values.city),
          has_dog: values.has_dog === '' ? null : values.has_dog === 'yes',
          // No empty pet record when nothing about the dog was given.
          ...(Object.values(pet).some((v) => v !== null) || hadPet ? { pet } : {}),
        },
      });
      setResult(
        res.points_awarded > 0
          ? { tone: 'success', text: `Vos ${res.points_awarded} points ont été ajoutés 🎉` }
          : { tone: 'info', text: 'Votre profil a été mis à jour.' },
      );
      await refreshSummary();
      onSaved();
    } catch (e) {
      setResult({ tone: 'error', text: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <p role="status">Chargement de votre profil…</p>;

  const selectClass =
    'min-h-[52px] rounded-club-md border-2 border-club-border bg-club-surface px-4 text-lg text-club-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-club-ink';

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {bonus && !bonus.done && (
        <Alert tone="info">
          Bonus profil complet : <PointsBadge points={bonus.points} className="ml-1" />
        </Alert>
      )}
      <Card className="flex flex-col gap-4">
        <h3 className="font-club-title text-xl font-bold uppercase text-club-ink">Vous</h3>
        <TextField label="Date de naissance" type="date" name="bday" autoComplete="bday" value={values.birth_date} onChange={set('birth_date')} hint={hint('profile.birth_date')} />
        <TextField label="Ville" name="city" autoComplete="address-level2" value={values.city} onChange={set('city')} hint={hint('profile.city')} />
        <fieldset className="flex flex-col gap-2">
          <legend className="text-base font-semibold text-club-ink">Avez-vous un chien ?</legend>
          <div className="flex gap-3">
            {(
              [
                ['yes', 'Oui'],
                ['no', 'Non'],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex min-h-[48px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-club-md border-2 border-club-border bg-club-surface text-lg has-[:checked]:border-club-primary has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-club-ink">
                <input type="radio" name="has_dog" value={value} checked={values.has_dog === value} onChange={set('has_dog')} className="h-5 w-5 accent-club-primary" />
                {label}
              </label>
            ))}
          </div>
          {hint('profile.has_dog') && <p className="text-sm text-club-muted">{hint('profile.has_dog')}</p>}
        </fieldset>
      </Card>
      <Card className="flex flex-col gap-4">
        <h3 className="font-club-title text-xl font-bold uppercase text-club-ink">Votre chien</h3>
        <TextField label="Son prénom" name="pet_name" value={values.pet_name} onChange={set('pet_name')} hint={hint('pet.name')} />
        <TextField label="Son âge (ans)" type="number" inputMode="numeric" min={0} max={30} name="pet_age" value={values.pet_age} onChange={set('pet_age')} hint={hint('pet.age_years')} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pet_size" className="text-base font-semibold text-club-ink">
            Sa taille
          </label>
          <select id="pet_size" value={values.pet_size} onChange={set('pet_size')} className={selectClass} aria-describedby="pet_size_hint">
            <option value="">—</option>
            {SIZES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <p id="pet_size_hint" className="text-sm text-club-muted">
            {hint('pet.size')}
          </p>
        </div>
        <TextField label="Sa race" name="pet_breed" value={values.pet_breed} onChange={set('pet_breed')} hint={hint('pet.breed')} />
        <TextField label="Ses préférences alimentaires" name="pet_food" value={values.pet_food} onChange={set('pet_food')} hint={hint('pet.food_preferences')} />
      </Card>
      {result && <Alert tone={result.tone}>{result.text}</Alert>}
      <Button type="submit" loading={saving}>
        Enregistrer mon profil
      </Button>
    </form>
  );
}
