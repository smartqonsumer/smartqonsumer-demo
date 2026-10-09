'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, errorMessage, newIdempotencyKey } from '@/lib/api/client';
import type { CampaignPublic, ScanResponse } from '@/lib/api/types';

type Loadable<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error'; message: string };

export function useCampaign(slug: string): Loadable<CampaignPublic> {
  const [state, setState] = useState<Loadable<CampaignPublic>>({ status: 'loading' });
  useEffect(() => {
    const controller = new AbortController();
    api<CampaignPublic>(`/campaigns/${slug}`, { signal: controller.signal })
      .then((data) => setState({ status: 'ready', data }))
      .catch((e: Error) => e.name !== 'AbortError' && setState({ status: 'error', message: errorMessage(e) }));
    return () => controller.abort();
  }, [slug]);
  return state;
}

export type ScanState =
  | { status: 'loading' }
  | { status: 'none' } // page opened without coming from a QR code
  | { status: 'done'; scan: ScanResponse }
  | { status: 'error'; message: string };

/** Idempotency-Key of the tab's scan; `fresh` starts a new scan (demo replay) and keeps
 * it for the next reloads. */
function scanKey(gtin: string, serial: string | null, fresh = false): string {
  const storageKey = `sq_scan_${gtin}_${serial ?? ''}`;
  try {
    const existing = window.sessionStorage.getItem(storageKey);
    if (existing && !fresh) return existing;
    const key = newIdempotencyKey('scan');
    window.sessionStorage.setItem(storageKey, key);
    return key;
  } catch {
    return newIdempotencyKey('scan');
  }
}

/**
 * Records the scan the GS1 resolver redirected here (?gtin=…&ser=…&src=gs1).
 * The Idempotency-Key is kept per tab: reloading the page replays the same verdict
 * instead of reporting a "double scan"; a new scan (new tab, other device) does not.
 */
export function useScanFromUrl(campaignSlug: string): ScanState & { bypass: () => void } {
  const params = useSearchParams();
  const gtin = params.get('gtin');
  const serial = params.get('ser');
  const source = params.get('src') === 'gs1' ? 'gs1_resolver' : 'direct_link';
  const [state, setState] = useState<ScanState>({ status: 'loading' });
  const started = useRef(false);

  const send = useCallback(
    (bypass: boolean) => {
      if (!gtin) return;
      api<ScanResponse>('/scans', {
        method: 'POST',
        anon: true,
        idempotencyKey: scanKey(gtin, serial, bypass),
        body: { gtin, serial: serial ?? undefined, campaign_slug: campaignSlug, source, bypass },
      })
        .then((scan) => setState({ status: 'done', scan }))
        .catch((e) => setState({ status: 'error', message: errorMessage(e) }));
    },
    [gtin, serial, source, campaignSlug],
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!gtin) setState({ status: 'none' });
    else send(false);
  }, [gtin, send]);

  /** Demo: replays an already used QR Code as a new, eligible scan. */
  const bypass = useCallback(() => {
    setState({ status: 'loading' });
    send(true);
  }, [send]);

  return { ...state, bypass };
}
