import { appUrl, getRequiredEnv } from "../oauth";
import { platformConfig } from "../config";
import type { OAuthProfile, OAuthProvider, OAuthTokenSet } from "../types";

export class YouTubeProvider implements OAuthProvider {
  platform = "youtube" as const;
  displayName = platformConfig.youtube.label;
  requiredScopes = platformConfig.youtube.requiredScopes;
  manualPostingUrl = platformConfig.youtube.manualPostingUrl;
  supportsAutoPosting = false;
  approvalNote = platformConfig.youtube.approvalNote;

  getAuthorizationUrl(state: string): string {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", getRequiredEnv("GOOGLE_CLIENT_ID"));
    url.searchParams.set("redirect_uri", appUrl("/api/social/oauth/youtube/callback"));
    url.searchParams.set("state", state);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("scope", this.requiredScopes.join(" "));
    return url.toString();
  }

  async exchangeCodeForTokens(code: string): Promise<OAuthTokenSet> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: getRequiredEnv("GOOGLE_CLIENT_ID"),
        client_secret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
        code,
        grant_type: "authorization_code",
        redirect_uri: appUrl("/api/social/oauth/youtube/callback")
      })
    });
    if (!response.ok) throw new Error(`Google token exchange failed: ${response.status}`);
    const json = await response.json() as { access_token: string; refresh_token?: string; expires_in?: number; scope?: string };
    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresAt: json.expires_in ? new Date(Date.now() + json.expires_in * 1000) : undefined,
      scopes: json.scope?.split(" ") ?? this.requiredScopes
    };
  }

  async getProfile(tokens: OAuthTokenSet): Promise<OAuthProfile> {
    const response = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
      headers: { Authorization: `Bearer ${tokens.accessToken}` }
    });
    if (!response.ok) throw new Error(`YouTube channel lookup failed: ${response.status}`);
    const json = await response.json() as { items?: Array<{ id: string; snippet?: { title?: string; customUrl?: string } }> };
    const channel = json.items?.[0];
    if (!channel) throw new Error("No YouTube channel found for the authorized Google account.");
    return {
      platformAccountId: channel.id,
      accountName: channel.snippet?.title ?? "YouTube Channel",
      accountHandle: channel.snippet?.customUrl ?? channel.snippet?.title ?? "YouTube Channel"
    };
  }
}
