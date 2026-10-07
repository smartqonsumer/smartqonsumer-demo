/**
 * SmartQonsumer API client (browser only).
 *
 * - The session lives in an HttpOnly cookie set by the API: nothing sensitive is kept in
 *   localStorage, requests just send `credentials: 'include'`.
 * - The anonymous visitor token (scan tracking, see lib/api/anon.ts) travels in a header.
 * - Errors are always `ApiError` with a French message meant for the consumer; a raw
 *   technical error is never shown.
 */
import { getAnonToken } from './anon';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8010/api/v1').replace(/\/$/, '');

export const GENERIC_ERROR = 'Une erreur est survenue. Veuillez réessayer.';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | undefined>;
  idempotencyKey?: string;
  anon?: boolean;
  signal?: AbortSignal;
};

export async function api<T>(path: string, { method = 'GET', body, query, idempotencyKey, anon, signal }: Options = {}): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, value);
  }
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  if (anon) {
    const token = getAnonToken();
    if (token) headers['X-Anon-Token'] = token;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'include',
      signal,
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new ApiError(0, 'network_error', 'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.');
  }

  const data = (await response.json().catch(() => null)) as
    | (T & { error?: { code: string; message: string; details?: Record<string, unknown> } })
    | null;
  if (!response.ok) {
    const error = data?.error;
    throw new ApiError(response.status, error?.code ?? 'http_error', error?.message ?? GENERIC_ERROR, error?.details);
  }
  return data as T;
}

/** Message to display for any caught error. */
export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : GENERIC_ERROR;
}

export function newIdempotencyKey(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
