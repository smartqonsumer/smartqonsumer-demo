/**
 * Anonymous visitor token (ported from smartqonsumer-poc-qr-scan-checker): a random UUID
 * kept in localStorage so the API can recognise a re-scan from the same browser. It is
 * not a fingerprint and holds no personal data; the API only stores a hash of it.
 */
const KEY = 'sq_anon_token';

let memoryToken: string | null = null;

export function getAnonToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    let token = window.localStorage.getItem(KEY);
    if (!token) {
      token = crypto.randomUUID();
      window.localStorage.setItem(KEY, token);
    }
    return token;
  } catch {
    // Storage blocked (private mode, strict settings): keep a per-tab token.
    memoryToken ??= crypto.randomUUID();
    return memoryToken;
  }
}
