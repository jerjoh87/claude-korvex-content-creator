import { getSupabaseAdmin } from "../supabaseServer";
import { encryptSecret } from "./crypto";
import { platformConfig } from "./config";
import type { OAuthProfile, OAuthTokenSet, SocialAccount, SocialAccountCard, SocialPlatform, TokenHealth } from "./types";

function tokenHealth(expiresAt: string | null): TokenHealth {
  if (!expiresAt) return "valid";
  const expires = new Date(expiresAt).getTime();
  if (Number.isNaN(expires)) return "missing";
  const now = Date.now();
  if (expires <= now) return "expired";
  return expires - now < 1000 * 60 * 60 * 24 * 14 ? "expiring_soon" : "valid";
}

function permissionsStatus(platform: SocialPlatform, scopes: string[]) {
  const required = platformConfig[platform].requiredScopes;
  if (required.every((scope) => scopes.includes(scope))) return "ready" as const;
  return scopes.length > 0 ? "limited" as const : "missing" as const;
}

export function decorateSocialAccount(account: SocialAccount): SocialAccountCard {
  const health = tokenHealth(account.expires_at);
  return {
    ...account,
    token_status: health,
    permissions_status: permissionsStatus(account.platform, account.scopes ?? []),
    manual_posting_ready: account.status === "connected" && health !== "expired",
    auto_posting_status: process.env.ENABLE_SOCIAL_AUTO_POSTING === "true"
      ? "available"
      : platformConfig[account.platform].autoPostingStatus
  };
}

export async function listSocialAccounts(userId: string, workspaceId: string): Promise<SocialAccountCard[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("social_accounts")
    .select("id,user_id,workspace_id,platform,account_name,account_handle,platform_account_id,scopes,expires_at,status,created_at,updated_at")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown[]).map((row) => decorateSocialAccount(row as SocialAccount));
}

export async function upsertSocialAccount(input: {
  userId: string;
  workspaceId: string;
  platform: SocialPlatform;
  tokens: OAuthTokenSet;
  profile: OAuthProfile;
}) {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const payload = {
    user_id: input.userId,
    workspace_id: input.workspaceId,
    platform: input.platform,
    account_name: input.profile.accountName,
    account_handle: input.profile.accountHandle,
    platform_account_id: input.profile.platformAccountId,
    access_token_encrypted: encryptSecret(input.tokens.accessToken),
    refresh_token_encrypted: input.tokens.refreshToken ? encryptSecret(input.tokens.refreshToken) : null,
    scopes: input.tokens.scopes,
    expires_at: input.tokens.expiresAt?.toISOString() ?? null,
    status: "connected",
    updated_at: now
  };

  const { data, error } = await supabase
    .from("social_accounts")
    .upsert(payload, { onConflict: "user_id,workspace_id,platform,platform_account_id" })
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function disconnectSocialAccount(id: string, userId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("social_accounts")
    .update({ status: "disconnected", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}
