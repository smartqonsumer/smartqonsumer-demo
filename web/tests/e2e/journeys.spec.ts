/**
 * Brand journeys and member area on the static build, mobile viewport, with the API
 * mocked at the network level (the real API is covered by api/tests, including the
 * end-to-end scenarios). Checks the UI flows, accessibility and the mobile layout.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Route } from '@playwright/test';

const API = 'http://localhost:8010/api/v1';
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

const consents = [
  { type: 'participation_terms', required: true, version: 'v1', label: "J'accepte le règlement de l'opération." },
  { type: 'marketing_brand', required: false, version: 'v1', label: "J'accepte de recevoir les offres de Croquin." },
];
const dogs = [
  { id: 'filou', name: 'Filou', coat: '#C98B4B' },
  { id: 'praline', name: 'Praline', coat: '#3B2A20' },
];
const segments = [
  { label: '+10', points: 10, color: '#B0002F' },
  { label: '+20', points: 20, color: '#141414' },
  { label: '+50', points: 50, color: '#6E9E00' },
  { label: '+100', points: 100, color: '#F2B705' },
];

function campaign(slug: string, journey: 'gamified' | 'simple') {
  return {
    slug,
    name: journey === 'gamified' ? 'La Grande Course Croquin' : 'Club Croquin',
    journey,
    destination_path: journey === 'gamified' ? '/club-croquin/' : '/club-croquin-simple/',
    running: true,
    end_at: null,
    registration_points: 100,
    registration_points_on: journey === 'gamified' ? 'registration' : 'email_verified',
    brand: { slug: 'croquin', name: 'Croquin', logo_url: null, theme: { preset: 'croquin' } },
    texts: {
      hero_title: journey === 'gamified' ? 'La Grande Course Croquin' : 'Rejoignez le Club Croquin',
      hero_subtitle: 'Sous-titre',
      win_title: 'Bravo ! 🎉',
      win_text: 'Votre chien a remporté la course ! Votre cadeau vous attend.',
      confirmation_title: "🎉 C'est enregistré !",
      confirmation_text: 'Votre participation a bien été prise en compte.',
      verify_title: 'Vérifiez votre boîte mail 📬',
    },
    legal_urls: { privacy: '/legal/confidentialite/', legal_notice: '/legal/mentions-legales/', rules: '/legal/reglement-club-croquin/' },
    consents,
    games: journey === 'gamified' ? [{ type: 'dog_race', name: 'Course', requires_account: false, play_limit: 'once', display: { dogs, win_points: 0 } }] : [],
  };
}

type State = { loggedIn: boolean; balance: number; eligible: boolean; rewards: { code: string; title: string }[] };

async function mockApi(page: Page, initial: Partial<State> = {}) {
  const state: State = { loggedIn: false, balance: 0, eligible: true, rewards: [], ...initial };
  const user = { id: 'u1', email: 'nina@example.com', status: 'active', email_verified: true, first_name: 'Nina', last_name: 'Martin' };
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body), headers: { 'access-control-allow-origin': 'http://127.0.0.1:4310', 'access-control-allow-credentials': 'true' } });

  await page.route(/static\.axept\.io|posthog/, (route) => route.abort());
  await page.route(`${API}/**`, async (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': 'http://127.0.0.1:4310', 'access-control-allow-credentials': 'true', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
    }
    const path = new URL(request.url()).pathname.replace('/api/v1', '');
    const body = request.postDataJSON?.() as Record<string, unknown> | undefined;
    switch (`${request.method()} ${path}`) {
      case 'GET /me':
        return state.loggedIn ? json(route, user) : json(route, { error: { code: 'not_authenticated', message: 'Veuillez vous connecter.' } }, 401);
      case 'GET /qr-codes':
        return json(route, [
          { gtin: '09506000164908', label: 'Produit A', resolver_url: 'http://localhost:8091/01/09506000164908', campaign_slug: 'croquin-dog-race', campaign_name: 'Course', journey: 'gamified', destination_path: '/club-croquin/' },
          { gtin: '09506000164915', label: 'Produit B', resolver_url: 'http://localhost:8091/01/09506000164915', campaign_slug: 'croquin-simple-loyalty', campaign_name: 'Club', journey: 'simple', destination_path: '/club-croquin-simple/' },
        ]);
      case 'GET /campaigns/croquin-dog-race':
        return json(route, campaign('croquin-dog-race', 'gamified'));
      case 'GET /campaigns/croquin-simple-loyalty':
        return json(route, campaign('croquin-simple-loyalty', 'simple'));
      case 'POST /scans':
        return json(route, {
          scan_id: 's1',
          status: state.eligible ? 'accepted' : 'already_used',
          eligible: state.eligible,
          message: state.eligible ? 'Scan validé.' : 'Ce QR Code a déjà été utilisé pour cette opération.',
          campaign_slug: String(body?.campaign_slug),
          journey: 'gamified',
          destination_path: '/club-croquin/',
        });
      case 'POST /games/dog-race/play':
        return json(route, {
          game_session_id: 'g1',
          game_type: 'dog_race',
          won: true,
          outcome: { chosen_dog: body?.choice, winner_dog: body?.choice, stumbles: { [body?.choice === 'filou' ? 'praline' : 'filou']: 1 }, obstacles: 3 },
          points_awarded: 0,
          pending_claim: true,
          reward_title: null,
          message: 'Vous avez gagné ! 🎉',
        });
      case 'POST /games/roulette/play':
        state.balance += 50;
        return json(route, { game_session_id: 'g2', game_type: 'roulette', won: true, outcome: { segment_index: 2, label: '+50' }, points_awarded: 50, pending_claim: false, reward_title: null, message: 'Vos 50 points ont été ajoutés 🎉' });
      case 'POST /auth/register': {
        const gamified = body?.campaign_slug === 'croquin-dog-race';
        state.loggedIn = gamified;
        if (gamified) state.balance = 100;
        return json(route, { user: { ...user, status: 'pending_email_verification', email_verified: false }, logged_in: gamified, email_verification_required: true, points_awarded: gamified ? 100 : 0, reward_title: gamified ? 'Friandise offerte' : null, destination_path: gamified ? '/club/' : '/club-croquin-simple/' }, 201);
      }
      case 'POST /auth/verify-email':
        state.loggedIn = true;
        state.balance = 100;
        return json(route, { user, points_awarded: 100, destination_path: '/club/' });
      case 'GET /loyalty/summary':
        return json(route, { brand_slug: 'croquin', balance: state.balance, next_reward: state.balance < 250 ? { title: 'Réduction de 10 %', cost_points: 250, missing_points: 250 - state.balance, progress: state.balance / 250 } : null });
      case 'GET /loyalty/earning-actions':
        return json(route, { profile: [{ code: 'pet.name', kind: 'profile_field', label: 'Prénom', description: null, points: 20, done: false }], games: [{ type: 'roulette', slug: 'roulette', name: 'Roue de la chance', campaign_slug: 'croquin-simple-loyalty', play_limit: 'once_per_day', can_play: true, message: null, points_hint: "Jusqu'à +100 points", display: { segments } }] });
      case 'GET /games':
        return json(route, [{ type: 'roulette', slug: 'roulette', name: 'Roue de la chance', campaign_slug: 'croquin-simple-loyalty', play_limit: 'once_per_day', can_play: true, message: null, points_hint: "Jusqu'à +100 points", display: { segments } }]);
      case 'GET /rewards':
        return json(route, [{ id: 'r1', slug: 'livraison-offerte', title: 'Livraison offerte', description: 'Frais de port offerts.', cost_points: 100, affordable: state.balance >= 100, in_stock: true }]);
      case 'POST /rewards/r1/redeem':
        state.balance -= 100;
        state.rewards.push({ code: 'DEMO-CROQ-LIV-0001', title: 'Livraison offerte' });
        return json(route, { redemption_id: 'rr1', reward_title: 'Livraison offerte', code: 'DEMO-CROQ-LIV-0001', cost_points: 100, balance: state.balance, expires_at: null });
      case 'GET /rewards/my':
        return json(route, state.rewards.map((r, i) => ({ redemption_id: `rr${i}`, reward_title: r.title, reward_description: null, code: r.code, status: 'assigned', source: 'points', cost_points: 100, granted_at: '2026-10-07T10:00:00Z', expires_at: null, used_at: null })));
      default:
        return json(route, { error: { code: 'not_found', message: 'Introuvable' } }, 404);
    }
  });
  return state;
}

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = results.violations.map((v) => ({ id: v.id, help: v.help, targets: v.nodes.map((n) => n.target.join(' ')) }));
  expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });

test('the /qr page shows two QR codes pointing to the GS1 resolver', async ({ page }) => {
  await mockApi(page);
  await page.goto('/qr/');
  await expect(page.getByRole('img', { name: /QR code du parcours/ })).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'Ouvrir ce parcours dans le navigateur' }).first()).toHaveAttribute('href', 'http://localhost:8091/01/09506000164908');
  await expectAccessible(page);
  await expectNoHorizontalScroll(page);
});

test('scenario A: scan → dog race won → registration → confirmation → club', async ({ page }) => {
  await mockApi(page);
  await page.goto('/club-croquin/?gtin=09506000164908&src=gs1');
  await expect(page.getByRole('button', { name: /Filou/ })).toBeVisible();
  await expectAccessible(page);
  await expectNoHorizontalScroll(page);

  await page.getByRole('button', { name: /Praline/ }).click();
  await page.getByRole('button', { name: 'Lancer la course avec Praline' }).click();
  await expect(page.getByRole('heading', { name: 'Bravo ! 🎉' })).toBeVisible();

  // Required consent is enforced client-side too, optional marketing is unticked by default.
  await page.getByRole('textbox', { name: 'Prénom' }).fill('Nicolas');
  await page.getByRole('textbox', { name: 'Nom', exact: true }).fill('Demo');
  await page.getByRole('textbox', { name: 'Email' }).fill('nicolas@example.com');
  await page.getByLabel('Mot de passe').fill('Croquin-demo-2026');
  await expect(page.getByRole('checkbox', { name: /recevoir les offres/ })).not.toBeChecked();
  await page.getByRole('button', { name: 'Recevoir mon cadeau' }).click();
  await expect(page.getByText('Cette case est nécessaire pour participer.')).toBeVisible();
  await page.getByRole('checkbox', { name: /règlement/ }).check();
  await expectAccessible(page);
  await page.getByRole('button', { name: 'Recevoir mon cadeau' }).click();

  await expect(page.getByRole('heading', { name: /C'est enregistré/ })).toBeVisible();
  await expect(page.getByText('+100 pts')).toBeVisible();
  await expect(page.getByText(/Friandise offerte/)).toBeVisible();
  await expect(page.getByRole('heading', { name: "Continuez l'aventure" })).toBeVisible();
  await page.getByRole('link', { name: 'Accéder à mon club' }).click();
  await expect(page.getByRole('heading', { name: 'Bonjour Nina 👋' })).toBeVisible();
  await expect(page.getByText('Plus que')).toContainText('150 points');
});

test('an already used QR code gets a clear functional message', async ({ page }) => {
  await mockApi(page, { eligible: false });
  await page.goto('/club-croquin/?gtin=09506000164908&src=gs1');
  await expect(page.getByText('Ce QR Code a déjà été utilisé pour cette opération.')).toBeVisible();
  await expect(page.getByRole('button', { name: /Lancer la course/ })).toHaveCount(0);
});

test('scenario B: simple club registration → check email → verified → wheel → reward', async ({ page }) => {
  await mockApi(page);
  await page.goto('/club-croquin-simple/?gtin=09506000164915&src=gs1');
  await expect(page.getByRole('heading', { name: 'Rejoignez le Club Croquin' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Prénom' }).fill('Nina');
  await page.getByRole('textbox', { name: 'Nom', exact: true }).fill('Martin');
  await page.getByRole('textbox', { name: 'Email' }).fill('nina@example.com');
  await page.getByLabel('Mot de passe').fill('Croquin-demo-2026');
  await page.getByRole('checkbox', { name: /règlement/ }).check();
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(page.getByRole('heading', { name: /Vérifiez votre boîte mail/ })).toBeVisible();
  await expectNoHorizontalScroll(page);

  await page.goto('/verify-email/#token=un-jeton-de-test-suffisamment-long');
  await expect(page.getByRole('heading', { name: 'Votre adresse email est confirmée' })).toBeVisible();
  await expect(page.getByText(/maintenant actif/)).toBeVisible();
  await page.getByRole('link', { name: 'Accéder à mon espace' }).click();
  await expect(page.getByRole('link', { name: 'Mon solde : 100 points' })).toBeVisible();

  await page.goto('/club/jeux/roue/');
  await page.getByRole('button', { name: 'Lancer la roue' }).click();
  await expect(page.getByText('Vos 50 points ont été ajoutés 🎉')).toBeVisible();
  await expect(page.getByText('Vous pourrez rejouer demain.')).toBeVisible();
  await expectAccessible(page);

  await page.goto('/club/recompenses/');
  await page.getByRole('button', { name: 'Échanger mes points' }).click();
  await page.getByRole('button', { name: 'Confirmer' }).click();
  await expect(page.getByText('DEMO-CROQ-LIV-0001').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copier le code' })).toBeVisible();
  await expectAccessible(page);
  await expectNoHorizontalScroll(page);
});

test('the member area redirects visitors to the login page', async ({ page }) => {
  await mockApi(page);
  await page.goto('/club/points/');
  await expect(page).toHaveURL(/\/auth\/connexion\/\?next=/);
  await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
  await expectAccessible(page);
});
