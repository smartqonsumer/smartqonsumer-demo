'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { JourneyShell, LoadingBlock } from '@/components/journeys/JourneyShell';
import { Alert, Button, ButtonLink, Card, Heading, PointsBadge, TextField } from '@/components/ui';
import { ApiError, api, errorMessage } from '@/lib/api/client';
import type { Message, UserPublic, VerifyEmailResponse } from '@/lib/api/types';
import { getTheme } from '@/lib/brand/theme';
import { safeNext, useSession } from '@/lib/auth/session';

/** One-time tokens arrive in the URL fragment (#token=…), never sent to the server;
 * ?token=… is still accepted. */
function useLinkToken(): { token: string | null; ready: boolean } {
  const query = useSearchParams().get('token');
  const [state, setState] = useState<{ token: string | null; ready: boolean }>({ token: null, ready: false });
  useEffect(() => {
    const fromHash = new URLSearchParams(window.location.hash.slice(1)).get('token');
    if (fromHash) window.history.replaceState(null, '', window.location.pathname);
    setState({ token: fromHash ?? query, ready: true });
  }, [query]);
  return state;
}

const linkClass = 'font-semibold text-club-ink underline underline-offset-4';

export function LoginView() {
  const router = useRouter();
  const params = useSearchParams();
  const session = useSession();
  const next = safeNext(params.get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session.status === 'authenticated') router.replace(next);
  }, [session.status, router, next]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setUnverified(false);
    setLoading(true);
    try {
      await api<UserPublic>('/auth/login', { method: 'POST', body: { email: email.trim(), password } });
      await session.refresh();
      router.replace(next);
    } catch (e) {
      setUnverified(e instanceof ApiError && e.code === 'email_not_verified');
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <JourneyShell>
      <Heading>Connexion</Heading>
      <p className="text-center text-lg">Accédez à votre espace {getTheme().copy.clubName}.</p>
      <Card className="lg:p-8">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <TextField
            label="Email"
            icon="email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Votre adresse email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Mot de passe"
            icon="lock"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            placeholder="Votre mot de passe"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} />}
          />
          {error && <Alert>{error}</Alert>}
          {unverified && <ResendLink email={email} />}
          <Button type="submit" loading={loading} arrow>
            Se connecter
          </Button>
        </form>
        <div className="mt-5 flex flex-col gap-3 text-center text-base">
          <Link href="/auth/mot-de-passe-oublie/" className={linkClass}>
            Mot de passe oublié ?
          </Link>
          <span>
            Pas encore membre ?{' '}
            <Link href="/club-croquin-simple/" className={linkClass}>
              Rejoindre le club
            </Link>
          </span>
        </div>
      </Card>
    </JourneyShell>
  );
}

function PasswordToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={shown}
      className="grid h-11 w-11 place-items-center rounded-club-sm text-club-muted hover:text-club-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-club-ink"
    >
      <span className="sr-only">{shown ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}</span>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-5 w-5">
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="3" />
        {shown && <path d="m4 4 16 16" />}
      </svg>
    </button>
  );
}

function ResendLink({ email }: { email: string }) {
  const [message, setMessage] = useState<string | null>(null);
  return message ? (
    <Alert tone="success">{message}</Alert>
  ) : (
    <button
      type="button"
      className={`${linkClass} self-start`}
      onClick={() =>
        api<Message>('/auth/resend-verification', { method: 'POST', body: { email: email.trim() } })
          .then((r) => setMessage(r.message))
          .catch((e) => setMessage(errorMessage(e)))
      }
    >
      Renvoyer l&apos;email de confirmation
    </button>
  );
}

