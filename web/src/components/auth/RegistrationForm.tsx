'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { Alert, Button, Checkbox, TextField } from '@/components/ui';
import { ApiError, api, errorMessage } from '@/lib/api/client';
import type { CampaignPublic, RegistrationResponse } from '@/lib/api/types';

const MIN_PASSWORD = 10;

type Errors = Partial<Record<'first_name' | 'last_name' | 'email' | 'password' | 'consent', string>>;

/**
 * Account creation shared by every journey. Consents come from the campaign config:
 * required ones (participation) and optional ones (marketing) are separated, never
 * pre-ticked, and their version is recorded by the API.
 */
export function RegistrationForm({
  campaign,
  gameSessionId,
  submitLabel = 'Créer mon compte',
  onRegistered,
}: {
  campaign: CampaignPublic;
  gameSessionId?: string | null;
  submitLabel?: string;
  onRegistered: (result: RegistrationResponse) => void;
}) {
  const [values, setValues] = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const required = campaign.consents.filter((c) => c.required);
  const optional = campaign.consents.filter((c) => !c.required);
  const set = (name: keyof typeof values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [name]: e.target.value }));

  function validate(): Errors {
    const next: Errors = {};
    if (!values.first_name.trim()) next.first_name = 'Indiquez votre prénom.';
    if (!values.last_name.trim()) next.last_name = 'Indiquez votre nom.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = 'Indiquez une adresse email valide.';
    if (values.password.length < MIN_PASSWORD) next.password = `Au moins ${MIN_PASSWORD} caractères.`;
    if (required.some((c) => !consents[c.type])) next.consent = 'Cette case est nécessaire pour participer.';
    return next;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      setFormError('Merci de compléter les champs indiqués.');
      return;
    }
    setLoading(true);
    try {
      const result = await api<RegistrationResponse>('/auth/register', {
        method: 'POST',
        anon: true,
        body: {
          campaign_slug: campaign.slug,
          ...values,
          email: values.email.trim(),
          consents: Object.fromEntries(campaign.consents.map((c) => [c.type, Boolean(consents[c.type])])),
          game_session_id: gameSessionId ?? undefined,
        },
      });
      onRegistered(result);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'validation_error') {
        const fields = (error.details.fields as { field: string; message: string }[] | undefined) ?? [];
        const byField: Errors = {};
        for (const f of fields) if (f.field in values) byField[f.field as keyof Errors] = 'Valeur invalide.';
        setErrors(byField);
      }
      setFormError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const legal = campaign.legal_urls;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4" aria-describedby={formError ? 'registration-error' : undefined}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Prénom" name="given-name" autoComplete="given-name" required value={values.first_name} onChange={set('first_name')} error={errors.first_name} />
        <TextField label="Nom" name="family-name" autoComplete="family-name" required value={values.last_name} onChange={set('last_name')} error={errors.last_name} />
      </div>
      <TextField label="Email" type="email" name="email" autoComplete="email" inputMode="email" required value={values.email} onChange={set('email')} error={errors.email} />
      <div className="flex flex-col gap-2">
        <TextField
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          name="new-password"
          autoComplete="new-password"
          required
          value={values.password}
          onChange={set('password')}
          error={errors.password}
          hint={`${MIN_PASSWORD} caractères minimum.`}
        />
        <button type="button" onClick={() => setShowPassword((s) => !s)} className="self-start text-sm font-semibold text-club-ink underline underline-offset-4" aria-pressed={showPassword}>
          {showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        </button>
      </div>

      <fieldset className="flex flex-col gap-3 rounded-club-md bg-club-background p-4">
        <legend className="sr-only">Conditions de participation</legend>
        {required.map((c) => (
          <Checkbox
            key={c.type}
            name={c.type}
            required
            checked={Boolean(consents[c.type])}
            onChange={(checked) => setConsents((s) => ({ ...s, [c.type]: checked }))}
            error={errors.consent}
            label={
              <>
                {c.label}{' '}
                {legal.rules && (
                  <Link href={legal.rules} className="font-semibold underline" target="_blank">
                    Lire le règlement
                  </Link>
                )}
              </>
            }
          />
        ))}
      </fieldset>

      {optional.length > 0 && (
        <fieldset className="flex flex-col gap-3 px-1">
          <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-club-muted">Facultatif</legend>
          {optional.map((c) => (
            <Checkbox key={c.type} name={c.type} checked={Boolean(consents[c.type])} onChange={(checked) => setConsents((s) => ({ ...s, [c.type]: checked }))} label={c.label} />
          ))}
        </fieldset>
      )}

      <p className="text-sm text-club-muted">
        Vos données sont utilisées pour gérer votre compte fidélité.{' '}
        {legal.privacy && (
          <Link href={legal.privacy} className="underline" target="_blank">
            Politique de confidentialité
          </Link>
        )}
        {legal.legal_notice && (
          <>
            {' · '}
            <Link href={legal.legal_notice} className="underline" target="_blank">
              Mentions légales
            </Link>
          </>
        )}
      </p>

      {formError && (
        <div id="registration-error">
          <Alert>{formError}</Alert>
        </div>
      )}
      <Button type="submit" loading={loading}>
        {loading ? 'Enregistrement…' : submitLabel}
      </Button>
    </form>
  );
}
