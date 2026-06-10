import { appUrl, getRequiredEnv } from "../oauth";
import { platformConfig } from "../config";
import type { OAuthProfile, OAuthProvider, OAuthTokenSet } from "../types";

export class TikTokProvider implements OAuthProvider {
  platform = "tiktok" as const;
  displayName = platformConfig.tiktok.label;
  requiredScopes = platformConfig.tiktok.requiredScopes;
  manualPostingUrl = platformConfig.tiktok.manualPostingUrl;
  supportsAutoPosting = false;
  approvalNote = platformConfig.tiktok.approvalNote;

  getAuthorizationUrl(state: string): string {
    const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
    url.searchParams.set("client_key", getRequiredEnv("TIKTOK_CLIENT_KEY"));
    url.searchParams.set("redirect_uri", appUrl("/api/social/oauth/tiktok/callback"));
    url.searchParams.set("state", state);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", this.requiredScopes.join(","));
    return url.toString();
  }

  async exchangeCodeForTokens(code: string): Promise<OAuthTokenSet> {
    const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: getRequiredEnv("TIKTOK_CLIENT_KEY"),
        client_secret: getRequiredEnv("TIKTOK_CLIENT_SECRET"),
        code,
        grant_type: "authorization_code",
        redirect_uri: appUrl("/api/social/oauth/tiktok/callback")
      })
    });
    if (!response.ok) throw new Error(`TikTok token exchange failed: ${response.status}`);
    const json = await response.json() as { access_token: string; refresh_token?: string; expires_in?: number; scope?: string };
    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresAt: json.expires_in ? new Date(Date.now() + json.expires_in * 1000) : undefined,
      scopes: json.scope?.split(",") ?? this.requiredScopes
    };
  }

  async getProfile(tokens: OAuthTokenSet): Promise<OAuthProfile> {
    const response = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username", {
      headers: { Authorization: `Bearer ${tokens.accessToken}` }
    });
    if (!response.ok) throw new Error(`TikTok profile lookup failed: ${response.status}`);
    const json = await response.json() as { data?: { user?: { open_id: string; display_name: string; username?: string } } };
    const user = json.data?.user;
    if (!user) throw new Error("TikTok profile response missing user.");
    return { platformAccountId: user.open_id, accountName: user.display_name, accountHandle: user.username ?? user.display_name };
  }
}
