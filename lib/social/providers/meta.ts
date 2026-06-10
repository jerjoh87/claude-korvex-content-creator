import { appUrl, getRequiredEnv } from "../oauth";
import { platformConfig } from "../config";
import type { OAuthProfile, OAuthProvider, OAuthTokenSet, SocialPlatform } from "../types";

export class MetaProvider implements OAuthProvider {
  platform: SocialPlatform;
  displayName: string;
  requiredScopes: string[];
  manualPostingUrl: string;
  supportsAutoPosting = false;
  approvalNote: string;

  constructor(platform: "instagram" | "facebook") {
    this.platform = platform;
    this.displayName = platformConfig[platform].label;
    this.requiredScopes = platformConfig[platform].requiredScopes;
    this.manualPostingUrl = platformConfig[platform].manualPostingUrl;
    this.approvalNote = platformConfig[platform].approvalNote;
  }

  getAuthorizationUrl(state: string): string {
    const url = new URL("https://www.facebook.com/v20.0/dialog/oauth");
    url.searchParams.set("client_id", getRequiredEnv("META_CLIENT_ID"));
    url.searchParams.set("redirect_uri", appUrl(`/api/social/oauth/${this.platform}/callback`));
    url.searchParams.set("state", state);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", this.requiredScopes.join(","));
    return url.toString();
  }

  async exchangeCodeForTokens(code: string): Promise<OAuthTokenSet> {
    const response = await fetch("https://graph.facebook.com/v20.0/oauth/access_token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: getRequiredEnv("META_CLIENT_ID"),
        client_secret: getRequiredEnv("META_CLIENT_SECRET"),
        redirect_uri: appUrl(`/api/social/oauth/${this.platform}/callback`),
        code
      })
    });
    if (!response.ok) throw new Error(`Meta token exchange failed: ${response.status}`);
    const json = await response.json() as { access_token: string; expires_in?: number; scope?: string };
    return {
      accessToken: json.access_token,
      expiresAt: json.expires_in ? new Date(Date.now() + json.expires_in * 1000) : undefined,
      scopes: json.scope?.split(",") ?? this.requiredScopes
    };
  }

  async getProfile(tokens: OAuthTokenSet): Promise<OAuthProfile> {
    const response = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${tokens.accessToken}`);
    if (!response.ok) throw new Error(`Meta profile lookup failed: ${response.status}`);
    const json = await response.json() as { id: string; name: string };
    return { platformAccountId: json.id, accountName: json.name, accountHandle: json.name };
  }
}
