import { appUrl, getRequiredEnv } from "../oauth";
import { platformConfig } from "../config";
import type { OAuthProfile, OAuthProvider, OAuthTokenSet } from "../types";

export class LinkedInProvider implements OAuthProvider {
  platform = "linkedin" as const;
  displayName = platformConfig.linkedin.label;
  requiredScopes = platformConfig.linkedin.requiredScopes;
  manualPostingUrl = platformConfig.linkedin.manualPostingUrl;
  supportsAutoPosting = false;
  approvalNote = platformConfig.linkedin.approvalNote;

  getAuthorizationUrl(state: string): string {
    const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
    url.searchParams.set("client_id", getRequiredEnv("LINKEDIN_CLIENT_ID"));
    url.searchParams.set("redirect_uri", appUrl("/api/social/oauth/linkedin/callback"));
    url.searchParams.set("state", state);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", this.requiredScopes.join(" "));
    return url.toString();
  }

  async exchangeCodeForTokens(code: string): Promise<OAuthTokenSet> {
    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: getRequiredEnv("LINKEDIN_CLIENT_ID"),
        client_secret: getRequiredEnv("LINKEDIN_CLIENT_SECRET"),
        code,
        grant_type: "authorization_code",
        redirect_uri: appUrl("/api/social/oauth/linkedin/callback")
      })
    });
    if (!response.ok) throw new Error(`LinkedIn token exchange failed: ${response.status}`);
    const json = await response.json() as { access_token: string; expires_in?: number; scope?: string };
    return {
      accessToken: json.access_token,
      expiresAt: json.expires_in ? new Date(Date.now() + json.expires_in * 1000) : undefined,
      scopes: json.scope?.split(" ") ?? this.requiredScopes
    };
  }

  async getProfile(tokens: OAuthTokenSet): Promise<OAuthProfile> {
    const response = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.accessToken}` }
    });
    if (!response.ok) throw new Error(`LinkedIn profile lookup failed: ${response.status}`);
    const json = await response.json() as { sub: string; name?: string; localizedFirstName?: string; localizedLastName?: string };
    const name = json.name ?? [json.localizedFirstName, json.localizedLastName].filter(Boolean).join(" ") ?? "LinkedIn Member";
    return { platformAccountId: json.sub, accountName: name, accountHandle: name };
  }
}
