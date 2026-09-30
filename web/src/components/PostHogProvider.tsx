'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { posthogConfig } from '@/lib/site-config';

function PostHogPageview(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !posthog.__loaded) return;
    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    posthog.capture('$pageview', { $current_url: `${window.location.origin}${url}` });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (posthog.__loaded) return;
    posthog.init(posthogConfig.key, {
      api_host: posthogConfig.host,
      person_profiles: 'identified_only',
      capture_exceptions: true, // Error Tracking: auto-capture uncaught errors and unhandled rejections
      capture_pageview: false, // pageviews are captured manually below, on App Router navigations
      opt_out_capturing_by_default: true, // no capture until Axeptio confirms consent, see AxeptioScripts
    });
    window.posthog = posthog;
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </>
  );
}
