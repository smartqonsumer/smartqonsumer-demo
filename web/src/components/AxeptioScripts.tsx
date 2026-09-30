import Script from 'next/script';

/**
 * Axeptio CMP: loads the widget SDK, then gates PostHog capture behind the
 * "posthog" vendor consent choice.
 *
 * `window.axeptioSettings` itself is set from the root layout (see
 * `app/layout.tsx`) — Next.js only allows `beforeInteractive` scripts there.
 *
 * NB: this vendor key must match the technical "Nom" slug configured for the
 * vendor in the Axeptio backoffice (case-sensitive) — not the display "Titre".
 */
export function AxeptioScripts() {
  return (
    <>
      <Script id="axeptio-sdk" src="https://static.axept.io/sdk.js" strategy="afterInteractive" />
      <Script id="axeptio-consent-gate" strategy="afterInteractive">
        {`
          window._axcb = window._axcb || [];
          window._axcb.push(function(axeptio) {
            axeptio.on("cookies:complete", function(choices) {
              if (!window.posthog) return;
              if (choices.posthog) { window.posthog.opt_in_capturing(); }
              else { window.posthog.opt_out_capturing(); }
            });
          });
        `}
      </Script>
    </>
  );
}
