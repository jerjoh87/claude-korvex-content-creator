export const supportedPlatforms = ["instagram", "facebook", "tiktok", "linkedin", "youtube", "x"] as const;
export type SocialPlatform = (typeof supportedPlatforms)[number];

export type SocialAccountStatus = "connected" | "expired" | "revoked" | "disconnected";
export type TokenHealth = "valid" | "expiring_soon" | "expired" | "missing";

export interface SocialAccount {
  id: string;
  user_id: string;
  workspace_id: string;
  platform: SocialPlatform;
  account_name: string | null;
  account_handle: string | null;
  platform_account_id: string | null;
  scopes: string[];
  expires_at: string | null;
  status: SocialAccountStatus;
  created_at: string;
  updated_at: string;
}

export interface SocialAccountCard extends SocialAccount {
  token_status: TokenHealth;
  permissions_status: "ready" | "limited" | "missing";
  manual_posting_ready: boolean;
  auto_posting_status: "available" | "pending_approval" | "disabled";
}

export interface OAuthProfile {
  platformAccountId: string;
  accountName: string;
  accountHandle: string;
}

export interface OAuthTokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes: string[];
}

export interface OAuthProvider {
  platform: SocialPlatform;
  displayName: string;
  requiredScopes: string[];
  manualPostingUrl: string;
  supportsAutoPosting: boolean;
  approvalNote: string;
  getAuthorizationUrl(state: string): string;
  /** `state` is provided for providers (e.g. X) that derive a PKCE verifier from it. */
  exchangeCodeForTokens(code: string, state?: string): Promise<OAuthTokenSet>;
  getProfile(tokens: OAuthTokenSet): Promise<OAuthProfile>;
}

export interface PostingReadiness {
  accountConnected: boolean;
  captionReady: boolean;
  mediaReady: boolean;
  manualPostingReady: boolean;
  autoPostingAvailable: boolean;
}
