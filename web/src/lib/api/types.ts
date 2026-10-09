/** Types of the SmartQonsumer API responses (mirrors api/app/schemas). */

export type BrandPublic = {
  slug: string;
  name: string;
  logo_url: string | null;
  theme: { preset?: string };
};

export type ConsentDefinition = { type: string; required: boolean; version: string; label: string };

export type DogRaceDisplay = { dogs: { id: string; name: string; coat?: string }[]; win_points: number };
export type RouletteDisplay = { segments: { label: string; points: number; color: string | null }[] };

export type GamePublic = {
  type: 'dog_race' | 'roulette';
  name: string;
  requires_account: boolean;
  play_limit: string;
  display: Record<string, unknown>;
};

export type CampaignPublic = {
  slug: string;
  name: string;
  journey: 'gamified' | 'simple';
  destination_path: string;
  running: boolean;
  end_at: string | null;
  registration_points: number;
  registration_points_on: 'registration' | 'email_verified';
  brand: BrandPublic;
  texts: Record<string, string>;
  legal_urls: Record<string, string>;
  consents: ConsentDefinition[];
  games: GamePublic[];
};

export type DemoQrCode = {
  gtin: string;
  label: string;
  resolver_url: string;
  campaign_slug: string;
  campaign_name: string;
  journey: 'gamified' | 'simple';
  destination_path: string;
};

export type ScanResponse = {
  scan_id: string;
  status: 'accepted' | 'already_used' | 'campaign_inactive';
  eligible: boolean;
  message: string;
  campaign_slug: string;
  journey: string;
  destination_path: string;
  /** Demo: the visitor may replay this already used QR Code (POST /scans with bypass). */
  bypass_available: boolean;
};

export type UserPublic = {
  id: string;
  email: string;
  status: 'pending_email_verification' | 'active' | 'deleted';
  email_verified: boolean;
  first_name: string | null;
  last_name: string | null;
};

export type RegistrationResponse = {
  user: UserPublic;
  logged_in: boolean;
  email_verification_required: boolean;
  points_awarded: number;
  reward_title: string | null;
  destination_path: string;
};

export type VerifyEmailResponse = { user: UserPublic; points_awarded: number; destination_path: string };

export type GamePlayResponse = {
  game_session_id: string;
  game_type: 'dog_race' | 'roulette';
  won: boolean;
  outcome: Record<string, unknown>;
  points_awarded: number;
  pending_claim: boolean;
  reward_title: string | null;
  message: string;
};

export type DogRaceOutcome = {
  chosen_dog: string;
  winner_dog: string;
  stumbles: Record<string, number>;
  obstacles: number;
};

export type RouletteOutcome = { segment_index: number; label: string };

export type LoyaltySummary = {
  brand_slug: string;
  balance: number;
  next_reward: { title: string; cost_points: number; missing_points: number; progress: number } | null;
};

export type PointTransaction = {
  id: string;
  amount: number;
  balance_after: number;
  type: string;
  source_type: string;
  description: string;
  created_at: string;
};

export type EarningAction = {
  code: string;
  kind: string;
  label: string;
  description: string | null;
  points: number;
  done: boolean;
};

export type MemberGame = {
  type: 'dog_race' | 'roulette';
  slug: string;
  name: string;
  campaign_slug: string;
  play_limit: string;
  can_play: boolean;
  message: string | null;
  points_hint: string;
  display: Record<string, unknown>;
};

export type EarningActions = { profile: EarningAction[]; games: MemberGame[] };

export type Reward = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cost_points: number;
  affordable: boolean;
  in_stock: boolean;
};

export type RedemptionResponse = {
  redemption_id: string;
  reward_title: string;
  code: string;
  cost_points: number;
  balance: number;
  expires_at: string | null;
};

export type MyReward = {
  redemption_id: string;
  reward_title: string;
  reward_description: string | null;
  code: string;
  status: 'available' | 'assigned' | 'used' | 'expired';
  source: 'points' | 'game_win';
  cost_points: number;
  granted_at: string;
  expires_at: string | null;
  used_at: string | null;
};

export type Pet = {
  name: string | null;
  age_years: number | null;
  size: 'small' | 'medium' | 'large' | null;
  breed: string | null;
  food_preferences: string | null;
};

export type Profile = {
  email: string;
  email_verified: boolean;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  city: string | null;
  has_dog: boolean | null;
  dog_count: number | null;
  pet: Pet | null;
};

export type ProfileUpdateResponse = { profile: Profile; points_awarded: number; balance: number };

export type ConsentState = {
  type: string;
  version: string;
  granted: boolean;
  active: boolean;
  date: string;
  withdrawn_at: string | null;
};

export type Message = { message: string };