export function ForgotPasswordView() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await api<Message>('/auth/forgot-password', { method: 'POST', body: { email: email.trim() } });
      setResult({ tone: 'success', text: res.message });
    } catch (e) {
      setResult({ tone: 'error', text: errorMessage(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <JourneyShell>
      <Heading>Mot de passe oublié</Heading>
      <p className="text-lg">Indiquez votre email : nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
      <Card>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <TextField label="Email" type="email" name="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          {result && <Alert tone={result.tone}>{result.text}</Alert>}
          <Button type="submit" loading={loading}>
            Envoyer le lien
          </Button>
        </form>
        <p className="mt-5 text-center">
          <Link href="/auth/connexion/" className={linkClass}>
            Retour à la connexion
          </Link>
        </p>
      </Card>
    </JourneyShell>
  );
}

export function ResetPasswordView() {
  const { token, ready } = useLinkToken();
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 10) {
      setResult({ tone: 'error', text: 'Votre mot de passe doit contenir au moins 10 caractères.' });
      return;
    }
    setLoading(true);
    try {
      const res = await api<Message>('/auth/reset-password', { method: 'POST', body: { token, password } });
      setResult({ tone: 'success', text: res.message });
    } catch (e) {
      setResult({ tone: 'error', text: errorMessage(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <JourneyShell>
      <Heading>Nouveau mot de passe</Heading>
      {!ready ? (
        <LoadingBlock label="Chargement…" />
      ) : !token ? (
        <Alert>Ce lien est incomplet. Demandez un nouveau lien de réinitialisation.</Alert>
      ) : result?.tone === 'success' ? (
        <>
          <Alert tone="success">{result.text}</Alert>
          <ButtonLink href="/auth/connexion/">Se connecter</ButtonLink>
        </>
      ) : (
        <Card>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <TextField
              label="Nouveau mot de passe"
              type="password"
              name="new-password"
              autoComplete="new-password"
              required
              hint="10 caractères minimum."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {result && <Alert tone={result.tone}>{result.text}</Alert>}
            <Button type="submit" loading={loading}>
              Enregistrer
            </Button>
          </form>
        </Card>
      )}
    </JourneyShell>
  );
}

export function VerifyEmailView() {
  const { token, ready } = useLinkToken();
  const session = useSession();
  const [state, setState] = useState<{ status: 'loading' } | { status: 'done'; data: VerifyEmailResponse } | { status: 'error'; message: string }>({ status: 'loading' });
  const started = useRef(false);

  useEffect(() => {
    if (!ready || started.current) return;
    started.current = true;
    if (!token) {
      setState({ status: 'error', message: 'Ce lien est incomplet.' });
      return;
    }
    api<VerifyEmailResponse>('/auth/verify-email', { method: 'POST', body: { token } })
      .then((data) => {
        setState({ status: 'done', data });
        void session.refresh();
      })
      .catch((e) => setState({ status: 'error', message: errorMessage(e) }));
  }, [ready, token, session]);

  return (
    <JourneyShell>
      {state.status === 'loading' && (
        <>
          <Heading>Confirmation de votre email</Heading>
          <LoadingBlock label="Vérification du lien…" />
        </>
      )}
      {state.status === 'error' && (
        <>
          <Heading>Lien invalide</Heading>
          <Alert>{state.message}</Alert>
          <p className="text-lg">Si votre adresse est déjà confirmée, connectez-vous simplement.</p>
          <ButtonLink href="/auth/connexion/">Se connecter</ButtonLink>
        </>
      )}
      {state.status === 'done' && (
        <div className="flex flex-col gap-5 text-center">
          <p aria-hidden="true" className="text-6xl">
            🎉
          </p>
          <Heading>Votre adresse email est confirmée</Heading>
          <p className="text-xl text-club-ink">Votre compte {getTheme().name} est maintenant actif.</p>
          {state.data.points_awarded > 0 && (
            <p className="flex flex-wrap items-center justify-center gap-2 text-lg font-semibold text-club-ink">
              Vos <PointsBadge points={state.data.points_awarded} /> de bienvenue ont été ajoutés 🎉
            </p>
          )}
          <ButtonLink href={state.data.destination_path}>Accéder à mon espace</ButtonLink>
        </div>
      )}
    </JourneyShell>
  );
}

/** After logging in from the gamified journey: attach the anonymous win to the account. */
export function ClaimView() {
  const sessionId = useSearchParams().get('session');
  const session = useSession();
  const router = useRouter();
  const [state, setState] = useState<{ status: 'loading' } | { status: 'done'; reward: string | null; points: number } | { status: 'error'; message: string }>({ status: 'loading' });
  const started = useRef(false);

  useEffect(() => {
    if (session.status === 'anonymous') {
      router.replace(`/auth/connexion/?next=${encodeURIComponent(`/club-croquin/reclamer/?session=${sessionId ?? ''}`)}`);
      return;
    }
    if (session.status !== 'authenticated' || started.current) return;
    started.current = true;
    api<{ points_awarded: number; reward_title: string | null }>(`/games/sessions/${sessionId}/claim`, { method: 'POST', anon: true })
      .then((res) => setState({ status: 'done', reward: res.reward_title, points: res.points_awarded }))
      .catch((e) => setState({ status: 'error', message: errorMessage(e) }));
  }, [session.status, sessionId, router]);

  return (
    <JourneyShell>
      <Heading>Votre cadeau</Heading>
      {state.status === 'loading' && <LoadingBlock label="Ajout de votre cadeau…" />}
      {state.status === 'error' && <Alert>{state.message}</Alert>}
      {state.status === 'done' && (
        <Alert tone="success">🎁 {state.reward ? `« ${state.reward} » a été ajouté à vos récompenses.` : 'Votre gain a été ajouté à votre compte.'}</Alert>
      )}
      {state.status !== 'loading' && <ButtonLink href="/club/">Accéder à mon club</ButtonLink>}
    </JourneyShell>
  );
}
