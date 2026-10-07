'use client';

/**
 * Member session on the client. The session token itself is an HttpOnly cookie the
 * JavaScript never sees: this context only knows *who* is logged in, from GET /me.
 * Route protection here is UX only — the API checks the session on every request.
 */
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ApiError, api } from '@/lib/api/client';
import type { UserPublic } from '@/lib/api/types';

type SessionState =
  | { status: 'loading'; user: null }
  | { status: 'anonymous'; user: null }
  | { status: 'authenticated'; user: UserPublic }
  | { status: 'error'; user: null };

type SessionContext = SessionState & { refresh: () => Promise<void>; logout: () => Promise<void> };

const Context = createContext<SessionContext | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: 'loading', user: null });

  const refresh = useCallback(async () => {
    try {
      const user = await api<UserPublic>('/me');
      setState({ status: 'authenticated', user });
    } catch (error) {
      setState(error instanceof ApiError && error.status === 401 ? { status: 'anonymous', user: null } : { status: 'error', user: null });
    }
  }, []);

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
    setState({ status: 'anonymous', user: null });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return <Context.Provider value={{ ...state, refresh, logout }}>{children}</Context.Provider>;
}

export function useSession(): SessionContext {
  const value = useContext(Context);
  if (!value) throw new Error('useSession must be used inside <SessionProvider>');
  return value;
}

/** Redirects anonymous visitors to the login page, then back here. */
export function useRequireMember(): SessionContext {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (session.status === 'anonymous') {
      router.replace(`/auth/connexion/?next=${encodeURIComponent(pathname)}`);
    }
  }, [session.status, router, pathname]);
  return session;
}

/** Only same-site relative paths are accepted as post-login destinations. */
export function safeNext(next: string | null, fallback = '/club/'): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}
